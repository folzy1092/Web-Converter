// shared/format.js
const FORMAT_COMPACT_THRESHOLD = 1e15;

function formatAmount(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (!Number.isFinite(n)) return '—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= FORMAT_COMPACT_THRESHOLD) {
    // Clamp the value itself before formatting, not just its precision --
    // otherwise a runaway magnitude (e.g. 1e23) still produces an
    // unbounded-length string like "111 112 140 000 трлн", since ru-RU's
    // compact notation has no unit name above "трлн" and just multiplies
    // the coefficient instead of growing the suffix.
    return sign + FORMAT_COMPACT_THRESHOLD.toLocaleString('ru-RU', { notation: 'compact', maximumFractionDigits: 0 }) + '+';
  }
  return n.toLocaleString('ru-RU', { maximumSignificantDigits: 6 });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatAmount };
}
