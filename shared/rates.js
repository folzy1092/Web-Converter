// shared/rates.js
const RATES_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';
const NAMES_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json';
const CACHE_MAX_AGE_MS = 60 * 60 * 1000;

async function fetchAndCacheRates(storage, fetchFn) {
  const [ratesRes, namesRes] = await Promise.all([fetchFn(RATES_URL), fetchFn(NAMES_URL)]);
  if (!ratesRes.ok || !namesRes.ok) {
    throw new Error(`rates fetch failed: rates=${ratesRes.status} names=${namesRes.status}`);
  }
  const ratesJson = await ratesRes.json();
  const currencyNames = await namesRes.json();
  const ratesUSD = ratesJson.usd;
  if (!ratesUSD || typeof ratesUSD !== 'object' || Object.keys(ratesUSD).length === 0) {
    throw new Error('rates fetch failed: malformed response, missing usd rates object');
  }
  const record = { ratesUSD, currencyNames, ratesTimestamp: Date.now() };
  await storage.set(record);
  return record;
}

async function getCachedRates(storage) {
  return storage.get(['ratesUSD', 'currencyNames', 'ratesTimestamp']);
}

function isStale(ratesTimestamp) {
  if (!ratesTimestamp) return true;
  return Date.now() - ratesTimestamp > CACHE_MAX_AGE_MS;
}

async function ensureFreshRates(storage, fetchFn) {
  const cached = await getCachedRates(storage);
  if (!isStale(cached.ratesTimestamp)) return cached;
  try {
    return await fetchAndCacheRates(storage, fetchFn);
  } catch (err) {
    if (cached.ratesUSD) return { ...cached, stale: true, error: err.message };
    throw err;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RATES_URL, NAMES_URL, CACHE_MAX_AGE_MS, fetchAndCacheRates, getCachedRates, isStale, ensureFreshRates };
}
