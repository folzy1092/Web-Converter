const CURRENCY_COUNTRY = {
  usd: 'US', eur: 'EU', gbp: 'GB', jpy: 'JP', cny: 'CN', rub: 'RU', kzt: 'KZ', uah: 'UA',
  byn: 'BY', try: 'TR', chf: 'CH', cad: 'CA', aud: 'AU', nzd: 'NZ', inr: 'IN', krw: 'KR',
  brl: 'BR', mxn: 'MX', zar: 'ZA', sek: 'SE', nok: 'NO', dkk: 'DK', pln: 'PL', czk: 'CZ',
  huf: 'HU', ron: 'RO', bgn: 'BG', isk: 'IS', ils: 'IL', aed: 'AE', sar: 'SA', qar: 'QA',
  kwd: 'KW', bhd: 'BH', omr: 'OM', egp: 'EG', ngn: 'NG', kes: 'KE', ghs: 'GH', thb: 'TH',
  sgd: 'SG', myr: 'MY', idr: 'ID', php: 'PH', vnd: 'VN', pkr: 'PK', bdt: 'BD', lkr: 'LK',
  npr: 'NP', azn: 'AZ', amd: 'AM', gel: 'GE', uzs: 'UZ', kgs: 'KG', tjs: 'TJ', tmt: 'TM',
  mdl: 'MD', all: 'AL', mkd: 'MK', rsd: 'RS', bam: 'BA', mnt: 'MN', hkd: 'HK', twd: 'TW',
  clp: 'CL', ars: 'AR', pen: 'PE', cop: 'CO', uyu: 'UY', bob: 'BO', pyg: 'PY', gtq: 'GT',
  crc: 'CR', dop: 'DO', jmd: 'JM', ttd: 'TT', xcd: 'AG'
};

function codeToFlag(code) {
  const country = CURRENCY_COUNTRY[String(code || '').toLowerCase()];
  if (!country) return '';
  return country
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

function flagCountryFor(code) {
  return CURRENCY_COUNTRY[String(code || '').toLowerCase()] || null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { codeToFlag, flagCountryFor, CURRENCY_COUNTRY };
}
