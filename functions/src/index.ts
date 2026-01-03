import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';
import { logError } from './logger';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize OpenAI (lazily to avoid config errors during deployment)
const getOpenAI = () => {
  // Try environment variable first, then legacy config
  const apiKey = process.env.OPENAI_API_KEY || functions.config().openai?.key;
  if (!apiKey) {
    logError('OpenAI API key not found in environment or config');
    logError('Environment keys', {
      keys: Object.keys(process.env).filter((k) => k.includes('OPENAI')),
    });
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({ apiKey });
};

// System prompt for I Ching interpretations
const SYSTEM_PROMPT = `You are a modern I Ching interpreter who makes ancient wisdom accessible to everyone.
Your tone is warm, insightful, and practical—never mystical or overly formal.

Structure your response in these sections:
1. **Overview**: Brief explanation of the hexagram's core meaning (2-3 sentences)
2. **Current Situation** (Primary Hexagram): What the querent is experiencing now
3. **The Transformation** (if changing lines exist): What the changing lines reveal
4. **Where Things Are Heading** (Relating Hexagram): The likely evolution of the situation
5. **Practical Guidance**: 2-3 gentle, actionable suggestions
6. **Summary**: One sentence capturing the essential message

Guidelines:
- Use everyday language, avoid jargon
- Give concrete examples when helpful
- Frame advice as suggestions, not commands
- If a question was asked, weave it naturally into your interpretation
- If no question was provided, offer a general life reading
- Keep total response between 300-500 words`;

interface InterpretationRequest {
  primaryHexagram: {
    number: number;
    englishName: string;
    chineseName: string;
  };
  relatingHexagram: {
    number: number;
    englishName: string;
    chineseName: string;
  } | null;
  changingLines: number[];
  question?: string;
  readingId: string;
}

interface UserData {
  lastFreeReading?: {
    toMillis: () => number;
  } | null;
  credits: number;
  subscription?: {
    status: string;
    monthlyReadingsUsed: number;
  };
}

// Main function to generate AI interpretation
export const generateInterpretation = functions
  .region('us-central1') // Single region deployment
  .runWith({
    secrets: ['OPENAI_API_KEY'],
  })
  .https.onCall(async (data: InterpretationRequest, context) => {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to request an interpretation.'
      );
    }

    const userId = context.auth.uid;
    const { primaryHexagram, relatingHexagram, changingLines, question, readingId } = data;

    try {
      // Check if user has credits or active subscription
      const userDoc = await admin.firestore().collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User document not found'
        );
      }

      const userData = userDoc.data() as UserData;
      const hasCredits = userData.credits > 0;
      const hasActiveSubscription = userData.subscription?.status === 'active';
      const canUseFreeReading = await checkFreeReadingAvailability(userId, userData);

      // Check if user can make a reading
      if (!hasCredits && !hasActiveSubscription && !canUseFreeReading) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'No credits or active subscription available'
        );
      }

      // Construct user prompt
      const userPrompt = buildUserPrompt(primaryHexagram, relatingHexagram, changingLines, question);

      // Create reference to Realtime Database for streaming
      const rtdbRef = admin.database().ref(`readings/${userId}/${readingId}`);

      // Initialize the reading document
      await rtdbRef.set({
        content: '',
        status: 'streaming',
        startedAt: admin.database.ServerValue.TIMESTAMP,
      });

      let fullContent = '';

      // Stream OpenAI response
      const openai = getOpenAI();
      const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        stream: true,
        max_tokens: 800,
        temperature: 0.7,
      });

      // Process stream chunks
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          // Update Realtime Database with accumulated content
          await rtdbRef.update({
            content: fullContent,
          });
        }
      }

      // Mark as complete
      await rtdbRef.update({
        status: 'complete',
        completedAt: admin.database.ServerValue.TIMESTAMP,
      });

      // Deduct credit or update subscription usage
      await deductCredit(userId, hasActiveSubscription, canUseFreeReading);

      // Update analytics
      await admin.firestore().collection('users').doc(userId).update({
        'analytics.totalCasts': admin.firestore.FieldValue.increment(1),
      });

      return {
        success: true,
        readingId,
        message: 'Interpretation generated successfully',
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError('Error generating interpretation', { error });

      // Update status to error
      try {
        await admin.database().ref(`readings/${userId}/${readingId}`).update({
          status: 'error',
          error: errorMessage,
        });
      } catch (dbError) {
        logError('Failed to update error status', { error: dbError });
      }

      // Rethrow as Firebase error
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate interpretation',
        errorMessage
      );
    }
  });

// Check if user can use their free daily reading
async function checkFreeReadingAvailability(
  userId: string,
  userData: UserData
): Promise<boolean> {
  const lastFreeReading = userData.lastFreeReading?.toMillis() || 0;
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  return (now - lastFreeReading) >= twentyFourHours;
}

// Deduct credit or update free reading timestamp
async function deductCredit(userId: string, hasActiveSubscription: boolean, isFreeReading: boolean): Promise<void> {
  if (isFreeReading) {
    // Update last free reading timestamp
    await admin.firestore().collection('users').doc(userId).update({
      lastFreeReading: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else if (hasActiveSubscription) {
    // Increment monthly readings used
    await admin.firestore().collection('users').doc(userId).update({
      'subscription.monthlyReadingsUsed': admin.firestore.FieldValue.increment(1),
    });
  } else {
    // Deduct credit
    await admin.firestore().collection('users').doc(userId).update({
      credits: admin.firestore.FieldValue.increment(-1),
    });
  }
}

// Build the user prompt from hexagram data
function buildUserPrompt(
  primary: InterpretationRequest['primaryHexagram'],
  relating: InterpretationRequest['relatingHexagram'],
  changingLines: number[],
  question?: string
): string {
  let prompt = '';

  if (question) {
    prompt += `The querent asks: "${question}"\n\n`;
  } else {
    prompt += 'The querent seeks a general life reading.\n\n';
  }

  prompt += `Primary Hexagram: #${primary.number} ${primary.englishName} (${primary.chineseName})\n`;

  if (changingLines.length > 0) {
    prompt += `Changing Lines: ${changingLines.join(', ')}\n`;
  }

  if (relating) {
    prompt += `Relating Hexagram: #${relating.number} ${relating.englishName} (${relating.chineseName})\n`;
  } else {
    prompt += 'No changing lines - this hexagram stands complete.\n';
  }

  prompt += '\nPlease provide an interpretation following the structure outlined in your system prompt.';

  return prompt;
}

// Moderation check function (pre-check before main interpretation)
export const moderateQuestion = functions
  .region('us-central1')
  .runWith({
    secrets: ['OPENAI_API_KEY'],
  })
  .https.onCall(async (data: { question: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { question } = data;

    // Character limit check
    if (question.length > 500) {
      return {
        approved: false,
        reason: 'Question exceeds maximum length of 500 characters',
      };
    }

    try {
      // Use OpenAI moderation API
      const openai = getOpenAI();
      const moderation = await openai.moderations.create({
        input: question,
      });

      const result = moderation.results[0];

      if (result.flagged) {
        return {
          approved: false,
          reason: 'Question contains inappropriate content',
        };
      }

      return {
        approved: true,
      };
    } catch (error) {
      logError('Moderation error', { error });
      // If moderation fails, allow the question (fail-open for better UX)
      return {
        approved: true,
      };
    }
  });
