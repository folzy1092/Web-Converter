// tests/format.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { formatAmount } = require('../shared/format.js');

test('formatAmount returns an em dash for null/NaN', () => {
  assert.equal(formatAmount(null), '—');
  assert.equal(formatAmount(undefined), '—');
  assert.equal(formatAmount(NaN), '—');
});

test('formatAmount shows meaningful non-zero digits for small crypto-scale amounts', () => {
  const out = formatAmount(0.00019026487748577886);
  assert.ok(out.length > 0);
  assert.notEqual(out, '0');
  assert.notEqual(out, '—');
});

test('formatAmount produces a reasonable-looking string for typical fiat amounts', () => {
  const out9200 = formatAmount(9200);
  const out12_5 = formatAmount(12.5);
  assert.ok(out9200.length > 0);
  assert.ok(out12_5.length > 0);
  assert.notEqual(out9200, '—');
  assert.notEqual(out12_5, '—');
});

test('formatAmount switches to compact notation for runaway magnitudes instead of a huge digit string', () => {
  const out = formatAmount(1.1111214e23);
  assert.ok(out.length < 20, `expected a short compact string, got ${out.length} chars: ${out}`);
});

test('formatAmount stays in full digit-grouped form just under the compact threshold', () => {
  const out = formatAmount(999999999999999);
  assert.ok(!out.includes('e'));
});

test('formatAmount returns an em dash for Infinity', () => {
  assert.equal(formatAmount(Infinity), '—');
  assert.equal(formatAmount(-Infinity), '—');
});
