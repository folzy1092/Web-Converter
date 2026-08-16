// shared/defaults.js
const DEFAULT_SELECTED = ['rub', 'usd', 'eur', 'try', 'kzt', 'uah', 'byn'];
const DEFAULT_BASE = 'rub';
const DEFAULT_POPUP_THEME = 'light';
const DEFAULT_TOOLTIP_THEME = 'dark';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_SELECTED, DEFAULT_BASE, DEFAULT_POPUP_THEME, DEFAULT_TOOLTIP_THEME };
}
