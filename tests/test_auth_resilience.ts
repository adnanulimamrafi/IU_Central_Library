import assert from 'node:assert';
import { normalizeErrorMessage, isBackendUnavailable, safeStringIncludes } from '../src/utils/errors.ts';
import { INITIAL_USERS, DEMO_CREDENTIALS } from '../src/services/mockData.ts';

console.log('--- Running Auth Resilience & Error Normalization Tests ---');

// Test 1: normalizeErrorMessage handles diverse response shapes
console.log('1. Testing normalizeErrorMessage...');
assert.strictEqual(normalizeErrorMessage('Invalid credentials'), 'Invalid credentials');
assert.strictEqual(normalizeErrorMessage({ error: 'Invalid credentials' }), 'Invalid credentials');
assert.strictEqual(normalizeErrorMessage({ message: 'Invalid credentials' }), 'Invalid credentials');
assert.strictEqual(normalizeErrorMessage({ error: { message: 'Nested error message' } }), 'Nested error message');
assert.strictEqual(normalizeErrorMessage({ errors: ['Username is required', 'Password is required'] }), 'Username is required, Password is required');
assert.strictEqual(normalizeErrorMessage({ errors: { user: ['Invalid user'], pass: ['Invalid pass'] } }), 'Invalid user, Invalid pass');
assert.strictEqual(
  normalizeErrorMessage('The page could not be found\n\nNOT_FOUND\n...'),
  'Backend service is currently unavailable or endpoint was not found (404).'
);
assert.strictEqual(
  normalizeErrorMessage('<!DOCTYPE html><html><body>Error</body></html>'),
  'Backend service is currently unavailable or endpoint was not found (404).'
);
assert.strictEqual(normalizeErrorMessage(null), 'An unexpected error occurred.');
assert.strictEqual(normalizeErrorMessage(undefined), 'An unexpected error occurred.');
assert.strictEqual(normalizeErrorMessage(404), '404');
console.log('✓ normalizeErrorMessage handles all shapes cleanly');

// Test 2: isBackendUnavailable
console.log('2. Testing isBackendUnavailable...');
assert.strictEqual(isBackendUnavailable({ status: 404 }), true);
assert.strictEqual(isBackendUnavailable({ status: 502 }), true);
assert.strictEqual(isBackendUnavailable({ status: 503 }), true);
assert.strictEqual(isBackendUnavailable({ status: 0 }), true);
assert.strictEqual(isBackendUnavailable('Network error occurred. Please verify backend server is running.'), true);
assert.strictEqual(isBackendUnavailable('Failed to fetch'), true);
assert.strictEqual(isBackendUnavailable('The page could not be found\n\nNOT_FOUND'), true);

// Active business rejections MUST NOT be classified as unavailable
assert.strictEqual(isBackendUnavailable({ status: 401, error: 'Invalid credentials. Please verify your password and try again.' }), false);
assert.strictEqual(isBackendUnavailable({ status: 403, error: 'This account has been disabled or suspended.' }), false);
assert.strictEqual(isBackendUnavailable({ status: 422, error: 'Username and password are required.' }), false);
assert.strictEqual(isBackendUnavailable('Invalid credentials. No account found.'), false);
console.log('✓ isBackendUnavailable accurately distinguishes offline/unreachable from active rejection');

// Test 3: Demo Accounts Integrity
console.log('3. Testing Demo Accounts Integrity...');
const expectedAccounts = [
  { username: 'admin', expectedPass: 'Admin@123', expectedRole: 'admin' },
  { username: 'tanvir', expectedPass: 'User@123', expectedRole: 'member' },
  { username: 'student1', expectedPass: 'Student@123', expectedRole: 'member' },
  { username: 'student2', expectedPass: 'Student@123', expectedRole: 'member' },
];

for (const acc of expectedAccounts) {
  const user = INITIAL_USERS.find(
    (u) => u.username?.toLowerCase() === acc.username.toLowerCase()
  );
  assert(user, `User ${acc.username} must exist in INITIAL_USERS`);
  assert.strictEqual(user?.role, acc.expectedRole, `Role for ${acc.username} must be ${acc.expectedRole}`);

  const passByUsername = DEMO_CREDENTIALS[acc.username.toLowerCase()];
  assert.strictEqual(passByUsername, acc.expectedPass, `Password for ${acc.username} must be ${acc.expectedPass}`);

  const passByEmail = DEMO_CREDENTIALS[user.email.toLowerCase()];
  assert.strictEqual(passByEmail, acc.expectedPass, `Password for ${user.email} must be ${acc.expectedPass}`);
}
console.log('✓ All 4 demo accounts (admin, tanvir, student1, student2) verified with correct roles and credentials');

// Test 4: safeStringIncludes
console.log('4. Testing safeStringIncludes...');
assert.strictEqual(safeStringIncludes('Network error occurred', 'network error'), true);
assert.strictEqual(safeStringIncludes(null, 'test'), false);
assert.strictEqual(safeStringIncludes(undefined, 'test'), false);
assert.strictEqual(safeStringIncludes({ error: 'something' }, 'test'), false);
assert.strictEqual(safeStringIncludes(123, 'test'), false);
console.log('✓ safeStringIncludes protects against non-string arguments');

console.log('\n--- All Unit Tests Passed Successfully! ---');
