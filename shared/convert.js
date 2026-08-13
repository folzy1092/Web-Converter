function rateBetween(fromCode, toCode, ratesUSD) {
  const from = ratesUSD[String(fromCode).toLowerCase()];
  const to = ratesUSD[String(toCode).toLowerCase()];
  if (from == null || to == null) return null;
  return to / from;
}

function convertAmount(amount, fromCode, toCode, ratesUSD) {
  if (fromCode === toCode) return amount;
  const rate = rateBetween(fromCode, toCode, ratesUSD);
  if (rate == null) return null;
  return amount * rate;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { rateBetween, convertAmount };
}
