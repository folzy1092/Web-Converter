// shared/format.js
function formatAmount(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toLocaleString('ru-RU', { maximumSignificantDigits: 6 });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatAmount };
}
