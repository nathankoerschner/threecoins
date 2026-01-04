/**
 * Helper functions for Cloud Functions
 * Extracted for testability - these are pure functions with no Firebase dependencies
 */

export interface HexagramInfo {
  number: number;
  englishName: string;
  chineseName: string;
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

  if (question) {
    prompt += `Question is: "${question}"\n\n`;
  }

  prompt += `Primary Hexagram: #${primary.number} ${primary.englishName} (${primary.chineseName})\n`;

  if (changingLines.length > 0) {
    prompt += `Changing Lines: ${changingLines.join(', ')}\n`;
  }

  if (relating) {
    prompt += `Relating Hexagram: #${relating.number} ${relating.englishName} (${relating.chineseName})\n`;
  } else {
    prompt += 'No changing lines.\n';
  }

  prompt += '\nPlease provide an interpretation';

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
