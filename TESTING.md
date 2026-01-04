# Testing Guide

This document explains how testing works in the I Ching app.

## Quick Start

### Frontend Tests (React Native)
```bash
# Run all frontend tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Backend Tests (Cloud Functions)
```bash
# Run backend tests
cd functions && npm test
```

## Test Structure

```
ichingapp/
├── __tests__/                    # Frontend tests (Jest)
│   ├── utils/                    # Pure function tests
│   │   ├── lineCalculator.test.ts
│   │   ├── coinToss.test.ts
│   │   └── hexagramCalculator.test.ts
│   ├── data/                     # Data integrity tests
│   │   ├── hexagrams.test.ts
│   │   └── trigrams.test.ts
│   └── hooks/                    # Hook behavior tests
│       ├── useHexagramLookup.test.ts
│       └── useHaptics.test.ts
├── jest.config.js                # Frontend Jest configuration
├── jest.setup.js                 # Frontend test setup and mocks
│
└── functions/                    # Backend (Cloud Functions)
    ├── src/
    │   ├── helpers.ts            # Extracted pure functions (testable)
    │   ├── index.ts              # Cloud function handlers
    │   └── logger.ts             # Logging utilities
    └── test/                     # Backend tests (Node test module)
        ├── helpers.test.js       # Helper function tests
        └── logger.test.js        # Logger tests
```

## What Gets Tested

### Utility Functions (`src/utils/`)

| File | What It Tests |
|------|---------------|
| `lineCalculator.test.ts` | Line type calculation from coin tosses (6, 7, 8, 9 values) |
| `coinToss.test.ts` | Random coin toss generation and distribution |
| `hexagramCalculator.test.ts` | Binary conversion, hexagram lookup, transformations |

### Data Integrity (`src/data/`)

| File | What It Tests |
|------|---------------|
| `hexagrams.test.ts` | All 64 hexagrams have correct structure and unique values |
| `trigrams.test.ts` | All 8 trigrams have correct structure and unique values |

### Hooks (`src/hooks/`)

| File | What It Tests |
|------|---------------|
| `useHexagramLookup.test.ts` | Reading generation from cast lines |
| `useHaptics.test.ts` | Haptic feedback mock integration |

---

## Backend Testing (Cloud Functions)

The backend uses Node.js built-in test module (`node:test`) instead of Jest.

### Backend Helper Functions (`functions/src/helpers.ts`)

| File | What It Tests |
|------|---------------|
| `helpers.test.js` | Prompt building, free reading eligibility, credit deduction logic |
| `logger.test.js` | Secret redaction, error serialization, logging guards |

### Key Functions Tested

| Function | Description |
|----------|-------------|
| `buildUserPrompt` | Constructs AI prompt from hexagram data and question |
| `canUseFreeReading` | Checks if 24 hours have passed since last free reading |
| `determineDeductionType` | Determines which payment method to use (free/subscription/credit) |
| `isQuestionTooLong` | Validates question length (max 500 chars) |
| `canUserMakeReading` | Checks if user has any valid payment method |

### Backend Test Example

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { canUseFreeReading } from '../lib/helpers.js';

test('canUseFreeReading returns true after 24 hours', () => {
  const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
  const result = canUseFreeReading(twentyFiveHoursAgo);
  assert.equal(result, true);
});
```

---

## Testing Concepts

### Unit Tests
Tests for individual functions in isolation. Example:

```typescript
it('returns old_yin (6) for three tails', () => {
  const result = calculateLineType([false, false, false]);
  expect(result).toBe('old_yin');
});
```

### Data Integrity Tests
Verify static data is correct:

```typescript
it('contains exactly 64 hexagrams', () => {
  expect(hexagrams).toHaveLength(64);
});
```

### Mock Testing
Native modules (like haptics) are mocked in `jest.setup.js`:

```javascript
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  // ...
}));
```

## Writing New Tests

### Test File Naming
- Place tests in `__tests__/` directory
- Mirror the source file path: `src/utils/foo.ts` → `__tests__/utils/foo.test.ts`
- Use `.test.ts` extension

### Basic Test Structure

```typescript
import { myFunction } from '@/utils/myFile';

describe('myFunction', () => {
  it('does something expected', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });

  it('handles edge case', () => {
    expect(() => myFunction(badInput)).toThrow();
  });
});
```

### Common Assertions

```typescript
expect(value).toBe(exact);           // Exact equality
expect(value).toEqual(deep);         // Deep equality (objects)
expect(value).toBeDefined();         // Not undefined
expect(value).toBeNull();            // Is null
expect(array).toHaveLength(3);       // Array length
expect(value).toBeGreaterThan(5);    // Numeric comparison
expect(string).toMatch(/regex/);     // Regex match
expect(() => fn()).toThrow();        // Throws error
```

## Coverage

Run `npm run test:coverage` to see which code is tested:

```
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
utils/lineCalculator.ts |   100   |   100    |   100   |   100   |
utils/coinToss.ts       |   100   |   100    |   100   |   100   |
...
```

## Configuration Files

### jest.config.js
- Uses `jest-expo` preset for React Native compatibility
- Maps `@/*` imports to `src/*`
- Configures transform patterns for node_modules

### jest.setup.js
- Mocks native modules: `expo-haptics`, `react-native-reanimated`, `AsyncStorage`
- Runs before each test file

## Troubleshooting

### "Cannot find module '@/...'"
The path alias is configured in `jest.config.js`. Make sure you're importing from `@/` not relative paths.

### "ReferenceError: jest is not defined"
Make sure you have `@types/jest` installed as a dev dependency.

### Tests timing out
Increase timeout in the test:
```typescript
it('slow test', () => {
  // ...
}, 10000); // 10 second timeout
```

## Writing Backend Tests

Backend tests use Node.js built-in test module with ES modules.

### Test File Naming
- Place tests in `functions/test/` directory
- Use `.test.js` extension
- Import from compiled `../lib/` directory (not `../src/`)

### Basic Backend Test Structure

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { myFunction } from '../lib/myFile.js';

test('myFunction does something expected', () => {
  const result = myFunction(input);
  assert.equal(result, expected);
});

test('myFunction handles edge case', () => {
  assert.throws(() => myFunction(badInput), /error message/);
});
```

### Common Node Assertions

```javascript
assert.equal(actual, expected);        // Strict equality
assert.deepEqual(actual, expected);    // Deep equality (objects)
assert.ok(value);                      // Truthy check
assert.throws(() => fn(), /pattern/);  // Throws matching error
```

---

## Test Summary

| Area | Framework | Tests | Location |
|------|-----------|-------|----------|
| Frontend | Jest | 104 | `__tests__/` |
| Backend | Node test | 37 | `functions/test/` |
| **Total** | | **141** | |

---

## Future Improvements

When adding new features, consider testing:
1. **Happy path**: Does it work with normal input?
2. **Edge cases**: Empty arrays, null values, boundary conditions
3. **Error cases**: Invalid input should throw meaningful errors
