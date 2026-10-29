import assert from 'node:assert';
import { normalizeErrorMessage, isBackendUnavailable } from '../src/utils/errors.ts';
import { storage } from '../src/services/storage.ts';

console.log('Testing exact Vercel runtime simulation...');

// 1. Simulate Vercel returning 404 with text/plain NOT_FOUND
const mockVercel404Response = {
  ok: false,
  status: 404,
  headers: new Headers({ 'content-type': 'text/plain; charset=utf-8' }),
  text: async () => 'The page could not be found\n\nNOT_FOUND\n\nbom1::2vrvf-1793268693133-210c6e61c1be',
  json: async () => { throw new SyntaxError('Unexpected token'); },
};

let rawError: unknown = null;
try {
  rawError = await mockVercel404Response.text();
} catch {}

const normalized = normalizeErrorMessage(rawError, `Request failed with status ${mockVercel404Response.status}`);
assert.strictEqual(normalized, 'Backend service is currently unavailable or endpoint was not found (404).');
assert.strictEqual(isBackendUnavailable({ status: 404, error: normalized }), true);

// 2. Storage fallback
const user = storage.getUserByUsernameOrEmail('tanvir');
assert(user, 'Tanvir must be found');
assert.strictEqual(user?.name, 'Tanvir Ahmed');

const pwd = storage.getUserPassword('tanvir');
assert.strictEqual(pwd, 'User@123');

console.log('✓ Vercel 404 offline authentication simulation passed with 100% accuracy!');
