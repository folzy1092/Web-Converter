const SYMBOL_MAP = {
  '$': 'usd',
  '€': 'eur',
  '£': 'gbp',
  '¥': 'cny',
  '₽': 'rub',
  '₸': 'kzt',
  '₴': 'uah',
  '₺': 'try',
  '₹': 'inr',
  '₩': 'krw',
  '₫': 'vnd',
  '₪': 'ils',
  'zł': 'pln',
  'руб.': 'rub',
  'руб': 'rub',
  'грн': 'uah',
  'тг': 'kzt',
  'br': 'byn',
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSymbolPattern() {
  return Object.keys(SYMBOL_MAP)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join('|');
}

function parseNumber(raw) {
  const cleaned = raw.replace(/\s/g, '');
  const seps = [...cleaned.matchAll(/[.,]/g)];

  if (seps.length === 0) {
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  const distinctChars = new Set(seps.map((s) => s[0]));

  if (distinctChars.size === 2) {
    const lastSep = seps[seps.length - 1];
    const intPart = cleaned.slice(0, lastSep.index).replace(/[.,]/g, '');
    const fracPart = cleaned.slice(lastSep.index + 1);
    const n = Number(`${intPart}.${fracPart}`);
    return Number.isFinite(n) ? n : null;
  }

  if (seps.length > 1) {
    const n = Number(cleaned.replace(/[.,]/g, ''));
    return Number.isFinite(n) ? n : null;
  }

  const sep = seps[0];
  const afterDigits = cleaned.length - sep.index - 1;

  if (afterDigits === 1 || afterDigits === 2) {
    const intPart = cleaned.slice(0, sep.index);
    const fracPart = cleaned.slice(sep.index + 1);
    const n = Number(`${intPart}.${fracPart}`);
    return Number.isFinite(n) ? n : null;
  }

  const n = Number(cleaned.replace(/[.,]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function parsePrice(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return null;

  const symbolPattern = buildSymbolPattern();
  const re = new RegExp(
    `^(?:(${symbolPattern})\\s?)?([0-9][0-9.,\\s]*[0-9]|[0-9])(?:\\s?(${symbolPattern}))?$`,
    'i'
  );
  const m = trimmed.match(re);
  if (!m) return null;

  const symbolText = m[1] || m[3];
  if (!symbolText) return null;

  const code = SYMBOL_MAP[symbolText.toLowerCase()];
  if (!code) return null;

  const amount = parseNumber(m[2]);
  if (amount == null) return null;

  return { code, amount };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SYMBOL_MAP, parseNumber, parsePrice };
}
