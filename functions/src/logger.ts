const API_KEY_PATTERN = /sk-[A-Za-z0-9]{10,}/;
const AUTH_HEADER_KEY = /authorization/i;
const AUTH_HEADER_VALUE_PATTERN = /authorization\s*[:=]\s*[^,\s]+/i;
const BEARER_TOKEN_PATTERN = /(bearer\s+)[A-Za-z0-9\-._~+/]+=*/ig;
const REDACTED = '[REDACTED]';
const REDACTED_API_KEY = '[REDACTED_API_KEY]';
const REDACTED_ENV = '[REDACTED_ENV]';

const getEnvValues = (): string[] => {
  return Object.values(process.env)
    .filter((value): value is string => typeof value === 'string')
    .filter((value) => value.length >= 8);
};

const redactString = (value: string): string => {
  let redacted = value.replace(API_KEY_PATTERN, REDACTED_API_KEY);
  redacted = redacted.replace(AUTH_HEADER_VALUE_PATTERN, `authorization=${REDACTED}`);
  redacted = redacted.replace(BEARER_TOKEN_PATTERN, `$1${REDACTED}`);

  for (const envValue of getEnvValues()) {
    if (redacted.includes(envValue)) {
      redacted = redacted.split(envValue).join(REDACTED_ENV);
    }
  }

  return redacted;
};

const redactLogPayload = (value: unknown, seen = new WeakSet<object>()): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return redactString(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value;
  }

  if (value instanceof Error) {
    return serializeError(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactLogPayload(entry, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value as object)) {
      return '[Circular]';
    }
    seen.add(value as object);

    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (AUTH_HEADER_KEY.test(key)) {
        output[key] = REDACTED;
        continue;
      }
      output[key] = redactLogPayload(entry, seen);
    }
    return output;
  }

  return value;
};

const containsSecret = (value: unknown, seen = new WeakSet<object>()): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    if (API_KEY_PATTERN.test(value)) {
      return true;
    }
    if (AUTH_HEADER_VALUE_PATTERN.test(value)) {
      return true;
    }
    for (const envValue of getEnvValues()) {
      if (value.includes(envValue)) {
        return true;
      }
    }
    return false;
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return false;
  }

  if (value instanceof Error) {
    return containsSecret(value.message, seen) || containsSecret(value.stack, seen);
  }

  if (Array.isArray(value)) {
    return value.some((entry) => containsSecret(entry, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value as object)) {
      return false;
    }
    seen.add(value as object);

    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (AUTH_HEADER_KEY.test(key)) {
        return true;
      }
      if (containsSecret(entry, seen)) {
        return true;
      }
    }
  }

  return false;
};

const assertNoSecrets = (values: unknown[]): void => {
  if (process.env.LOG_SECRET_GUARD !== 'true') {
    return;
  }

  for (const value of values) {
    if (containsSecret(value)) {
      throw new Error('Secret pattern detected in log payload');
    }
  }
};

export const serializeError = (error: unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    const safeError: Record<string, unknown> = {
      name: error.name,
      message: redactString(error.message),
    };

    if (error.stack) {
      safeError.stack = redactString(error.stack);
    }

    const errorCause = (error as { cause?: unknown }).cause;
    if (errorCause) {
      const cause = errorCause;
      if (cause instanceof Error) {
        safeError.cause = {
          name: cause.name,
          message: redactString(cause.message),
        };
      } else if (typeof cause === 'string') {
        safeError.cause = redactString(cause);
      } else {
        safeError.cause = redactString(String(cause));
      }
    }

    return safeError;
  }

  if (typeof error === 'string') {
    return { message: redactString(error) };
  }

  return { message: redactString(String(error)) };
};

const emitLog = (level: 'info' | 'warn' | 'error', message: string, meta?: unknown): void => {
  assertNoSecrets([message, meta]);

  const safeMessage = redactString(message);
  const safeMeta = meta === undefined ? undefined : redactLogPayload(meta);

  if (level === 'error') {
    safeMeta === undefined ? console.error(safeMessage) : console.error(safeMessage, safeMeta);
    return;
  }

  if (level === 'warn') {
    safeMeta === undefined ? console.warn(safeMessage) : console.warn(safeMessage, safeMeta);
    return;
  }

  safeMeta === undefined ? console.log(safeMessage) : console.log(safeMessage, safeMeta);
};

export const logInfo = (message: string, meta?: unknown): void => {
  emitLog('info', message, meta);
};

export const logWarn = (message: string, meta?: unknown): void => {
  emitLog('warn', message, meta);
};

export const logError = (message: string, meta?: unknown): void => {
  emitLog('error', message, meta);
};

export { containsSecret, redactLogPayload, redactString };
