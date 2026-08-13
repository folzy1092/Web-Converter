// tests/flags.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { codeToFlag, flagCountryFor } = require('../shared/flags.js');

test('codeToFlag maps known fiat codes to flag emoji', () => {
  assert.equal(codeToFlag('usd'), '🇺🇸');
  assert.equal(codeToFlag('RUB'), '🇷🇺');
  assert.equal(codeToFlag('eur'), '🇪🇺');
  assert.equal(codeToFlag('kzt'), '🇰🇿');
});

test('codeToFlag returns empty string for unmapped codes', () => {
  assert.equal(codeToFlag('xau'), '');
  assert.equal(codeToFlag('btc'), '');
  assert.equal(codeToFlag(''), '');
});

test('flagCountryFor returns the ISO country code for known fiat codes', () => {
  assert.equal(flagCountryFor('usd'), 'US');
  assert.equal(flagCountryFor('RUB'), 'RU');
  assert.equal(flagCountryFor('eur'), 'EU');
});

test('flagCountryFor returns null for unmapped codes', () => {
  assert.equal(flagCountryFor('btc'), null);
  assert.equal(flagCountryFor(''), null);
});
