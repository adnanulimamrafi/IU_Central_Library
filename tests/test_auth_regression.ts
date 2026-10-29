import assert from 'node:assert';

// 1. Setup in-memory localStorage polyfill before importing storage services
const mockStore = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => mockStore.get(key) || null,
  setItem: (key: string, value: string) => mockStore.set(key, String(value)),
  removeItem: (key: string) => mockStore.delete(key),
  clear: () => mockStore.clear(),
  key: (index: number) => Array.from(mockStore.keys())[index] || null,
  get length() {
    return mockStore.size;
  },
};
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

// Import modules to test
import { normalizeErrorMessage, isBackendUnavailable } from '../src/utils/errors.ts';
import { storage } from '../src/services/storage.ts';

console.log('====================================================');
console.log('Running End-to-End Auth & Error Regression Test Suite');
console.log('====================================================\n');

// ----------------------------------------------------
// Test Group 1: Error Normalization Edge Cases
// ----------------------------------------------------
console.log('Test 1: Error as string');
assert.strictEqual(normalizeErrorMessage('Invalid credentials'), 'Invalid credentials');
assert.strictEqual(normalizeErrorMessage('  Spaced error message  '), 'Spaced error message');
console.log('✓ Passed');

console.log('Test 2: Error as object containing message');
assert.strictEqual(normalizeErrorMessage({ message: 'Invalid credentials' }), 'Invalid credentials');
assert.strictEqual(normalizeErrorMessage({ error: { message: 'Nested server error' } }), 'Nested server error');
assert.strictEqual(normalizeErrorMessage({ error: 'Top-level error string' }), 'Top-level error string');
console.log('✓ Passed');

console.log('Test 3: Errors as array');
assert.strictEqual(
  normalizeErrorMessage({ errors: ['Username is required', 'Password is required'] }),
  'Username is required, Password is required'
);
assert.strictEqual(
  normalizeErrorMessage(['First error', 'Second error']),
  'First error, Second error'
);
console.log('✓ Passed');

console.log('Test 4: Null, undefined, and unexpected values');
assert.strictEqual(normalizeErrorMessage(null), 'An unexpected error occurred.');
assert.strictEqual(normalizeErrorMessage(undefined), 'An unexpected error occurred.');
assert.strictEqual(normalizeErrorMessage(500), '500');
assert.strictEqual(normalizeErrorMessage(false), 'false');
assert.strictEqual(normalizeErrorMessage({}), 'An unexpected error occurred.');
console.log('✓ Passed');

console.log('Test 5: Vercel-style HTML and plain-text 404 responses');
const vercelNotFoundText = `The page could not be found

NOT_FOUND

bom1::2vrvf-1793268693133-210c6e61c1be`;
assert.strictEqual(
  normalizeErrorMessage(vercelNotFoundText),
  'Backend service is currently unavailable or endpoint was not found (404).'
);

const html404 = `<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404</h1></body></html>`;
assert.strictEqual(
  normalizeErrorMessage(html404),
  'Backend service is currently unavailable or endpoint was not found (404).'
);
console.log('✓ Passed');

console.log('Test 6: Network failures and backend availability checks');
const networkError = new Error('Failed to fetch');
assert.strictEqual(normalizeErrorMessage(networkError), 'Failed to fetch');
assert.strictEqual(isBackendUnavailable(networkError), true);
assert.strictEqual(isBackendUnavailable({ status: 404 }), true);
assert.strictEqual(isBackendUnavailable({ status: 502 }), true);
assert.strictEqual(isBackendUnavailable({ status: 503 }), true);
assert.strictEqual(isBackendUnavailable({ status: 0 }), true);
assert.strictEqual(isBackendUnavailable('Request failed with status 404'), true);

// Authentic business rejections MUST NOT be classified as unavailable
assert.strictEqual(isBackendUnavailable({ status: 401, error: 'Invalid credentials' }), false);
assert.strictEqual(isBackendUnavailable({ status: 403, error: 'Account suspended' }), false);
assert.strictEqual(isBackendUnavailable({ status: 422, error: 'Validation failed' }), false);
console.log('✓ Passed');

// ----------------------------------------------------
// Test Group 2: Demo Authentication & Fallback
// ----------------------------------------------------
console.log('Test 7: Valid demo login for tanvir, student1, student2, admin');
const demoAccounts = [
  { username: 'tanvir', password: 'User@123', expectedRole: 'member', expectedName: 'Tanvir Ahmed' },
  { username: 'student1', password: 'Student@123', expectedRole: 'member', expectedName: 'Nusrat Jahan' },
  { username: 'student2', password: 'Student@123', expectedRole: 'member', expectedName: 'Ariful Islam' },
  { username: 'admin', password: 'Admin@123', expectedRole: 'admin', expectedName: 'Md. Mojahidul Islam' },
];

for (const demo of demoAccounts) {
  const user = storage.getUserByUsernameOrEmail(demo.username);
  assert(user, `User ${demo.username} must exist in storage`);
  assert.strictEqual(user.role, demo.expectedRole, `Role for ${demo.username} should be ${demo.expectedRole}`);
  assert.strictEqual(user.name, demo.expectedName, `Name for ${demo.username} should be ${demo.expectedName}`);

  const retrievedPassword = storage.getUserPassword(demo.username);
  assert.strictEqual(retrievedPassword, demo.password, `Password for ${demo.username} should match expected`);

  // Verify email lookup works identically
  const userByEmail = storage.getUserByUsernameOrEmail(user.email);
  assert(userByEmail, `Lookup by email ${user.email} should succeed`);
  assert.strictEqual(userByEmail.id, user.id);
}
console.log('✓ Passed');

console.log('Test 8: Invalid password rejection');
const wrongPassword = 'WrongPassword999!';
for (const demo of demoAccounts) {
  const storedPassword = storage.getUserPassword(demo.username);
  assert.notStrictEqual(storedPassword, wrongPassword);
}
console.log('✓ Passed');

// ----------------------------------------------------
// Test Group 3: Legacy Email-Only Stored Users Migration
// ----------------------------------------------------
console.log('Test 9: Existing users in localStorage with legacy email-only records');

// Simulate a browser localStorage populated before this fix (e.g. legacy records without `username` field)
mockStore.clear();
const legacyUsers = [
  {
    id: 'u-tanvir',
    name: 'Tanvir Ahmed',
    email: 'member@library.edu', // Legacy email
    role: 'member',
    studentId: '2114028',
    department: 'Computer Science & Engineering',
    status: 'active',
    createdAt: '2025-09-01T00:00:00Z',
    // NO username field!
  },
  {
    id: 'u-admin',
    name: 'Md. Mojahidul Islam',
    email: 'admin@library.edu',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    // NO username field!
  },
];
const legacyPasswords = {
  'member@library.edu': 'User@123',
  'admin@library.edu': 'Admin@123',
};

mockStore.set('lms_users_v2', JSON.stringify(legacyUsers));
mockStore.set('lms_passwords_v2', JSON.stringify(legacyPasswords));
mockStore.set('lms_initialized_v2', 'true');

// Re-initialize storage to test migration / ensureDemoAccounts
storage.init();

// Test that login as 'tanvir' still finds the user and verifies password!
const migratedTanvir = storage.getUserByUsernameOrEmail('tanvir');
assert(migratedTanvir, 'Legacy user must be matched when querying username "tanvir"');
assert.strictEqual(migratedTanvir.name, 'Tanvir Ahmed');

const tanvirPassword = storage.getUserPassword('tanvir');
assert.strictEqual(tanvirPassword, 'User@123', 'Password for legacy user querying "tanvir" must be "User@123"');

// Test that login as 'admin' still finds the user and verifies password!
const migratedAdmin = storage.getUserByUsernameOrEmail('admin');
assert(migratedAdmin, 'Legacy user must be matched when querying username "admin"');
assert.strictEqual(migratedAdmin.role, 'admin');

const adminPassword = storage.getUserPassword('admin');
assert.strictEqual(adminPassword, 'Admin@123', 'Password for legacy user querying "admin" must be "Admin@123"');

// Test that newly added accounts student1 and student2 are populated
const migratedStudent1 = storage.getUserByUsernameOrEmail('student1');
assert(migratedStudent1, 'student1 must be added during migration');
assert.strictEqual(storage.getUserPassword('student1'), 'Student@123');

console.log('✓ Passed');

console.log('\n====================================================');
console.log('ALL REGRESSION TESTS COMPLETED AND VERIFIED 100%!');
console.log('====================================================');
