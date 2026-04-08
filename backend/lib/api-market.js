/**
 * Market API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 * CommonJS module. Usage: const { fetchXxx } = require('./api-market')
 */

'use strict'

const { proxyGet, proxyPost } = require('./api')

/**
 * @typedef {Object} LiquidationChartItem
 * @property {number} long_liquidation_usd — Long-side aggregated liquidation volume (USD)
 * @property {number} short_liquidation_usd — Short-side aggregated liquidation volume (USD)
 * @property {number} timestamp — Unix timestamp in seconds
 */

/**
 * @typedef {Object} LiquidationExchangeItem
 * @property {string} exchange — Exchange name like `Binance` or `OKX`. `All` = aggregate across all exchanges
 * @property {number} liquidation_usd — Total liquidation volume (USD)
 * @property {number} long_liquidation_usd — Long-side liquidation volume (USD)
 * @property {number} short_liquidation_usd — Short-side liquidation volume (USD)
 */

/**
 * @typedef {Object} LiquidationOrderItem
 * @property {string} base_asset — Base token symbol like `BTC`
 * @property {string} exchange — Exchange name like `Binance` or `OKX`
 * @property {number} price — Liquidation execution price (USD)
 * @property {string} side — Liquidation side: `long` or `short`
 * @property {string} symbol — Full trading pair like `BTCUSDT`
 * @property {number} timestamp — Unix timestamp in seconds
 * @property {number} usd_value — Liquidated position size (USD)
 */

/**
 * @typedef {Object} MarketETFFlowItem
 * @property {Array<ETFTickerFlow>|null} [etfs] — Flow breakdown by individual ETF ticker
 * @property {number} flow_usd — Daily net flow in USD (positive=inflow, negative=outflow)
 * @property {number} price_usd — Token price in USD at close of day
 * @property {number} timestamp — Unix timestamp in seconds (midnight UTC for the trading day)
 */

/**
 * @typedef {Object} MarketFearGreedHistoryItem
 * @property {string} classification — Human-readable classification (Extreme Fear, Fear, Neutral, Greed, Extreme Greed)
 * @property {number} price — BTC price in USD at this point in time
 * @property {number} timestamp — Unix timestamp in seconds for this data point
 * @property {number} value — Fear and Greed Index score from 0 (extreme fear) to 100 (extreme greed)
 */

/**
 * @typedef {Object} MarketFuturesItem
 * @property {number} funding_rate — Current funding rate as a decimal (`0.0001` = 0.01%)
 * @property {number} long_short_ratio — Ratio of long to short positions
 * @property {number} open_interest — Total open interest in USD
 * @property {string} symbol — Trading symbol like `BTC` or `ETH`
 * @property {number} updated_at — Unix timestamp (seconds) of last update
 * @property {number} volume_24h — 24-hour trading volume in USD
 * @property {number} volume_change_24h — 24-hour volume change in USD (positive=increase, negative=decrease)
 */

/**
 * @typedef {Object} MarketIndicatorItem
 * @property {string} interval — Time interval used to compute the indicator like `1h`, `4h`, or `1d`
 * @property {string} name — Indicator name like `rsi`, `macd`, or `bbands`
 * @property {string} symbol — Token symbol this indicator is computed for
 * @property {number} [timestamp] — Candle open timestamp in Unix seconds (present in time-series responses)
 * @property {number} [updated_at] — Unix timestamp in seconds when the indicator was last computed
 * @property {number} value — Primary indicator value
 * @property {IndicatorValues} [values] — Component values for multi-value indicators. Present for macd, bbands, stoch, dmi, ichimoku, supertrend. Nil for single-value indicators (rsi, ema, sma, atr, cci, obv, vwap).
 */

/**
 * @typedef {Object} MarketMetricPoint
 * @property {string} [metric] — Metric name like `nupl`, `sopr`, or `price`
 * @property {string} [symbol] — Token symbol this data point belongs to
 * @property {number} timestamp — Unix timestamp in seconds for this data point
 * @property {number} value — Metric value at this timestamp
 */

/**
 * @typedef {Object} MarketOptionsItem
 * @property {string} exchange — Options exchange name
 * @property {number} [max_pain_price] — Max pain price for the nearest expiry in USD. Only available for individual exchanges (Deribit, OKX, Binance, Bybit), not present on the `All` aggregate row.
 * @property {number} open_interest — Total options open interest in USD
 * @property {number} [put_call_ratio] — Put/call open interest ratio (put OI / call OI). Values above 1 indicate bearish sentiment. Only available for individual exchanges (Deribit, OKX, Binance, Bybit), not present on the `All` aggregate row.
 * @property {string} symbol — Underlying token symbol like `BTC` or `ETH`
 * @property {number} updated_at — Unix timestamp (seconds) of last update
 * @property {number} volume_24h — 24-hour options trading volume in USD
 */

/**
 * @typedef {Object} MarketTopCoinItem
 * @property {number} [ath] — All-time high price in USD
 * @property {number} [atl] — All-time low price in USD
 * @property {number} change_24h_pct — Price change percentage over the last 24 hours
 * @property {number} [circulating_supply] — Circulating token supply
 * @property {number} [fdv] — Fully diluted valuation in USD
 * @property {number} high_24h — Highest price in the last 24 hours in USD
 * @property {string} [image] — Token logo image URL
 * @property {number} low_24h — Lowest price in the last 24 hours in USD
 * @property {number} market_cap_usd — Total market capitalization in USD
 * @property {number} [max_supply] — Maximum token supply (e.g. 21M for BTC). Not available for all tokens.
 * @property {string} name — Full token name
 * @property {number} price_usd — Current price in USD
 * @property {number} rank — Rank position in the list (1 = highest)
 * @property {string} symbol — Token ticker symbol like `BTC` or `ETH`
 * @property {number} [total_supply] — Total token supply
 * @property {number} volume_24h_usd — 24-hour trading volume in USD
 */


/**
 * Get daily ETF flow history for US spot ETFs — net flow (USD), token price, and per-ticker breakdown. Sorted by date descending. `symbol`: `BTC` or `ETH`.
 * @param {Object} params
 * @param {('BTC'|'ETH')} params.symbol — Token symbol. Can be `BTC` or `ETH`.
 * @param {('flow_usd'|'timestamp')} [params.sort_by] — Field to sort results by (default: timestamp)
 * @param {('asc'|'desc')} [params.order] — Sort order (default: desc)
 * @param {string} [params.from] — Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD)
 * @param {string} [params.to] — End of time range. Accepts Unix seconds or date string (YYYY-MM-DD)
 * @returns {Promise<{{data: Array<MarketETFFlowItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchMarketEtf(params) {
  const qs = {}
  qs['symbol'] = String(params.symbol)
  qs['sort_by'] = String(params?.sort_by ?? 'timestamp')
  qs['order'] = String(params?.order ?? 'desc')
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  return proxyGet(`market/etf`, qs)
}

/**
 * Get Bitcoin Fear & Greed Index history — index value (0-100), classification label, and BTC price at each data point. Sorted newest-first. Use `from`/`to` to filter by date range.
 * @param {Object} params
 * @param {string} [params.from] — Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD)
 * @param {string} [params.to] — End of time range. Accepts Unix seconds or date string (YYYY-MM-DD)
 * @returns {Promise<{{data: Array<MarketFearGreedHistoryItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchMarketFearGreed(params) {
  const qs = {}
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  return proxyGet(`market/fear-greed`, qs)
}

/**
 * Get futures market data across all tracked tokens — open interest, funding rate, long/short ratio, and 24h volume. Sort by `sort_by` (default: volume_24h).
 * @param {Object} params
 * @param {('open_interest'|'funding_rate'|'volume_24h'|'long_short_ratio')} [params.sort_by] — Field to sort results by (default: volume_24h)
 * @param {('asc'|'desc')} [params.order] — Sort order (default: desc)
 * @returns {Promise<{{data: Array<MarketFuturesItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchMarketFutures(params) {
  const qs = {}
  qs['sort_by'] = String(params?.sort_by ?? 'volume_24h')
  qs['order'] = String(params?.order ?? 'desc')
  return proxyGet(`market/futures`, qs)
}

/**
 * Get OHLC-style aggregated liquidation data for a token on a specific exchange. Filter by `symbol`, `exchange`, and `interval`. Useful for charting liquidation volume over time.
 * @param {Object} params
 * @param {string} params.symbol — Token ticker symbol like `BTC` or `ETH`
 * @param {('1m'|'3m'|'5m'|'15m'|'30m'|'1h'|'4h'|'6h'|'8h'|'12h'|'1d'|'1w')} [params.interval] — Candlestick interval. Can be `1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `4h`, `6h`, `8h`, `12h`, `1d`, or `1w`. (default: 1h)
 * @param {('Binance'|'OKX'|'Bybit'|'Bitget'|'Hyperliquid'|'Gate'|'HTX'|'Bitmex'|'Bitfinex'|'CoinEx'|'Aster'|'Lighter')} [params.exchange] — Exchange name. Can be `Binance`, `OKX`, `Bybit`, `Bitget`, `Hyperliquid`, `Gate`, `HTX`, `Bitmex`, `Bitfinex`, `CoinEx`, `Aster`, or `Lighter`. (default: Binance)
 * @param {number} [params.limit] — Results per page (default: 500) @min 1 @max 4500
 * @param {string} [params.from] — Start of time range. Accepts Unix seconds (`1704067200`) or date string (`2024-01-01`)
 * @param {string} [params.to] — End of time range. Accepts Unix seconds (`1706745600`) or date string (`2024-02-01`)
 * @returns {Promise<{{data: Array<LiquidationChartItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchMarketLiquidationChart(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(4500, params.limit))
  const qs = {}
  qs['symbol'] = String(params.symbol)
  qs['interval'] = String(params?.interval ?? '1h')
  qs['exchange'] = String(params?.exchange ?? 'Binance')
  qs['limit'] = String(params?.limit ?? 500)
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  return proxyGet(`market/liquidation/chart`, qs)
}

/**
 * Get liquidation breakdown by exchange — total, long, and short volumes in USD. Filter by `symbol` and `time_range` (`1h`, `4h`, `12h`, `24h`).
 * @param {Object} params
 * @param {string} [params.symbol] — Token ticker symbol like `BTC` or `ETH` (default: BTC)
 * @param {('1h'|'4h'|'12h'|'24h')} [params.time_range] — Aggregation time range. Can be `1h`, `4h`, `12h`, or `24h`. (default: 24h)
 * @param {('liquidation_usd'|'long_liquidation_usd'|'short_liquidation_usd')} [params.sort_by] — Field to sort results by (default: liquidation_usd)
 * @param {('asc'|'desc')} [params.order] — Sort order (default: desc)
 * @returns {Promise<{{data: Array<LiquidationExchangeItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchMarketLiquidationExchangeList(params) {
  const qs = {}
  qs['symbol'] = String(params?.symbol ?? 'BTC')
  qs['time_range'] = String(params?.time_range ?? '24h')
  qs['sort_by'] = String(params?.sort_by ?? 'liquidation_usd')
  qs['order'] = String(params?.order ?? 'desc')
  return proxyGet(`market/liquidation/exchange-list`, qs)
}

/**
 * Get individual large liquidation orders above a USD threshold (`min_amount`, default 10000). Filter by `exchange` and `symbol`.

For aggregate totals and long/short breakdown by exchange, use `/market/liquidation/exchange-list`. For historical liquidation charts, use `/market/liquidation/chart`.
 * @param {Object} params
 * @param {('Binance'|'OKX'|'Bybit'|'Bitget'|'Hyperliquid'|'Gate'|'HTX'|'Bitmex'|'Bitfinex'|'CoinEx'|'Aster'|'Lighter')} [params.exchange] — Exchange name. Can be `Binance`, `OKX`, `Bybit`, `Bitget`, `Hyperliquid`, `Gate`, `HTX`, `Bitmex`, `Bitfinex`, `CoinEx`, `Aster`, or `Lighter`. (default: Binance)
 * @param {string} [params.symbol] — Token ticker symbol like `BTC` or `ETH` (default: BTC)
 * @param {string} [params.min_amount] — Minimum liquidation amount in USD (default: 10000)
 * @param {('long'|'short')} [params.side] — Filter by liquidation side. Omit to return both.
 * @param {('usd_value'|'timestamp'|'price')} [params.sort_by] — Field to sort results by (default: timestamp)
 * @param {('asc'|'desc')} [params.order] — Sort order (default: desc)
 * @param {string} [params.from] — Start of time range. Accepts Unix seconds (`1704067200`) or date string (`2024-01-01`)
 * @param {string} [params.to] — End of time range. Accepts Unix seconds (`1706745600`) or date string (`2024-02-01`)
 * @returns {Promise<{{data: Array<LiquidationOrderItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchMarketLiquidationOrder(params) {
  const qs = {}
  qs['exchange'] = String(params?.exchange ?? 'Binance')
  qs['symbol'] = String(params?.symbol ?? 'BTC')
  qs['min_amount'] = String(params?.min_amount ?? '10000')
  if (params?.side !== undefined) qs['side'] = String(params.side)
  qs['sort_by'] = String(params?.sort_by ?? 'timestamp')
  qs['order'] = String(params?.order ?? 'desc')
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  return proxyGet(`market/liquidation/order`, qs)
}

/**
 * Get on-chain indicator time-series for BTC or ETH. Metrics: `nupl`, `sopr`, `mvrv`, `puell-multiple`, `nvm`, `nvt`, `nvt-golden-cross`, `exchange-flows` (inflow/outflow/netflow/reserve).
 * @param {Object} params
 * @param {('BTC'|'ETH')} params.symbol — Token ticker symbol. Can be `BTC` or `ETH`.
 * @param {('nupl'|'sopr'|'mvrv'|'puell-multiple'|'nvm'|'nvt'|'nvt-golden-cross'|'exchange-flows/inflow'|'exchange-flows/outflow'|'exchange-flows/netflow'|'exchange-flows/reserve')} params.metric — On-chain metric name. Can be `nupl`, `sopr`, `mvrv`, `puell-multiple`, `nvm`, `nvt`, `nvt-golden-cross`, or `exchange-flows/{inflow,outflow,netflow,reserve}`.
 * @param {string} [params.granularity] — Aggregation granularity. (default: day)
 * @param {string} [params.from] — Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD). Defaults to 90 days ago when omitted. Maximum range is 365 days.
 * @param {string} [params.to] — End of time range. Accepts Unix seconds or date string (YYYY-MM-DD). Defaults to today when omitted. Maximum range is 365 days.
 * @param {('all_exchange'|'spot_exchange'|'derivative_exchange'|'binance'|'bybit'|'kraken'|'okx')} [params.exchange] — Exchange filter (only applies to exchange-flow metrics). Can be `all_exchange`, `spot_exchange`, `derivative_exchange`, `binance`, `bybit`, `kraken`, or `okx`. (default: all_exchange)
 * @returns {Promise<{{data: Array<MarketMetricPoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchMarketOnchainIndicator(params) {
  const qs = {}
  qs['symbol'] = String(params.symbol)
  qs['metric'] = String(params.metric)
  qs['granularity'] = String(params?.granularity ?? 'day')
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  qs['exchange'] = String(params?.exchange ?? 'all_exchange')
  return proxyGet(`market/onchain-indicator`, qs)
}

/**
 * Get options market data — open interest, volume, put/call ratio, and max pain price for a `symbol`.
 * @param {Object} params
 * @param {('BTC'|'ETH'|'SOL'|'XRP'|'BNB'|'DOGE'|'ADA'|'AVAX')} params.symbol — Token symbol. Can be `BTC`, `ETH`, `SOL`, `XRP`, `BNB`, `DOGE`, `ADA`, or `AVAX`.
 * @param {('open_interest'|'volume_24h')} [params.sort_by] — Field to sort results by (default: volume_24h)
 * @param {('asc'|'desc')} [params.order] — Sort order (default: desc)
 * @returns {Promise<{{data: Array<MarketOptionsItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchMarketOptions(params) {
  const qs = {}
  qs['symbol'] = String(params.symbol)
  qs['sort_by'] = String(params?.sort_by ?? 'volume_24h')
  qs['order'] = String(params?.order ?? 'desc')
  return proxyGet(`market/options`, qs)
}

/**
 * Get historical price data points for a token. Use `time_range` for predefined windows (`1d`, `7d`, `14d`, `30d`, `90d`, `180d`, `365d`, `max`) or `from`/`to` for a custom date range (Unix timestamp or YYYY-MM-DD). Granularity is automatic: 5-min for 1d, hourly for 7-90d, daily for 180d+.
 * @param {Object} params
 * @param {string} params.symbol — Single token ticker symbol like `BTC`, `ETH`, or `SOL` (multi-symbol not supported)
 * @param {('1d'|'7d'|'14d'|'30d'|'90d'|'180d'|'365d'|'max')} [params.time_range] — Predefined time range for historical data. Ignored when `from`/`to` are set. Can be `1d`, `7d`, `14d`, `30d`, `90d`, `180d`, `365d`, or `max`. (default: 30d)
 * @param {string} [params.from] — Start of custom date range (Unix timestamp or YYYY-MM-DD). Must be used together with `to`. Overrides `time_range` when set.
 * @param {string} [params.to] — End of custom date range (Unix timestamp or YYYY-MM-DD). Must be used together with `from`. Overrides `time_range` when set.
 * @param {string} [params.currency] — Quote currency like `usd`, `eur`, or `btc` (default: usd)
 * @returns {Promise<{{data: Array<MarketMetricPoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchMarketPrice(params) {
  const qs = {}
  qs['symbol'] = String(params.symbol)
  qs['time_range'] = String(params?.time_range ?? '30d')
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  qs['currency'] = String(params?.currency ?? 'usd')
  return proxyGet(`market/price`, qs)
}

/**
 * Get a technical indicator for a trading pair on a given exchange and interval. Set `from`/`to` for time-series mode, omit for latest value. Use `options` for indicator-specific tuning (e.g. `period:7`, `fast_period:8,slow_period:21,signal_period:5`, `period:10,stddev:1.5`). Indicators: `rsi`, `macd`, `ema`, `sma`, `bbands`, `stoch`, `adx`, `atr`, `cci`, `obv`, `vwap`, `dmi`, `ichimoku`, `supertrend`.
 * @param {Object} params
 * @param {('rsi'|'macd'|'ema'|'sma'|'bbands'|'stoch'|'adx'|'atr'|'cci'|'obv'|'vwap'|'dmi'|'ichimoku'|'supertrend')} params.indicator — Technical indicator name. Can be `rsi`, `macd`, `ema`, `sma`, `bbands`, `stoch`, `adx`, `atr`, `cci`, `obv`, `vwap`, `dmi`, `ichimoku`, or `supertrend`.
 * @param {string} params.symbol — Trading pair as `BTC/USDT` or bare symbol like `BTC`
 * @param {('1m'|'5m'|'15m'|'30m'|'1h'|'2h'|'4h'|'12h'|'1d'|'1w')} [params.interval] — Candlestick interval. Can be `1m`, `5m`, `15m`, `30m`, `1h`, `2h`, `4h`, `12h`, `1d`, or `1w`. (default: 1d)
 * @param {('binance'|'bybit'|'coinbase'|'kraken')} [params.exchange] — Exchange for price data. Can be `binance`, `bybit`, `coinbase`, or `kraken`. (default: binance)
 * @param {string} [params.from] — Start of time range. When set, returns time-series instead of latest value. Accepts Unix seconds (`1704067200`) or date string (`2024-01-01`)
 * @param {string} [params.to] — End of time range. Defaults to now when from is set. Accepts Unix seconds (`1706745600`) or date string (`2024-02-01`)
 * @param {string} [params.options] — Indicator-specific options as comma-separated key:value pairs. Available options by indicator: `period` — lookback period for rsi (default 14), sma (default 20), ema (default 20), bbands (default 20), adx (default 14), atr (default 14), cci (default 20), dmi (default 14), stoch (default 14), supertrend (default 10). `stddev` — standard deviation for bbands (default 2). `multiplier` — multiplier for supertrend (default 3). `fast_period` — MACD fast EMA (default 12). `slow_period` — MACD slow EMA (default 26). `signal_period` — MACD signal smoothing (default 9). Examples: `period:7`, `period:200`, `fast_period:8,slow_period:21,signal_period:5`, `period:10,stddev:1.5`.
 * @returns {Promise<{{data: Array<MarketIndicatorItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchMarketPriceIndicator(params) {
  const qs = {}
  qs['indicator'] = String(params.indicator)
  qs['symbol'] = String(params.symbol)
  qs['interval'] = String(params?.interval ?? '1d')
  qs['exchange'] = String(params?.exchange ?? 'binance')
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  if (params?.options !== undefined) qs['options'] = String(params.options)
  return proxyGet(`market/price-indicator`, qs)
}

/**
 * List tokens ranked by metric. Available metrics: `market_cap`, `top_gainers`, `top_losers`, `volume`. Note: `top_gainers` and `top_losers` rank by 24h price change within the top 250 coins by market cap.

For circulating supply, FDV, ATH/ATL, use `/project/detail?fields=token_info`.
 * @param {Object} params
 * @param {('market_cap'|'change_24h'|'volume_24h')} [params.sort_by] — Field to sort by. `market_cap` sorts by total market capitalisation, `change_24h` sorts by 24-hour price change percentage (fetches top 250 by market cap then sorts client-side), `volume_24h` sorts by 24-hour trading volume. (default: market_cap)
 * @param {('asc'|'desc')} [params.order] — Sort order: `desc` (default, highest first) or `asc` (lowest first). (default: desc)
 * @param {('MEME'|'AI'|'AI_AGENTS'|'L1'|'L2'|'DEFI'|'GAMING'|'STABLECOIN'|'RWA'|'DEPIN'|'SOL_ECO'|'BASE_ECO'|'LST')} [params.category] — Optional token category filter. When provided, results are limited to coins in that category. Supported values: MEME, AI, AI_AGENTS, L1, L2, DEFI, GAMING, STABLECOIN, RWA, DEPIN, SOL_ECO, BASE_ECO, LST.
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<MarketTopCoinItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchMarketRanking(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
  qs['sort_by'] = String(params?.sort_by ?? 'market_cap')
  qs['order'] = String(params?.order ?? 'desc')
  if (params?.category !== undefined) qs['category'] = String(params.category)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`market/ranking`, qs)
}

module.exports = {
  fetchMarketEtf,
  fetchMarketFearGreed,
  fetchMarketFutures,
  fetchMarketLiquidationChart,
  fetchMarketLiquidationExchangeList,
  fetchMarketLiquidationOrder,
  fetchMarketOnchainIndicator,
  fetchMarketOptions,
  fetchMarketPrice,
  fetchMarketPriceIndicator,
  fetchMarketRanking,
}
