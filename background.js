// Chrome/Brave/Edge load this as a real service worker, where importScripts
// exists. Firefox runs MV3 background as a plain background page instead
// (no importScripts) and loads shared/rates.js + shared/defaults.js itself
// via manifest.json's background.scripts array before this file runs.
if (typeof importScripts === 'function') {
  importScripts('shared/rates.js', 'shared/defaults.js');
}

const ALARM_NAME = 'refresh-rates';

async function refreshRates() {
  try {
    await ensureFreshRates(chrome.storage.local, fetch);
  } catch (err) {
    console.error('Web Converter: rate refresh failed', err);
  }
}

async function seedDefaults() {
  const existing = await chrome.storage.local.get(['selectedCurrencies', 'baseCurrency']);
  if (!existing.selectedCurrencies) {
    await chrome.storage.local.set({ selectedCurrencies: DEFAULT_SELECTED, baseCurrency: DEFAULT_BASE });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: CACHE_MAX_AGE_MS / 60000 });
  seedDefaults();
  refreshRates();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) refreshRates();
});
