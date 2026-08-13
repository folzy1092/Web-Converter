// tests/rates.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  fetchAndCacheRates,
  getCachedRates,
  isStale,
  ensureFreshRates,
  CACHE_MAX_AGE_MS,
} = require('../shared/rates.js');

function fakeStorage(initial = {}) {
  let data = { ...initial };
  return {
    async get(keys) {
      const out = {};
      for (const k of keys) out[k] = data[k];
      return out;
    },
    async set(obj) {
      data = { ...data, ...obj };
    },
    _dump: () => data,
  };
}

test('fetchAndCacheRates stores ratesUSD, currencyNames and a timestamp', async () => {
  const storage = fakeStorage();
  const fetchFn = async (url) => ({
    ok: true,
    status: 200,
    json: async () =>
      url.includes('currencies.json')
        ? { usd: 'US Dollar', rub: 'Russian Ruble' }
        : { date: '2026-08-13', usd: { usd: 1, rub: 92 } },
  });

  const result = await fetchAndCacheRates(storage, fetchFn);

  assert.deepEqual(result.ratesUSD, { usd: 1, rub: 92 });
  assert.deepEqual(result.currencyNames, { usd: 'US Dollar', rub: 'Russian Ruble' });
  assert.ok(typeof result.ratesTimestamp === 'number');
  assert.deepEqual(storage._dump().ratesUSD, { usd: 1, rub: 92 });
});

test('fetchAndCacheRates throws when either fetch fails', async () => {
  const storage = fakeStorage();
  const fetchFn = async () => ({ ok: false, status: 500, json: async () => null });
  await assert.rejects(() => fetchAndCacheRates(storage, fetchFn));
});

test('fetchAndCacheRates throws and does not cache when the response is missing the usd rates object', async () => {
  const storage = fakeStorage();
  let setCalled = false;
  storage.set = async (obj) => {
    setCalled = true;
  };
  const fetchFn = async (url) => ({
    ok: true,
    status: 200,
    json: async () =>
      url.includes('currencies.json')
        ? { usd: 'US Dollar', rub: 'Russian Ruble' }
        : { date: '2026-08-13' },
  });

  await assert.rejects(() => fetchAndCacheRates(storage, fetchFn));
  assert.equal(setCalled, false);
});

test('isStale is true with no timestamp and false right after fetch', () => {
  assert.equal(isStale(undefined), true);
  assert.equal(isStale(Date.now()), false);
  assert.equal(isStale(Date.now() - CACHE_MAX_AGE_MS - 1), true);
});

test('ensureFreshRates skips fetching when cache is fresh', async () => {
  const storage = fakeStorage({
    ratesUSD: { usd: 1 },
    currencyNames: { usd: 'US Dollar' },
    ratesTimestamp: Date.now(),
  });
  let fetchCalled = false;
  const fetchFn = async () => {
    fetchCalled = true;
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const result = await ensureFreshRates(storage, fetchFn);

  assert.equal(fetchCalled, false);
  assert.deepEqual(result.ratesUSD, { usd: 1 });
});

test('ensureFreshRates falls back to stale cache when fetch fails', async () => {
  const storage = fakeStorage({
    ratesUSD: { usd: 1, rub: 90 },
    currencyNames: { usd: 'US Dollar' },
    ratesTimestamp: Date.now() - CACHE_MAX_AGE_MS - 1,
  });
  const fetchFn = async () => ({ ok: false, status: 500, json: async () => null });

  const result = await ensureFreshRates(storage, fetchFn);

  assert.equal(result.stale, true);
  assert.deepEqual(result.ratesUSD, { usd: 1, rub: 90 });
});

test('ensureFreshRates throws when stale and there is no cache at all', async () => {
  const storage = fakeStorage();
  const fetchFn = async () => ({ ok: false, status: 500, json: async () => null });
  await assert.rejects(() => ensureFreshRates(storage, fetchFn));
});
