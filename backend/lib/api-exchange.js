/**
 * Exchange API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 * CommonJS module. Usage: const { fetchXxx } = require('./api-exchange')
 */

'use strict'

const { proxyGet, proxyPost } = require('./api')

/**
 * @typedef {Object} ExchangeDepthItem
 * @property {?number} ask_depth — Total ask-side depth in base currency units
 * @property {Array<ExchangeDepthLevel>|null} asks — Sell orders, price ascending
 * @property {?number} bid_depth — Total bid-side depth in base currency units
 * @property {Array<ExchangeDepthLevel>|null} bids — Buy orders, price descending
 * @property {string} exchange — Exchange identifier
 * @property {?number} mid_price — (best_bid + best_ask) / 2
 * @property {string} pair — Trading pair like BTC/USDT
 * @property {?number} spread — Best ask - best bid
 * @property {?number} spread_pct — Spread as percent of mid price
 */

/**
 * @typedef {Object} ExchangeFundingHistoryItem
 * @property {string} exchange — Exchange identifier
 * @property {?number} funding_rate — Funding rate at this settlement
 * @property {string} pair — Perpetual contract pair like BTC/USDT
 * @property {?number} timestamp — Unix timestamp in seconds
 */

/**
 * @typedef {Object} ExchangeKlineResponse
 * @property {Array<ExchangeKlineItem>|null} candles — OHLCV candles
 * @property {number} count — Number of candles
 * @property {string} exchange — Exchange identifier
 * @property {string} interval — Candle interval
 * @property {string} pair — Trading pair
 * @property {?string} period_end — Last candle datetime
 * @property {?number} period_high — Highest price in period
 * @property {?number} period_low — Lowest price in period
 * @property {?string} period_start — First candle datetime
 * @property {?number} period_volume — Total volume in period
 */

/**
 * @typedef {Object} ExchangeLongShortRatioItem
 * @property {string} exchange — Exchange identifier
 * @property {?number} long_short_ratio — Ratio of longs to shorts (e.g. 1.5 means 60% long / 40% short). To get percentages: long% = ratio/(ratio+1)*100, short% = 100/(ratio+1)
 * @property {string} pair — Perpetual contract pair like BTC/USDT
 * @property {?number} timestamp — Unix timestamp in seconds
 */

/**
 * @typedef {Object} ExchangeMarketItem
 * @property {?boolean} active — Whether the market is active
 * @property {?string} base — Base currency
 * @property {string} exchange — Exchange identifier
 * @property {?number} maker_fee — Default maker fee rate
 * @property {string} pair — Trading pair like BTC/USDT
 * @property {?string} quote — Quote currency
 * @property {?number} taker_fee — Default taker fee rate
 * @property {?string} type — Market type: spot, swap, future, option
 */

/**
 * @typedef {Object} ExchangePerpResponse
 * @property {string} exchange — Exchange identifier
 * @property {ExchangeFundingItem} funding — Current funding rate data; null when not requested
 * @property {ExchangeOpenInterestItem} open_interest — Current open interest data; null when not requested
 * @property {string} pair — Perpetual contract pair like BTC/USDT
 */

/**
 * @typedef {Object} ExchangePriceItem
 * @property {?number} ask — Best ask price
 * @property {?number} bid — Best bid price
 * @property {?number} change_24h_pct — Price change percentage in 24h
 * @property {string} exchange — Exchange identifier like binance, okx
 * @property {?number} high_24h — 24h high price
 * @property {?number} last — Last traded price
 * @property {?number} low_24h — 24h low price
 * @property {string} pair — Trading pair like BTC/USDT
 * @property {?number} timestamp — Unix timestamp in seconds
 * @property {?number} volume_24h_base — 24h trading volume in base currency units
 */


/**
 * Get order book bid/ask levels with computed stats: spread, spread percentage, mid-price, and total bid/ask depth. Use `limit` to control the number of price levels (1–100, default 20).

Set `type=swap` to query perpetual contract order books instead of spot.
 * @param {Object} params
 * @param {string} params.pair — Trading pair (e.g. BTC/USDT)
 * @param {('spot'|'swap')} [params.type] — Market type: spot for spot trading, swap for perpetual contracts (default: spot)
 * @param {number} [params.limit] — Number of price levels (1-100) (default: 20) @min 1 @max 100
 * @param {('binance'|'okx'|'bybit'|'bitget'|'coinbase'|'kraken'|'gate'|'mexc'|'upbit'|'bitstamp'|'deribit'|'bitmex'|'bithumb')} [params.exchange] — Exchange identifier (default: binance)
 * @returns {Promise<{{data: Array<ExchangeDepthItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchExchangeDepth(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  const qs = {}
  qs['pair'] = String(params.pair)
  qs['type'] = String(params?.type ?? 'spot')
  qs['limit'] = String(params?.limit ?? 20)
  qs['exchange'] = String(params?.exchange ?? 'binance')
  return proxyGet(`exchange/depth`, qs)
}

/**
 * Get historical funding rate records for a perpetual contract. Use `from` to set the start time and `limit` to control result count. For longer history, paginate by using the last returned timestamp as the next `from` value.

Note: not all exchanges support historical queries via `from`; some only return recent data regardless.

For the latest funding rate snapshot, see `/exchange/perp?fields=funding`.
 * @param {Object} params
 * @param {string} params.pair — Trading pair (e.g. BTC/USDT)
 * @param {string} [params.from] — Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD, ISO8601). Not all exchanges support historical queries; some only return recent data regardless of this value.
 * @param {number} [params.limit] — Max number of records. For longer history, paginate using the last returned timestamp as the next from value. (default: 100) @min 1 @max 500
 * @param {('binance'|'okx'|'bybit'|'bitget'|'gate'|'htx'|'mexc'|'bitfinex'|'bitmex')} [params.exchange] — Exchange identifier (default: binance)
 * @returns {Promise<{{data: Array<ExchangeFundingHistoryItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchExchangeFundingHistory(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(500, params.limit))
  const qs = {}
  qs['pair'] = String(params.pair)
  if (params?.from !== undefined) qs['from'] = String(params.from)
  qs['limit'] = String(params?.limit ?? 100)
  qs['exchange'] = String(params?.exchange ?? 'binance')
  return proxyGet(`exchange/funding-history`, qs)
}

/**
 * Get OHLCV candlestick data with period summary stats (high, low, total volume). Supports 15 intervals from `1m` to `1M`.

Use `from` to set the start time and `limit` to control how many candles to return. For longer ranges, paginate by using the last returned candle's timestamp as the next `from` value. Exchange-side limits vary (200–1000 per request).

Set `type=swap` to query perpetual contract candles instead of spot.
 * @param {Object} params
 * @param {string} params.pair — Trading pair (e.g. BTC/USDT)
 * @param {('spot'|'swap')} [params.type] — Market type: spot for spot trading, swap for perpetual contracts (default: spot)
 * @param {('1m'|'3m'|'5m'|'15m'|'30m'|'1h'|'2h'|'4h'|'6h'|'8h'|'12h'|'1d'|'3d'|'1w'|'1M')} [params.interval] — Candle interval (default: 1h)
 * @param {string} [params.from] — Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD, ISO8601)
 * @param {number} [params.limit] — Max number of candles to return. Exchange may cap lower (e.g. 200-1000). For longer ranges, paginate using the last returned timestamp as the next from value. (default: 100) @min 1 @max 1000
 * @param {('binance'|'okx'|'bybit'|'bitget'|'coinbase'|'kraken'|'gate'|'htx'|'kucoin'|'mexc'|'upbit'|'bitfinex'|'bitstamp'|'deribit'|'bitmex'|'bithumb')} [params.exchange] — Exchange identifier (default: binance)
 * @returns {Promise<{{data: Array<ExchangeKlineResponse>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchExchangeKlines(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(1000, params.limit))
  const qs = {}
  qs['pair'] = String(params.pair)
  qs['type'] = String(params?.type ?? 'spot')
  qs['interval'] = String(params?.interval ?? '1h')
  if (params?.from !== undefined) qs['from'] = String(params.from)
  qs['limit'] = String(params?.limit ?? 100)
  qs['exchange'] = String(params?.exchange ?? 'binance')
  return proxyGet(`exchange/klines`, qs)
}

/**
 * Get historical long/short ratio for a perpetual contract — ratio value, long account percentage, and short account percentage. Use `interval` (`1h`, `4h`, `1d`) for granularity, `from` for start time, and `limit` for result count. For longer history, paginate by using the last returned timestamp as the next `from` value.

Note: not all exchanges support historical queries via `from`; some only return recent data regardless.

Just pass the base pair (e.g. `pair=BTC/USDT`). For aggregated cross-exchange long/short ratio, see `/market/futures`.
 * @param {Object} params
 * @param {string} params.pair — Trading pair (e.g. BTC/USDT)
 * @param {('1h'|'4h'|'1d')} [params.interval] — Data interval (default: 1h)
 * @param {string} [params.from] — Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD, ISO8601). Not all exchanges support historical queries; some only return recent data regardless of this value.
 * @param {number} [params.limit] — Max number of records. For longer history, paginate using the last returned timestamp as the next from value. (default: 50) @min 1 @max 500
 * @param {('binance'|'okx'|'bybit'|'bitget')} [params.exchange] — Exchange identifier (default: binance)
 * @returns {Promise<{{data: Array<ExchangeLongShortRatioItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchExchangeLongShortRatio(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(500, params.limit))
  const qs = {}
  qs['pair'] = String(params.pair)
  qs['interval'] = String(params?.interval ?? '1h')
  if (params?.from !== undefined) qs['from'] = String(params.from)
  qs['limit'] = String(params?.limit ?? 50)
  qs['exchange'] = String(params?.exchange ?? 'binance')
  return proxyGet(`exchange/long-short-ratio`, qs)
}

/**
 * List trading pairs available on an exchange. Filter by `type` (`spot`, `swap`, `future`, `option`) or free-text `search`.

Returns pair name, base/quote currencies, market type, active status, and default fee rates. Use the returned `pair` values as the `pair` parameter in other exchange endpoints.
 * @param {Object} params
 * @param {('binance'|'okx'|'bybit'|'bitget'|'coinbase'|'kraken'|'gate'|'htx'|'kucoin'|'mexc'|'upbit'|'bitfinex'|'bitstamp'|'deribit'|'bitmex'|'bithumb')} [params.exchange] — Exchange identifier. When omitted, searches across all supported exchanges.
 * @param {('spot'|'swap'|'future'|'option')} [params.type] — Filter: spot, swap, future, option
 * @param {string} [params.base] — Filter by base currency
 * @param {string} [params.quote] — Filter by quote currency
 * @param {string} [params.search] — Fuzzy search in pair/base/quote
 * @param {number} [params.limit] — Max results (default: 100) @min 1 @max 5000
 * @returns {Promise<{{data: Array<ExchangeMarketItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchExchangeMarkets(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(5000, params?.limit))
  const qs = {}
  if (params?.exchange !== undefined) qs['exchange'] = String(params.exchange)
  if (params?.type !== undefined) qs['type'] = String(params.type)
  if (params?.base !== undefined) qs['base'] = String(params.base)
  if (params?.quote !== undefined) qs['quote'] = String(params.quote)
  if (params?.search !== undefined) qs['search'] = String(params.search)
  qs['limit'] = String(params?.limit ?? 100)
  return proxyGet(`exchange/markets`, qs)
}

/**
 * Get a combined snapshot of perpetual contract data for a pair. Use `fields` to select which sub-resources to fetch: `funding` (current funding rate, next settlement, mark/index price) and/or `oi` (open interest in contracts and USD).

Just pass the base pair (e.g. `pair=BTC/USDT`). The `:USDT` swap suffix is added automatically.
 * @param {Object} params
 * @param {string} params.pair — Trading pair (e.g. BTC/USDT). The swap suffix ':USDT' is added automatically.
 * @param {string} [params.fields] — Comma-separated fields to include: 'funding' (current funding rate), 'oi' (open interest). Defaults to all fields. (default: funding,oi)
 * @param {('binance'|'okx'|'bybit'|'bitget'|'htx'|'bitfinex'|'bitmex')} [params.exchange] — Exchange identifier (default: binance)
 * @returns {Promise<{{data: ExchangePerpResponse, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchExchangePerp(params) {
  const qs = {}
  qs['pair'] = String(params.pair)
  qs['fields'] = String(params?.fields ?? 'funding,oi')
  qs['exchange'] = String(params?.exchange ?? 'binance')
  return proxyGet(`exchange/perp`, qs)
}

/**
 * Get the real-time ticker for a trading pair — last price, bid/ask, 24h high/low, 24h volume, and 24h price change.

Set `type=swap` to query perpetual contract prices instead of spot. For historical price trends, use `/market/price`.
 * @param {Object} params
 * @param {string} params.pair — Trading pair (e.g. BTC/USDT)
 * @param {('spot'|'swap')} [params.type] — Market type: spot for spot trading, swap for perpetual contracts (default: spot)
 * @param {('binance'|'okx'|'bybit'|'bitget'|'coinbase'|'kraken'|'gate'|'htx'|'kucoin'|'mexc'|'upbit'|'bitfinex'|'bitstamp'|'deribit'|'bitmex'|'bithumb')} [params.exchange] — Exchange identifier (default: binance)
 * @returns {Promise<{{data: Array<ExchangePriceItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchExchangePrice(params) {
  const qs = {}
  qs['pair'] = String(params.pair)
  qs['type'] = String(params?.type ?? 'spot')
  qs['exchange'] = String(params?.exchange ?? 'binance')
  return proxyGet(`exchange/price`, qs)
}

module.exports = {
  fetchExchangeDepth,
  fetchExchangeFundingHistory,
  fetchExchangeKlines,
  fetchExchangeLongShortRatio,
  fetchExchangeMarkets,
  fetchExchangePerp,
  fetchExchangePrice,
}
