import { getFunctions, httpsCallable } from 'firebase/functions';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/config/firebase';
import { Hexagram } from '@/types';

const functions = getFunctions();

interface HexagramInfo {
  number: number;
  englishName: string;
  chineseName: string;
}

interface InterpretationRequestData {
  primaryHexagram: HexagramInfo;
  relatingHexagram: HexagramInfo | null;
  changingLines: number[];
  question?: string;
  readingId: string;
}

interface ChatRequestData {
  message: string;
  chatId: string;
  readingContext: {
    primaryHexagram: HexagramInfo;
    relatingHexagram: HexagramInfo | null;
    changingLines: number[];
    question?: string;
    interpretation: string;
  };
  previousMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface ChatResponse {
  success: boolean;
  chatId: string;
  message: string;
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

// Call Cloud Function to start interpretation generation (legacy - waits for completion)
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

// Start interpretation and return readingId immediately (enables true streaming)
export const startInterpretationStreaming = (
  primaryHexagram: Hexagram,
  relatingHexagram: Hexagram | null,
  changingLines: number[],
  question: string | undefined,
  userId: string
): string => {
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

  // Fire Cloud Function without awaiting - errors will be reflected in RTDB status
  generateInterpretation(requestData).catch(err => {
    console.error('Cloud function error (will be reflected in RTDB):', err);
  });

  return readingId;
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

// Generate a unique chat ID
export const generateChatId = (): string => {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Start chat streaming and return chatId immediately
export const startChatStreaming = (
  message: string,
  readingContext: ChatRequestData['readingContext'],
  previousMessages: ChatRequestData['previousMessages'],
  userId: string
): string => {
  const chatId = generateChatId();

  const requestData: ChatRequestData = {
    message,
    chatId,
    readingContext,
    previousMessages,
  };

  const chatAboutReading = httpsCallable<ChatRequestData, ChatResponse>(
    functions,
    'chatAboutReading'
  );

  // Fire Cloud Function without awaiting - errors will be reflected in RTDB status
  chatAboutReading(requestData).catch(err => {
    console.error('Chat cloud function error (will be reflected in RTDB):', err);
  });

  return chatId;
};

// Subscribe to chat response streaming
export const subscribeToChatResponse = (
  userId: string,
  chatId: string,
  onUpdate: (content: string, status: string) => void,
  onError: (error: string) => void
): (() => void) => {
  const chatRef = ref(database, `chats/${userId}/${chatId}`);

  const unsubscribe = onValue(
    chatRef,
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
      console.error('Error subscribing to chat response:', error);
      onError(error.message);
    }
  );

  // Return cleanup function
  return () => {
    off(chatRef);
  };
};
