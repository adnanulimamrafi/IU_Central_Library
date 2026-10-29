/**
 * Safe runtime error normalization utility for Library Management System.
 * Ensures unknown API responses, exceptions, network errors, and edge-case response
 * bodies are always normalized into clean, user-friendly string messages.
 */

export function normalizeErrorMessage(err: unknown, fallback: string = 'An unexpected error occurred.'): string {
  if (err === null || err === undefined) {
    return fallback;
  }

  // 1. Primitive string
  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (!trimmed) return fallback;

    // Detect HTML or edge 404 raw text responses (e.g., Vercel edge NOT_FOUND or HTML error pages)
    if (
      trimmed.startsWith('<!DOCTYPE') ||
      trimmed.startsWith('<html') ||
      trimmed.includes('NOT_FOUND') ||
      trimmed.includes('The page could not be found')
    ) {
      return 'Backend service is currently unavailable or endpoint was not found (404).';
    }

    return trimmed;
  }

  // 2. Standard JS Error
  if (err instanceof Error) {
    return normalizeErrorMessage(err.message, fallback);
  }

  // 3. Objects and API response shapes
  if (typeof err === 'object') {
    // Array of errors: ["Invalid username", "Invalid password"]
    if (Array.isArray(err)) {
      const messages = err
        .map((item) => normalizeErrorMessage(item, ''))
        .filter((msg) => Boolean(msg));
      if (messages.length > 0) {
        return messages.join(', ');
      }
    }

    const obj = err as Record<string, unknown>;

    // Shape: { error: { message: "..." } } or { error: "..." }
    if (obj.error !== undefined && obj.error !== null) {
      if (typeof obj.error === 'string') {
        return normalizeErrorMessage(obj.error, fallback);
      }
      if (typeof obj.error === 'object') {
        const nestedMsg = normalizeErrorMessage(obj.error, '');
        if (nestedMsg) return nestedMsg;
      }
    }

    // Shape: { message: "..." }
    if (typeof obj.message === 'string' && obj.message.trim()) {
      return normalizeErrorMessage(obj.message, fallback);
    }

    // Shape: { errors: [...] } or { errors: { field: ["..."] } }
    if (obj.errors !== undefined && obj.errors !== null) {
      if (Array.isArray(obj.errors)) {
        const messages = obj.errors
          .map((item) => normalizeErrorMessage(item, ''))
          .filter((msg) => Boolean(msg));
        if (messages.length > 0) {
          return messages.join(', ');
        }
      } else if (typeof obj.errors === 'object') {
        const errorValues = Object.values(obj.errors as Record<string, unknown>)
          .flatMap((val) => (Array.isArray(val) ? val : [val]))
          .map((val) => normalizeErrorMessage(val, ''))
          .filter(Boolean);
        if (errorValues.length > 0) {
          return errorValues.join(', ');
        }
      }
    }

    // Shape: { statusText: "..." }
    if (typeof obj.statusText === 'string' && obj.statusText.trim()) {
      return obj.statusText.trim();
    }

    // Fallback: JSON.stringify if it has properties, else fallback
    try {
      const keys = Object.keys(obj);
      if (keys.length > 0) {
        const serialized = JSON.stringify(obj);
        if (serialized && serialized !== '{}') {
          return serialized;
        }
      }
    } catch {
      // Ignore circular reference
    }
  }

  // 4. Numbers, Booleans, Symbols
  if (typeof err === 'number' || typeof err === 'boolean') {
    return String(err);
  }

  return fallback;
}

/**
 * Safely check if a string contains a substring without risking a TypeError.
 */
export function safeStringIncludes(target: unknown, search: string): boolean {
  if (typeof target !== 'string') return false;
  return target.toLowerCase().includes(search.toLowerCase());
}

/**
 * Determine if an error or API response indicates that the backend is unreachable,
 * offline, or returning 404/502/503 (e.g. static Vite hosting without PHP backend).
 */
export function isBackendUnavailable(resOrError: unknown): boolean {
  if (!resOrError) return false;

  // Check HTTP status code if present
  if (typeof resOrError === 'object' && resOrError !== null) {
    const status = (resOrError as Record<string, unknown>).status;
    if (typeof status === 'number') {
      if (status === 404 || status === 502 || status === 503 || status === 504 || status === 0) {
        return true;
      }
    }
  }

  const normalized = normalizeErrorMessage(resOrError, '').toLowerCase();
  if (!normalized) return false;

  const unavailableSignals = [
    'network error',
    'failed to fetch',
    'networkrequestfailed',
    'econnrefused',
    'not found',
    '404',
    '502',
    '503',
    '504',
    'bad gateway',
    'service unavailable',
    'currently unavailable',
    'load failed',
  ];

  return unavailableSignals.some((signal) => normalized.includes(signal));
}
