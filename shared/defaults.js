// shared/defaults.js
const DEFAULT_SELECTED = ['rub', 'usd', 'eur', 'try', 'kzt', 'uah', 'byn'];
const DEFAULT_BASE = 'rub';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_SELECTED, DEFAULT_BASE };
}
