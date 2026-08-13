const test = require('node:test');
const assert = require('node:assert/strict');
const { CRYPTO_LIST, CRYPTO_CODES } = require('../shared/crypto.js');

test('CRYPTO_LIST has exactly 20 entries', () => {
  assert.equal(CRYPTO_LIST.length, 20);
});

test('CRYPTO_LIST codes are unique and lowercase', () => {
  const codes = CRYPTO_LIST.map((c) => c.code);
  assert.equal(new Set(codes).size, codes.length);
  for (const code of codes) assert.equal(code, code.toLowerCase());
});

test('every entry has a non-empty code and name', () => {
  for (const { code, name } of CRYPTO_LIST) {
    assert.ok(code.length > 0);
    assert.ok(name.length > 0);
  }
});

test('CRYPTO_CODES matches CRYPTO_LIST codes', () => {
  assert.equal(CRYPTO_CODES.size, CRYPTO_LIST.length);
  for (const { code } of CRYPTO_LIST) assert.ok(CRYPTO_CODES.has(code));
});
