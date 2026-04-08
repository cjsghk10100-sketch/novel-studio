/**
 * Prediction Market API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 * CommonJS module. Usage: const { fetchXxx } = require('./api-prediction-market')
 */

'use strict'

const { proxyGet, proxyPost } = require('./api')

/**
 * @typedef {Object} KalshiEvent
 * @property {string} [event_subtitle] — Event subtitle
 * @property {string} event_ticker — Unique event ticker identifier
 * @property {string} event_title — Event title
 * @property {number} market_count — Number of markets in this event
 * @property {Array<KalshiMarketItem>|null} markets — Markets within this event
 */

/**
 * @typedef {Object} KalshiMarketItem
 * @property {string} [category] — Surf curated market category
 * @property {number} [close_time] — Market close time (Unix seconds)
 * @property {number} [end_time] — Market end time (Unix seconds)
 * @property {string} event_ticker — Parent event ticker
 * @property {string} [event_title] — Event title
 * @property {number} last_day_open_interest — Previous day open interest from daily report
 * @property {string} market_ticker — Unique market ticker identifier
 * @property {number} notional_volume_usd — Last day notional trading volume in USD (each contract = $1)
 * @property {number} open_interest — Open interest (contracts)
 * @property {string} payout_type — Payout type
 * @property {string} [result] — Market result if resolved
 * @property {number} [start_time] — Market start time (Unix seconds)
 * @property {string} status — Market status
 * @property {string} [subcategory] — Surf curated market subcategory
 * @property {string} title — Market title
 * @property {number} total_volume — Total trading volume (contracts)
 */

/**
 * @typedef {Object} KalshiOIPoint
 * @property {number} open_interest — Open interest on this date (contracts)
 * @property {number} timestamp — Unix timestamp in seconds (midnight UTC for the trading day)
 */

/**
 * @typedef {Object} KalshiPricePoint
 * @property {number} high — Highest price as probability (0-1)
 * @property {number} low — Lowest price as probability (0-1)
 * @property {number} [open] — Opening price as probability (0-1). Present for daily interval only.
 * @property {KalshiPriceSide} side_a — Yes outcome price data (close price for daily/hourly)
 * @property {KalshiPriceSide} side_b — No outcome price data (close price for daily/hourly)
 * @property {number} timestamp — Unix timestamp in seconds (midnight UTC for daily, hour start for hourly, trade time for latest)
 */

/**
 * @typedef {Object} KalshiTrade
 * @property {string} market_ticker — Unique market ticker identifier
 * @property {number} no_price — No outcome price as probability (0-1)
 * @property {number} notional_volume_usd — Notional volume in USD (each contract = $1)
 * @property {string} taker_side — Taker side: `yes` or `no`
 * @property {number} timestamp — Unix timestamp in seconds
 * @property {string} trade_id — Unique trade identifier
 * @property {number} yes_price — Yes outcome price as probability (0-1)
 */

/**
 * @typedef {Object} KalshiVolumePoint
 * @property {number} notional_volume_usd — Notional volume in USD (each contract counted as $1)
 * @property {number} timestamp — Unix timestamp in seconds (midnight UTC for the trading day)
 */

/**
 * @typedef {Object} PolymarketActivity
 * @property {string} condition_id — Market condition identifier
 * @property {string} outcome — Outcome label
 * @property {number} price — Trade price (0-1)
 * @property {string} side — Trade side
 * @property {number} size — Trade size in shares
 * @property {number} timestamp — Activity Unix timestamp in seconds
 * @property {string} title — Market title
 * @property {string} transaction_hash — Transaction hash
 * @property {string} type — Activity type such as `buy`, `sell`, or `redeem`
 * @property {number} usdc_size — Trade size in USDC
 */

/**
 * @typedef {Object} PolymarketEvent
 * @property {string} [category] — Surf curated event category
 * @property {string} [description] — Event description
 * @property {number} [end_time] — Event end time (Unix seconds)
 * @property {string} event_slug — Event identifier slug
 * @property {string} [image] — Event image URL
 * @property {number} market_count — Number of markets in this event
 * @property {Array<PolymarketMarketItem>|null} markets — Markets within this event
 * @property {string} [settlement_sources] — Resolution source URL
 * @property {number} [start_time] — Event start time (Unix seconds)
 * @property {string} status — Event status: `open` if any market is open, `closed` if all markets are closed
 * @property {string} [subcategory] — Surf curated event subcategory
 * @property {Array<string>|null} [tags] — Event tags
 * @property {string} title — Event title
 * @property {number} volume_total — Total event volume across all markets (USD)
 */

/**
 * @typedef {Object} PolymarketMarketItem
 * @property {string} [category] — Surf curated market category
 * @property {number} [close_time] — Market close time (Unix seconds)
 * @property {number} [completed_time] — Resolution time (Unix seconds)
 * @property {string} condition_id — Unique condition identifier
 * @property {string} [description] — Market description
 * @property {number} [end_time] — Market end time (Unix seconds)
 * @property {string} [event_slug] — Event identifier slug
 * @property {number} [game_start_time] — Game start time for sports markets (Unix seconds)
 * @property {string} [image] — Market image URL
 * @property {string} market_slug — Market identifier slug
 * @property {string} [negative_risk_id] — Negative risk market identifier
 * @property {string} [polymarket_link] — Link to Polymarket page
 * @property {string} [resolution_source] — URL to resolution data source
 * @property {PolymarketMarketSide} [side_a] — First outcome
 * @property {PolymarketMarketSide} [side_b] — Second outcome
 * @property {number} [start_time] — Market start time (Unix seconds)
 * @property {string} status — Market status: `open` or `closed`
 * @property {string} [subcategory] — Surf curated market subcategory
 * @property {Array<string>|null} [tags] — Market tags
 * @property {string} title — Market title
 * @property {number} volume_1_month — Trading volume in the past month (USD)
 * @property {number} volume_1_week — Trading volume in the past week (USD)
 * @property {number} volume_1_year — Trading volume in the past year (USD)
 * @property {number} volume_total — Total trading volume (USD)
 * @property {string} [winning_side] — Winning outcome label, if resolved
 */

/**
 * @typedef {Object} PolymarketOIPoint
 * @property {number} daily_net_change_usd — Daily net change in USD
 * @property {number} open_interest_usd — Open interest in USD
 * @property {number} timestamp — Unix timestamp in seconds (midnight UTC)
 */

/**
 * @typedef {Object} PolymarketPosition
 * @property {number} avg_price — Average entry price (0-1)
 * @property {number} cash_pnl — Unrealized profit and loss in USD
 * @property {string} condition_id — Market condition identifier
 * @property {number} cur_price — Current market price (0-1)
 * @property {number} current_value — Current position value in USD
 * @property {string} outcome_label — Outcome label
 * @property {string} question — Market question
 * @property {number} realized_pnl — Realized profit and loss in USD
 * @property {boolean} redeemable — Whether the position is redeemable
 * @property {number} size — Position size in shares
 */

/**
 * @typedef {Object} PolymarketPricePoint
 * @property {PolymarketPriceSide} [side_a] — First outcome price data
 * @property {PolymarketPriceSide} [side_b] — Second outcome price data
 * @property {number} timestamp — Interval start Unix timestamp in seconds
 */

/**
 * @typedef {Object} PolymarketRankingItem
 * @property {string} [category] — Surf curated market category
 * @property {string} condition_id — Unique condition identifier
 * @property {number} [end_time] — Market end time (Unix seconds)
 * @property {number} notional_volume_usd — Notional trading volume (USD)
 * @property {number} open_interest_usd — Current open interest (USD)
 * @property {string} [polymarket_link] — Link to Polymarket page
 * @property {string} question — Market question text
 * @property {string} status — Market status
 * @property {string} [subcategory] — Surf curated market subcategory
 * @property {Array<string>|null} [tags] — Market tags
 */

/**
 * @typedef {Object} PolymarketTrade
 * @property {number} amount_usd — Trade amount in USD
 * @property {number} block_number — Block number
 * @property {number} block_time — Trade Unix timestamp in seconds
 * @property {string} condition_id — Market condition identifier
 * @property {number} evt_index — Event log index
 * @property {string} exchange_address — Exchange contract address
 * @property {number} fee_usd — Fee amount in USD
 * @property {string} maker_address — Maker wallet address
 * @property {boolean} neg_risk — Whether this is a negative risk trade
 * @property {string} outcome_label — Outcome label such as `Yes` or `No`
 * @property {string} outcome_token_id — Outcome token identifier
 * @property {number} price — Trade price (0-1)
 * @property {string} question — Market question text
 * @property {number} shares — Number of shares traded
 * @property {string} taker_address — Taker wallet address
 * @property {string} tx_hash — Transaction hash
 */

/**
 * @typedef {Object} PolymarketVolumePoint
 * @property {number} notional_volume_usd — Notional trading volume in USD
 * @property {number} timestamp — Interval start Unix timestamp in seconds
 * @property {number} trade_count — Number of trades
 */

/**
 * @typedef {Object} PredictionMarketCategoryMetricsItem
 * @property {string} category — Top-level category
 * @property {number} notional_volume_usd — Notional trading volume in USD
 * @property {number} open_interest_usd — Open interest in USD
 * @property {string} source — Prediction market platform: Kalshi or Polymarket
 * @property {string} subcategory — Subcategory within the category
 * @property {number} timestamp — Unix timestamp in seconds (midnight UTC for the trading day)
 */


/**
 * Get daily notional volume and open interest aggregated by category across Kalshi and Polymarket. Filter by `source` or `category`.

Data refresh: daily
 * @param {Object} params
 * @param {('Kalshi'|'Polymarket')} [params.source] — Filter by prediction market platform: `Kalshi` or `Polymarket`
 * @param {('crypto'|'culture'|'economics'|'financials'|'politics'|'stem'|'sports')} [params.category] — Filter by top-level category
 * @param {('7d'|'30d'|'90d'|'180d'|'1y'|'all')} [params.time_range] — Predefined time range: `7d`, `30d`, `90d`, `180d`, `1y`, or `all` (default: 30d)
 * @param {number} [params.limit] — Maximum rows to return (default: 200) @min 1 @max 10000
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<PredictionMarketCategoryMetricsItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketCategoryMetrics(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(10000, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
  if (params?.source !== undefined) qs['source'] = String(params.source)
  if (params?.category !== undefined) qs['category'] = String(params.category)
  qs['time_range'] = String(params?.time_range ?? '30d')
  qs['limit'] = String(params?.limit ?? 200)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`prediction-market/category-metrics`, qs)
}

/**
 * Get Kalshi events with nested markets, optionally filtered by `event_ticker`. Each event includes market count and a list of markets.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} params.event_ticker — Event ticker identifier
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<KalshiEvent>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketKalshiEvents(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['event_ticker'] = String(params.event_ticker)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`prediction-market/kalshi/events`, qs)
}

/**
 * Get Kalshi markets, optionally filtered by `market_ticker`. Each market includes price, volume, and status.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} params.market_ticker — Market ticker identifier
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<KalshiMarketItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketKalshiMarkets(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['market_ticker'] = String(params.market_ticker)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`prediction-market/kalshi/markets`, qs)
}

/**
 * Get daily open interest history for a Kalshi market filtered by `time_range`.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} params.ticker — Market ticker identifier
 * @param {('7d'|'30d'|'90d'|'180d'|'1y')} [params.time_range] — Predefined time range: `7d`, `30d`, `90d`, `180d`, or `1y` (default: 30d)
 * @returns {Promise<{{data: Array<KalshiOIPoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketKalshiOpenInterest(params) {
  const qs = {}
  qs['ticker'] = String(params.ticker)
  qs['time_range'] = String(params?.time_range ?? '30d')
  return proxyGet(`prediction-market/kalshi/open-interest`, qs)
}

/**
 * Get price history for a Kalshi market. Use `interval=1d` for daily OHLC from market reports (~30 min delay), or `interval=latest` for real-time price from trades.

Data refresh: ~30 minutes (daily), real-time (latest)
 * @param {Object} params
 * @param {string} params.ticker — Market ticker identifier
 * @param {('7d'|'30d'|'90d'|'180d'|'1y')} [params.time_range] — Predefined time range: `7d`, `30d`, `90d`, `180d`, or `1y`. Ignored when `interval=latest`. (default: 30d)
 * @param {('1h'|'1d'|'latest')} [params.interval] — Data interval: `1h` for hourly, `1d` for daily OHLC, `latest` for real-time price from trades (default: 1d)
 * @returns {Promise<{{data: Array<KalshiPricePoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketKalshiPrices(params) {
  const qs = {}
  qs['ticker'] = String(params.ticker)
  qs['time_range'] = String(params?.time_range ?? '30d')
  qs['interval'] = String(params?.interval ?? '1d')
  return proxyGet(`prediction-market/kalshi/prices`, qs)
}

/**
 * Get top-ranked Kalshi markets by last day's `notional_volume_usd` or `open_interest`. Filter by `status`.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {('notional_volume_usd'|'open_interest')} [params.sort_by] — Field to sort results by (default: notional_volume_usd)
 * @param {('asc'|'desc')} [params.order] — Sort order (default: desc)
 * @param {('active'|'closed'|'determined'|'disputed'|'finalized'|'inactive'|'initialized')} [params.status] — Market status filter: `active`, `closed`, `determined`, `disputed`, `finalized`, `inactive`, or `initialized` (default: active)
 * @param {('crypto'|'culture'|'economics'|'financials'|'politics'|'stem'|'sports'|'unknown')} [params.category] — Filter by category
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<KalshiMarketItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketKalshiRanking(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
  qs['sort_by'] = String(params?.sort_by ?? 'notional_volume_usd')
  qs['order'] = String(params?.order ?? 'desc')
  qs['status'] = String(params?.status ?? 'active')
  if (params?.category !== undefined) qs['category'] = String(params.category)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`prediction-market/kalshi/ranking`, qs)
}

/**
 * Get individual trade records for a Kalshi market. Filter by `taker_side`, `min_contracts`, and date range. Sort by `timestamp` or `num_contracts`.

Data refresh: real-time
 * @param {Object} params
 * @param {string} params.ticker — Market ticker identifier
 * @param {('yes'|'no')} [params.taker_side] — Filter by taker side: `yes` or `no`
 * @param {number} [params.min_amount] — Minimum notional volume in USD (each contract = $1) @min 0
 * @param {string} [params.from] — Start of time range. Accepts Unix seconds (`1704067200`) or date string (`2024-01-01`)
 * @param {string} [params.to] — End of time range. Accepts Unix seconds (`1706745600`) or date string (`2024-02-01`)
 * @param {('timestamp'|'notional_volume_usd')} [params.sort_by] — Field to sort results by (default: timestamp)
 * @param {('asc'|'desc')} [params.order] — Sort order (default: desc)
 * @param {number} [params.limit] — Results per page (default: 50) @min 1 @max 500
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<KalshiTrade>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketKalshiTrades(params) {
  if (params.min_amount !== undefined) params.min_amount = Math.max(0, params.min_amount)
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(500, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['ticker'] = String(params.ticker)
  if (params?.taker_side !== undefined) qs['taker_side'] = String(params.taker_side)
  if (params?.min_amount !== undefined) qs['min_amount'] = String(params.min_amount)
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  qs['sort_by'] = String(params?.sort_by ?? 'timestamp')
  qs['order'] = String(params?.order ?? 'desc')
  qs['limit'] = String(params?.limit ?? 50)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`prediction-market/kalshi/trades`, qs)
}

/**
 * Get daily trading volume history for a Kalshi market filtered by `time_range`.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} params.ticker — Market ticker identifier
 * @param {('7d'|'30d'|'90d'|'180d'|'1y')} [params.time_range] — Predefined time range: `7d`, `30d`, `90d`, `180d`, or `1y` (default: 30d)
 * @returns {Promise<{{data: Array<KalshiVolumePoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketKalshiVolumes(params) {
  const qs = {}
  qs['ticker'] = String(params.ticker)
  qs['time_range'] = String(params?.time_range ?? '30d')
  return proxyGet(`prediction-market/kalshi/volumes`, qs)
}

/**
 * Get trade and redemption activity for a Polymarket wallet.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} params.address — Polymarket proxy wallet address
 * @param {number} [params.limit] — Results per page (default: 50) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<PolymarketActivity>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketPolymarketActivity(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['address'] = String(params.address)
  qs['limit'] = String(params?.limit ?? 50)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`prediction-market/polymarket/activity`, qs)
}

/**
 * Get Polymarket events with nested markets, optionally filtered by `event_slug`. Each event includes aggregated status, volume, and a list of markets with `side_a`/`side_b` outcomes.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} params.event_slug — Event slug identifier
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<PolymarketEvent>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketPolymarketEvents(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['event_slug'] = String(params.event_slug)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`prediction-market/polymarket/events`, qs)
}

/**
 * Get Polymarket markets, optionally filtered by `market_slug`. Each market includes `side_a` and `side_b` outcomes. Current prices are available via `/polymarket/prices` using the `condition_id`.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} params.market_slug — Market slug identifier
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<PolymarketMarketItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketPolymarketMarkets(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['market_slug'] = String(params.market_slug)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`prediction-market/polymarket/markets`, qs)
}

/**
 * Get daily open interest history for a Polymarket market.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} params.condition_id — Market condition identifier
 * @param {('7d'|'30d'|'90d'|'180d'|'1y')} [params.time_range] — Predefined time range (default: 30d)
 * @returns {Promise<{{data: Array<PolymarketOIPoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketPolymarketOpenInterest(params) {
  const qs = {}
  qs['condition_id'] = String(params.condition_id)
  qs['time_range'] = String(params?.time_range ?? '30d')
  return proxyGet(`prediction-market/polymarket/open-interest`, qs)
}

/**
 * Get wallet positions on Polymarket markets.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} params.address — Polymarket proxy wallet address
 * @param {number} [params.limit] — Results per page (default: 50) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<PolymarketPosition>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketPolymarketPositions(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['address'] = String(params.address)
  qs['limit'] = String(params?.limit ?? 50)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`prediction-market/polymarket/positions`, qs)
}

/**
 * Get aggregated price history for a Polymarket market. Use `interval=latest` for the most recent price snapshot.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} params.condition_id — Market condition identifier
 * @param {('7d'|'30d'|'90d'|'180d'|'1y')} [params.time_range] — Predefined time range. Ignored when `interval` is `latest`. (default: 30d)
 * @param {('1h'|'1d'|'latest')} [params.interval] — Aggregation interval: `1h` (hourly), `1d` (daily), or `latest` (most recent snapshot) (default: 1d)
 * @returns {Promise<{{data: Array<PolymarketPricePoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketPolymarketPrices(params) {
  const qs = {}
  qs['condition_id'] = String(params.condition_id)
  qs['time_range'] = String(params?.time_range ?? '30d')
  qs['interval'] = String(params?.interval ?? '1d')
  return proxyGet(`prediction-market/polymarket/prices`, qs)
}

/**
 * Get top-ranked Polymarket markets by `volume_24h`, `volume_7d`, `open_interest`, or `trade_count`. Filter by `status` and `end_before`.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {('notional_volume_usd'|'open_interest')} [params.sort_by] — Sort by last day's `notional_volume_usd` or `open_interest` (default: notional_volume_usd)
 * @param {('asc'|'desc')} [params.order] — Sort order (default: desc)
 * @param {('active'|'finalized'|'ended'|'initialized'|'closed')} [params.status] — Market status filter: `active`, `finalized`, `ended`, `initialized`, or `closed` (default: active)
 * @param {('crypto'|'culture'|'early_polymarket_trades'|'economics'|'financials'|'politics'|'stem'|'sports'|'unknown')} [params.category] — Filter by Surf-curated category
 * @param {('24h'|'3d'|'7d'|'14d'|'30d')} [params.end_before] — Filter markets ending within this window from now: `24h`, `3d`, `7d`, `14d`, or `30d`
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 50
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<PolymarketRankingItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketPolymarketRanking(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(50, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
  qs['sort_by'] = String(params?.sort_by ?? 'notional_volume_usd')
  qs['order'] = String(params?.order ?? 'desc')
  qs['status'] = String(params?.status ?? 'active')
  if (params?.category !== undefined) qs['category'] = String(params.category)
  if (params?.end_before !== undefined) qs['end_before'] = String(params.end_before)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`prediction-market/polymarket/ranking`, qs)
}

/**
 * Get paginated trade records for a Polymarket market or wallet. Filter by `condition_id` (market) or `address` (wallet), plus `outcome_label`, `min_amount`, and date range. At least one of `condition_id` or `address` is required. Sort by `newest`, `oldest`, or `largest`.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} [params.condition_id] — Market condition identifier
 * @param {string} [params.address] — Wallet address — returns trades where the address is maker or taker
 * @param {('Yes'|'No')} [params.outcome_label] — Filter by outcome label: `Yes` or `No`
 * @param {number} [params.min_amount] — Minimum trade amount in USD @min 0
 * @param {string} [params.from] — Start of time range. Accepts Unix seconds (`1704067200`) or date string (`2024-01-01`)
 * @param {string} [params.to] — End of time range. Accepts Unix seconds (`1706745600`) or date string (`2024-02-01`)
 * @param {('timestamp'|'notional_volume_usd')} [params.sort_by] — Field to sort results by (default: timestamp)
 * @param {number} [params.limit] — Results per page (default: 50) @min 1 @max 500
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<PolymarketTrade>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketPolymarketTrades(params) {
  if (params?.min_amount !== undefined) params.min_amount = Math.max(0, params?.min_amount)
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(500, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
  if (params?.condition_id !== undefined) qs['condition_id'] = String(params.condition_id)
  if (params?.address !== undefined) qs['address'] = String(params.address)
  if (params?.outcome_label !== undefined) qs['outcome_label'] = String(params.outcome_label)
  if (params?.min_amount !== undefined) qs['min_amount'] = String(params.min_amount)
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  qs['sort_by'] = String(params?.sort_by ?? 'timestamp')
  qs['limit'] = String(params?.limit ?? 50)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`prediction-market/polymarket/trades`, qs)
}

/**
 * Get trading volume and trade count history for a Polymarket market.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} params.condition_id — Market condition identifier
 * @param {('7d'|'30d'|'90d'|'180d'|'1y')} [params.time_range] — Predefined time range (default: 30d)
 * @param {('1h'|'1d')} [params.interval] — Aggregation interval: `1h` (hourly) or `1d` (daily) (default: 1d)
 * @returns {Promise<{{data: Array<PolymarketVolumePoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchPredictionMarketPolymarketVolumes(params) {
  const qs = {}
  qs['condition_id'] = String(params.condition_id)
  qs['time_range'] = String(params?.time_range ?? '30d')
  qs['interval'] = String(params?.interval ?? '1d')
  return proxyGet(`prediction-market/polymarket/volumes`, qs)
}

module.exports = {
  fetchPredictionMarketCategoryMetrics,
  fetchPredictionMarketKalshiEvents,
  fetchPredictionMarketKalshiMarkets,
  fetchPredictionMarketKalshiOpenInterest,
  fetchPredictionMarketKalshiPrices,
  fetchPredictionMarketKalshiRanking,
  fetchPredictionMarketKalshiTrades,
  fetchPredictionMarketKalshiVolumes,
  fetchPredictionMarketPolymarketActivity,
  fetchPredictionMarketPolymarketEvents,
  fetchPredictionMarketPolymarketMarkets,
  fetchPredictionMarketPolymarketOpenInterest,
  fetchPredictionMarketPolymarketPositions,
  fetchPredictionMarketPolymarketPrices,
  fetchPredictionMarketPolymarketRanking,
  fetchPredictionMarketPolymarketTrades,
  fetchPredictionMarketPolymarketVolumes,
}
