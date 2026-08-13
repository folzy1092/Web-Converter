const CRYPTO_LIST = [
  { code: 'btc', name: 'Bitcoin' },
  { code: 'eth', name: 'Ethereum' },
  { code: 'usdt', name: 'Tether' },
  { code: 'usdc', name: 'USD Coin' },
  { code: 'bnb', name: 'BNB' },
  { code: 'xrp', name: 'XRP' },
  { code: 'sol', name: 'Solana' },
  { code: 'doge', name: 'Dogecoin' },
  { code: 'ada', name: 'Cardano' },
  { code: 'trx', name: 'TRON' },
  { code: 'avax', name: 'Avalanche' },
  { code: 'shib', name: 'Shiba Inu' },
  { code: 'dot', name: 'Polkadot' },
  { code: 'link', name: 'Chainlink' },
  { code: 'bch', name: 'Bitcoin Cash' },
  { code: 'ltc', name: 'Litecoin' },
  { code: 'sui', name: 'Sui' },
  { code: 'arb', name: 'Arbitrum' },
  { code: 'xlm', name: 'Stellar' },
  { code: 'atom', name: 'Cosmos' },
];

const CRYPTO_CODES = new Set(CRYPTO_LIST.map((c) => c.code));

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CRYPTO_LIST, CRYPTO_CODES };
}
