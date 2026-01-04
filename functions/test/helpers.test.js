import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildUserPrompt,
  canUseFreeReading,
  determineDeductionType,
  isQuestionTooLong,
  canUserMakeReading,
} from '../lib/helpers.js';

// ============================================================================
// buildUserPrompt tests
// ============================================================================

test('buildUserPrompt includes question when provided', () => {
  const primary = { number: 1, englishName: 'The Creative', chineseName: 'Qián' };
  const result = buildUserPrompt(primary, null, [], 'Should I change jobs?');

  assert.ok(result.includes('Question is: "Should I change jobs?"'));
});

test('buildUserPrompt does not include question prefix when not provided', () => {
  const primary = { number: 1, englishName: 'The Creative', chineseName: 'Qián' };
  const result = buildUserPrompt(primary, null, []);

  assert.ok(!result.includes('Question is:'));
});

test('buildUserPrompt includes primary hexagram info', () => {
  const primary = { number: 1, englishName: 'The Creative', chineseName: 'Qián' };
  const result = buildUserPrompt(primary, null, []);

  assert.ok(result.includes('Primary Hexagram: #1 The Creative (Qián)'));
});

test('buildUserPrompt includes changing lines when present', () => {
  const primary = { number: 1, englishName: 'The Creative', chineseName: 'Qián' };
  const result = buildUserPrompt(primary, null, [1, 3, 6]);

  assert.ok(result.includes('Changing Lines: 1, 3, 6'));
});

test('buildUserPrompt does not include changing lines when empty', () => {
  const primary = { number: 1, englishName: 'The Creative', chineseName: 'Qián' };
  const result = buildUserPrompt(primary, null, []);

  assert.ok(!result.includes('Changing Lines:'));
});

test('buildUserPrompt includes relating hexagram when provided', () => {
  const primary = { number: 1, englishName: 'The Creative', chineseName: 'Qián' };
  const relating = { number: 2, englishName: 'The Receptive', chineseName: 'Kūn' };
  const result = buildUserPrompt(primary, relating, [1, 2, 3, 4, 5, 6]);

  assert.ok(result.includes('Relating Hexagram: #2 The Receptive (Kūn)'));
});

test('buildUserPrompt includes "No changing lines" when no relating hexagram', () => {
  const primary = { number: 1, englishName: 'The Creative', chineseName: 'Qián' };
  const result = buildUserPrompt(primary, null, []);

  assert.ok(result.includes('No changing lines.'));
});

test('buildUserPrompt ends with interpretation request', () => {
  const primary = { number: 1, englishName: 'The Creative', chineseName: 'Qián' };
  const result = buildUserPrompt(primary, null, []);

  assert.ok(result.includes('Please provide an interpretation'));
});

test('buildUserPrompt creates complete prompt with all elements', () => {
  const primary = { number: 1, englishName: 'The Creative', chineseName: 'Qián' };
  const relating = { number: 2, englishName: 'The Receptive', chineseName: 'Kūn' };
  const result = buildUserPrompt(primary, relating, [1, 6], 'What should I do?');

  assert.ok(result.includes('Question is: "What should I do?"'));
  assert.ok(result.includes('Primary Hexagram: #1 The Creative (Qián)'));
  assert.ok(result.includes('Changing Lines: 1, 6'));
  assert.ok(result.includes('Relating Hexagram: #2 The Receptive (Kūn)'));
  assert.ok(result.includes('Please provide an interpretation'));
});

// ============================================================================
// canUseFreeReading tests
// ============================================================================

test('canUseFreeReading returns true when never used (0 timestamp)', () => {
  const result = canUseFreeReading(0);
  assert.equal(result, true);
});

test('canUseFreeReading returns true after 24 hours', () => {
  const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
  const result = canUseFreeReading(twentyFiveHoursAgo);
  assert.equal(result, true);
});

test('canUseFreeReading returns true at exactly 24 hours', () => {
  const exactlyTwentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
  const result = canUseFreeReading(exactlyTwentyFourHoursAgo);
  assert.equal(result, true);
});

test('canUseFreeReading returns false within 24 hours', () => {
  const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
  const result = canUseFreeReading(twoHoursAgo);
  assert.equal(result, false);
});

test('canUseFreeReading returns false for recent timestamp', () => {
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  const result = canUseFreeReading(fiveMinutesAgo);
  assert.equal(result, false);
});

test('canUseFreeReading accepts custom now timestamp', () => {
  const fixedNow = 1704067200000; // Jan 1, 2024 00:00:00 UTC
  const twentyFiveHoursBefore = fixedNow - (25 * 60 * 60 * 1000);

  const result = canUseFreeReading(twentyFiveHoursBefore, fixedNow);
  assert.equal(result, true);
});

// ============================================================================
// determineDeductionType tests
// ============================================================================

test('determineDeductionType returns "free" when isFreeReading is true', () => {
  const result = determineDeductionType(true, true, true);
  assert.equal(result, 'free');
});

test('determineDeductionType returns "subscription" when hasActiveSubscription', () => {
  const result = determineDeductionType(true, false, true);
  assert.equal(result, 'subscription');
});

test('determineDeductionType returns "credit" when hasCredits', () => {
  const result = determineDeductionType(false, false, true);
  assert.equal(result, 'credit');
});

test('determineDeductionType returns "none" when no options available', () => {
  const result = determineDeductionType(false, false, false);
  assert.equal(result, 'none');
});

test('determineDeductionType prioritizes free over subscription', () => {
  const result = determineDeductionType(true, true, true);
  assert.equal(result, 'free');
});

test('determineDeductionType prioritizes subscription over credit', () => {
  const result = determineDeductionType(true, false, true);
  assert.equal(result, 'subscription');
});

// ============================================================================
// isQuestionTooLong tests
// ============================================================================

test('isQuestionTooLong returns false for short question', () => {
  const result = isQuestionTooLong('Should I take the job?');
  assert.equal(result, false);
});

test('isQuestionTooLong returns false for exactly 500 characters', () => {
  const question = 'a'.repeat(500);
  const result = isQuestionTooLong(question);
  assert.equal(result, false);
});

test('isQuestionTooLong returns true for 501 characters', () => {
  const question = 'a'.repeat(501);
  const result = isQuestionTooLong(question);
  assert.equal(result, true);
});

test('isQuestionTooLong returns true for very long question', () => {
  const question = 'a'.repeat(1000);
  const result = isQuestionTooLong(question);
  assert.equal(result, true);
});

test('isQuestionTooLong returns false for empty string', () => {
  const result = isQuestionTooLong('');
  assert.equal(result, false);
});

test('isQuestionTooLong accepts custom max length', () => {
  const result = isQuestionTooLong('hello', 3);
  assert.equal(result, true);
});

test('isQuestionTooLong with custom length returns false at limit', () => {
  const result = isQuestionTooLong('hel', 3);
  assert.equal(result, false);
});

// ============================================================================
// canUserMakeReading tests
// ============================================================================

test('canUserMakeReading returns true when has credits', () => {
  const result = canUserMakeReading(true, false, false);
  assert.equal(result, true);
});

test('canUserMakeReading returns true when has active subscription', () => {
  const result = canUserMakeReading(false, true, false);
  assert.equal(result, true);
});

test('canUserMakeReading returns true when can use free reading', () => {
  const result = canUserMakeReading(false, false, true);
  assert.equal(result, true);
});

test('canUserMakeReading returns true when multiple options available', () => {
  const result = canUserMakeReading(true, true, true);
  assert.equal(result, true);
});

test('canUserMakeReading returns false when no options available', () => {
  const result = canUserMakeReading(false, false, false);
  assert.equal(result, false);
});
