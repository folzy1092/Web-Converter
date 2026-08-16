// shared/format.js
const FORMAT_COMPACT_MIN = 100000;
const FORMAT_CLAMP_MAX = 1e15;

function formatAmount(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (!Number.isFinite(n)) return '—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= FORMAT_CLAMP_MAX) {
    // Clamp the value itself before formatting, not just its precision --
    // otherwise a runaway magnitude (e.g. 1e23) still produces an
    // unbounded-length string like "111 112 140 000 трлн", since ru-RU's
    // compact notation has no unit name above "трлн" and just multiplies
    // the coefficient instead of growing the suffix.
    return sign + FORMAT_CLAMP_MAX.toLocaleString('ru-RU', { notation: 'compact', maximumFractionDigits: 0 }) + '+';
  }
  if (abs >= FORMAT_COMPACT_MIN) {
    // Six-plus-digit amounts never fit legibly in a 76px node circle --
    // shorten to "178,4 млн" instead of squeezing/ellipsizing the full
    // digit-grouped string.
    return n.toLocaleString('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
  }
  return n.toLocaleString('ru-RU', { maximumSignificantDigits: 6 });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatAmount };
}
