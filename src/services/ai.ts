import { getFunctions, httpsCallable } from 'firebase/functions';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/config/firebase';
import { Hexagram } from '@/types';

const functions = getFunctions();

interface InterpretationRequestData {
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

interface InterpretationResponse {
  success: boolean;
  readingId: string;
  message: string;
}

interface StreamingContent {
  content: string;
  status: 'streaming' | 'complete' | 'error';
  error?: string;
}

// Generate a unique reading ID
export const generateReadingId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Call Cloud Function to start interpretation generation
export const requestInterpretation = async (
  primaryHexagram: Hexagram,
  relatingHexagram: Hexagram | null,
  changingLines: number[],
  question: string | undefined,
  userId: string
): Promise<string> => {
  const readingId = generateReadingId();

  const requestData: InterpretationRequestData = {
    primaryHexagram: {
      number: primaryHexagram.number,
      englishName: primaryHexagram.englishName,
      chineseName: primaryHexagram.chineseName,
    },
    relatingHexagram: relatingHexagram ? {
      number: relatingHexagram.number,
      englishName: relatingHexagram.englishName,
      chineseName: relatingHexagram.chineseName,
    } : null,
    changingLines,
    question,
    readingId,
  };

  const generateInterpretation = httpsCallable<InterpretationRequestData, InterpretationResponse>(
    functions,
    'generateInterpretation'
  );

  try {
    const result = await generateInterpretation(requestData);

    if (!result.data.success) {
      throw new Error(result.data.message || 'Failed to generate interpretation');
    }

    return readingId;
  } catch (error: any) {
    console.error('Error requesting interpretation:', error);
    throw new Error(error.message || 'Failed to request interpretation');
  }
};

// Subscribe to streaming interpretation updates
export const subscribeToInterpretation = (
  userId: string,
  readingId: string,
  onUpdate: (content: string, status: string) => void,
  onError: (error: string) => void
): (() => void) => {
  const readingRef = ref(database, `readings/${userId}/${readingId}`);

  const unsubscribe = onValue(
    readingRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as StreamingContent;

        if (data.status === 'error') {
          onError(data.error || 'Unknown error occurred');
        } else {
          onUpdate(data.content, data.status);
        }
      }
    },
    (error) => {
      console.error('Error subscribing to interpretation:', error);
      onError(error.message);
    }
  );

  // Return cleanup function
  return () => {
    off(readingRef);
  };
};

// Request interpretation with automatic retry
export const requestInterpretationWithRetry = async (
  primaryHexagram: Hexagram,
  relatingHexagram: Hexagram | null,
  changingLines: number[],
  question: string | undefined,
  userId: string,
  maxRetries: number = 3
): Promise<string> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const readingId = await requestInterpretation(
        primaryHexagram,
        relatingHexagram,
        changingLines,
        question,
        userId
      );
      return readingId;
    } catch (error: any) {
      console.warn(`Interpretation request attempt ${attempt + 1} failed:`, error);
      lastError = error;

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error('Failed to request interpretation after retries');
};

// Moderate question before submission
export const moderateQuestion = async (question: string): Promise<{ approved: boolean; reason?: string }> => {
  const moderate = httpsCallable<{ question: string }, { approved: boolean; reason?: string }>(
    functions,
    'moderateQuestion'
  );

  try {
    const result = await moderate({ question });
    return result.data;
  } catch (error: any) {
    console.error('Error moderating question:', error);
    // If moderation fails, allow the question (fail-open)
    return { approved: true };
  }
};
