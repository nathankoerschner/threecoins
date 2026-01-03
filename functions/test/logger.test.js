const test = require('node:test');
const assert = require('node:assert/strict');

const {
  containsSecret,
  logError,
  redactLogPayload,
  serializeError,
} = require('../lib/logger');

test('redacts authorization headers and API keys', () => {
  const input = {
    headers: {
      Authorization: 'Bearer sk-1234567890abcdef',
    },
    payload: 'sk-1234567890abcdef',
  };

  const output = redactLogPayload(input);

  assert.equal(output.headers.Authorization, '[REDACTED]');
  assert.equal(output.payload.includes('sk-'), false);
});

test('serializes errors with safe fields only', () => {
  const error = new Error('failed with sk-1234567890abcdef');
  error.config = { headers: { Authorization: 'Bearer sk-1234567890abcdef' } };

  const serialized = serializeError(error);

  assert.equal(Object.prototype.hasOwnProperty.call(serialized, 'config'), false);
  assert.equal(String(serialized.message).includes('sk-'), false);
});

test('detects secrets from env values', () => {
  const previous = process.env.TEST_SECRET;
  process.env.TEST_SECRET = 'supersecretvalue';

  try {
    assert.equal(containsSecret('value supersecretvalue'), true);
  } finally {
    process.env.TEST_SECRET = previous;
  }
});

test('log guard throws when secrets are present', () => {
  const previous = process.env.LOG_SECRET_GUARD;
  process.env.LOG_SECRET_GUARD = 'true';

  try {
    assert.throws(() => {
      logError('bad log', { token: 'sk-1234567890abcdef' });
    }, /Secret pattern detected/);
  } finally {
    process.env.LOG_SECRET_GUARD = previous;
  }
});
