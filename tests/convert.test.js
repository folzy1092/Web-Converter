// tests/convert.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { rateBetween, convertAmount } = require('../shared/convert.js');

const RATES = { usd: 1, rub: 92, eur: 0.92 };

test('rateBetween computes cross rate via USD pivot', () => {
  assert.equal(rateBetween('usd', 'rub', RATES), 92);
  assert.equal(rateBetween('rub', 'usd', RATES), 1 / 92);
});

test('rateBetween returns null for unknown codes', () => {
  assert.equal(rateBetween('usd', 'zzz', RATES), null);
  assert.equal(rateBetween('zzz', 'usd', RATES), null);
});

test('convertAmount converts using the cross rate', () => {
  assert.equal(convertAmount(100, 'usd', 'rub', RATES), 9200);
  assert.ok(Math.abs(convertAmount(9200, 'rub', 'usd', RATES) - 100) < 1e-9);
});

test('convertAmount is a no-op for same-currency pairs', () => {
  assert.equal(convertAmount(42, 'eur', 'eur', RATES), 42);
});

test('convertAmount returns null when a code is missing', () => {
  assert.equal(convertAmount(10, 'usd', 'zzz', RATES), null);
});
