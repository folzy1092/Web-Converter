// tests/priceParser.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { parsePrice, parseNumber } = require('../content/priceParser.js');

test('parseNumber: three digits after one separator is thousands', () => {
  assert.equal(parseNumber('1.003'), 1003);
  assert.equal(parseNumber('1,003'), 1003);
});

test('parseNumber: one or two digits after one separator is decimal', () => {
  assert.equal(parseNumber('99.90'), 99.9);
  assert.equal(parseNumber('1,5'), 1.5);
});

test('parseNumber: two different separators — last one is decimal', () => {
  assert.equal(parseNumber('1,003.45'), 1003.45);
  assert.equal(parseNumber('1.003,45'), 1003.45);
});

test('parseNumber: repeated same separator is all thousands', () => {
  assert.equal(parseNumber('1.000.000'), 1000000);
});

test('parseNumber: spaces as thousand separators', () => {
  assert.equal(parseNumber('1 099'), 1099);
});

test('parseNumber: plain integer', () => {
  assert.equal(parseNumber('1099'), 1099);
});

test('parsePrice: prefix symbol, no space', () => {
  assert.deepEqual(parsePrice('$1003'), { code: 'usd', amount: 1003 });
});

test('parsePrice: prefix symbol with space', () => {
  assert.deepEqual(parsePrice('$ 1 003'), { code: 'usd', amount: 1003 });
});

test('parsePrice: prefix symbol, comma thousands', () => {
  assert.deepEqual(parsePrice('$1,099'), { code: 'usd', amount: 1099 });
});

test('parsePrice: prefix symbol, dot decimal', () => {
  assert.deepEqual(parsePrice('€99.90'), { code: 'eur', amount: 99.9 });
});

test('parsePrice: suffix symbol with space', () => {
  assert.deepEqual(parsePrice('1 099 ₽'), { code: 'rub', amount: 1099 });
});

test('parsePrice: ambiguous single separator, 3 digits -> thousands', () => {
  assert.deepEqual(parsePrice('$1.003'), { code: 'usd', amount: 1003 });
});

test('parsePrice: two separators, US style', () => {
  assert.deepEqual(parsePrice('$1,003.45'), { code: 'usd', amount: 1003.45 });
});

test('parsePrice: two separators, EU style, suffix symbol', () => {
  assert.deepEqual(parsePrice('1.003,45 €'), { code: 'eur', amount: 1003.45 });
});

test('parsePrice: no currency symbol at all -> null', () => {
  assert.equal(parsePrice('1099'), null);
  assert.equal(parsePrice('1,099'), null);
});

test('parsePrice: no number -> null', () => {
  assert.equal(parsePrice('$'), null);
  assert.equal(parsePrice('hello world'), null);
});

test('parsePrice: surrounding whitespace is trimmed', () => {
  assert.deepEqual(parsePrice('  $1003  '), { code: 'usd', amount: 1003 });
});
