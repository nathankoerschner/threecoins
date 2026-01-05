/**
 * Helper functions for Cloud Functions
 * Extracted for testability - these are pure functions with no Firebase dependencies
 */

export interface HexagramInfo {
  number: number;
  englishName: string;
  chineseName: string;
}

export interface ReadingContext {
  primaryHexagram: HexagramInfo;
  relatingHexagram: HexagramInfo | null;
  changingLines: number[];
  question?: string;
  interpretation: string;
}

export interface UserData {
  lastFreeReading?: {
    toMillis: () => number;
  } | null;
  credits: number;
  subscription?: {
    status: string;
    monthlyReadingsUsed: number;
  };
}

/**
 * Build the user prompt from hexagram data for AI interpretation
 * @param {HexagramInfo} primary - The primary hexagram
 * @param {HexagramInfo | null} relating - The relating hexagram (if any)
 * @param {number[]} changingLines - Array of changing line numbers
 * @param {string} question - The user's question (optional)
 * @return {string} The formatted prompt for AI interpretation
 */
export function buildUserPrompt(
  primary: HexagramInfo,
  relating: HexagramInfo | null,
  changingLines: number[],
  question?: string
): string {
  let prompt = '';

  prompt += `Tell me about iching hexagram ${primary.number} `;

  if (changingLines.length > 0) {
    prompt += `(with changing lines ${changingLines.join(', ')}) `;
  }
  if (relating) {
    prompt += `(changes to hexagram ${relating.number}) `;
  } else {
    prompt += '';
  }

  if (question) {
    prompt += `as it applies to ${question}.`;
  }

  prompt += ' Use minimal bold formatting in your response.';

  return prompt;
}

/**
 * Check if user can use their free daily reading
 * Pure function version - takes timestamps instead of Firebase objects
 * @param {number} lastFreeReadingMs - Timestamp of last free reading in ms
 * @param {number} nowMs - Current timestamp in ms (defaults to Date.now())
 * @return {boolean} Whether the user can use a free reading
 */
export function canUseFreeReading(
  lastFreeReadingMs: number,
  nowMs = Date.now()
): boolean {
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return nowMs - lastFreeReadingMs >= twentyFourHours;
}

/**
 * Determine the credit deduction type based on user state
 * @param {boolean} hasActiveSubscription - Whether user has active subscription
 * @param {boolean} isFreeReading - Whether this is a free reading
 * @param {boolean} hasCredits - Whether user has credits available
 * @return {string} The deduction type: 'free', 'subscription', 'credit', or 'none'
 */
export function determineDeductionType(
  hasActiveSubscription: boolean,
  isFreeReading: boolean,
  hasCredits: boolean
): 'free' | 'subscription' | 'credit' | 'none' {
  if (isFreeReading) {
    return 'free';
  }
  if (hasActiveSubscription) {
    return 'subscription';
  }
  if (hasCredits) {
    return 'credit';
  }
  return 'none';
}

/**
 * Check if a question exceeds the maximum allowed length
 * @param {string} question - The question to check
 * @param {number} maxLength - Maximum allowed length (defaults to 500)
 * @return {boolean} Whether the question exceeds the max length
 */
export function isQuestionTooLong(
  question: string,
  maxLength = 500
): boolean {
  return question.length > maxLength;
}

/**
 * Validate that user can make a reading
 * @param {boolean} hasCredits - Whether user has credits available
 * @param {boolean} hasActiveSubscription - Whether user has active subscription
 * @param {boolean} canUseFree - Whether user can use free reading
 * @return {boolean} Whether the user can make a reading
 */
export function canUserMakeReading(
  hasCredits: boolean,
  hasActiveSubscription: boolean,
  canUseFree: boolean
): boolean {
  return hasCredits || hasActiveSubscription || canUseFree;
}

/**
 * Build the system prompt for chat about a reading
 * @param {ReadingContext} context - The reading context including hexagrams and interpretation
 * @return {string} The formatted system prompt for AI chat
 */
export function buildChatSystemPrompt(context: ReadingContext): string {
  const primary = context.primaryHexagram;
  const relating = context.relatingHexagram;

  let prompt = `You are a wise I Ching counselor continuing a conversation about a reading.

The reading context:
- Primary Hexagram: #${primary.number} ${primary.englishName} (${primary.chineseName})`;

  if (relating) {
    prompt += `
- Relating Hexagram: #${relating.number} ${relating.englishName} (${relating.chineseName})`;
  }

  if (context.changingLines.length > 0) {
    prompt += `
- Changing Lines: ${context.changingLines.join(', ')}`;
  }

  if (context.question) {
    prompt += `
- Original Question: "${context.question}"`;
  }

  prompt += `

The interpretation already given:
${context.interpretation}

Guidelines:
- Be concise and direct (2-4 sentences typically)
- Reference the specific hexagrams and lines when relevant
- Provide practical wisdom grounded in the reading
- Do not repeat the full interpretation unless asked
- Maintain a warm but wise tone`;

  return prompt;
}
