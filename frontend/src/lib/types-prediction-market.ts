/**
 * Prediction Market types — auto-generated from hermod OpenAPI spec.
 */

export interface KalshiMarketItem {
  /** Surf curated market category */
  category?: string
  /** Market close time (Unix seconds) */
  close_time?: number
  /** Market end time (Unix seconds) */
  end_time?: number
  /** Parent event ticker */
  event_ticker: string
  /** Event title */
  event_title?: string
  /** Previous day open interest from daily report */
  last_day_open_interest: number
  /** Unique market ticker identifier */
  market_ticker: string
  /** Last day notional trading volume in USD (each contract = $1) */
  notional_volume_usd: number
  /** Open interest (contracts) */
  open_interest: number
  /** Payout type */
  payout_type: string
  /** Market result if resolved */
  result?: string
  /** Market start time (Unix seconds) */
  start_time?: number
  /** Market status */
  status: string
  /** Surf curated market subcategory */
  subcategory?: string
  /** Market title */
  title: string
  /** Total trading volume (contracts) */
  total_volume: number
}

export interface KalshiOIPoint {
  /** Open interest on this date (contracts) */
  open_interest: number
  /** Unix timestamp in seconds (midnight UTC for the trading day) */
  timestamp: number
}

export interface KalshiPriceSide {
  /** Outcome label: `Yes` or `No` */
  label: string
  /** Price as probability (0-1) */
  price: number
}

export interface KalshiTrade {
  /** Unique market ticker identifier */
  market_ticker: string
  /** No outcome price as probability (0-1) */
  no_price: number
  /** Notional volume in USD (each contract = $1) */
  notional_volume_usd: number
  /** Taker side: `yes` or `no` */
  taker_side: string
  /** Unix timestamp in seconds */
  timestamp: number
  /** Unique trade identifier */
  trade_id: string
  /** Yes outcome price as probability (0-1) */
  yes_price: number
}

export interface KalshiVolumePoint {
  /** Notional volume in USD (each contract counted as $1) */
  notional_volume_usd: number
  /** Unix timestamp in seconds (midnight UTC for the trading day) */
  timestamp: number
}

export interface PolymarketActivity {
  /** Market condition identifier */
  condition_id: string
  /** Outcome label */
  outcome: string
  /** Trade price (0-1) */
  price: number
  /** Trade side */
  side: string
  /** Trade size in shares */
  size: number
  /** Activity Unix timestamp in seconds */
  timestamp: number
  /** Market title */
  title: string
  /** Transaction hash */
  transaction_hash: string
  /** Activity type such as `buy`, `sell`, or `redeem` */
  type: string
  /** Trade size in USDC */
  usdc_size: number
}

export interface PolymarketMarketSide {
  /** Token identifier for this outcome */
  id: string
  /** Outcome label */
  label: string
}

export interface PolymarketOIPoint {
  /** Daily net change in USD */
  daily_net_change_usd: number
  /** Open interest in USD */
  open_interest_usd: number
  /** Unix timestamp in seconds (midnight UTC) */
  timestamp: number
}

export interface PolymarketPosition {
  /** Average entry price (0-1) */
  avg_price: number
  /** Unrealized profit and loss in USD */
  cash_pnl: number
  /** Market condition identifier */
  condition_id: string
  /** Current market price (0-1) */
  cur_price: number
  /** Current position value in USD */
  current_value: number
  /** Outcome label */
  outcome_label: string
  /** Market question */
  question: string
  /** Realized profit and loss in USD */
  realized_pnl: number
  /** Whether the position is redeemable */
  redeemable: boolean
  /** Position size in shares */
  size: number
}

export interface PolymarketPriceSide {
  /** Outcome label such as `Yes` or `No` */
  label: string
  /** Average price over the interval (0-1) */
  price: number
  /** Outcome token identifier */
  token_id: string
}

export interface PolymarketRankingItem {
  /** Surf curated market category */
  category?: string
  /** Unique condition identifier */
  condition_id: string
  /** Market end time (Unix seconds) */
  end_time?: number
  /** Notional trading volume (USD) */
  notional_volume_usd: number
  /** Current open interest (USD) */
  open_interest_usd: number
  /** Link to Polymarket page */
  polymarket_link?: string
  /** Market question text */
  question: string
  /** Market status */
  status: string
  /** Surf curated market subcategory */
  subcategory?: string
  /** Market tags */
  tags?: string[] | null
}

export interface PolymarketTrade {
  /** Trade amount in USD */
  amount_usd: number
  /** Block number */
  block_number: number
  /** Trade Unix timestamp in seconds */
  block_time: number
  /** Market condition identifier */
  condition_id: string
  /** Event log index */
  evt_index: number
  /** Exchange contract address */
  exchange_address: string
  /** Fee amount in USD */
  fee_usd: number
  /** Maker wallet address */
  maker_address: string
  /** Whether this is a negative risk trade */
  neg_risk: boolean
  /** Outcome label such as `Yes` or `No` */
  outcome_label: string
  /** Outcome token identifier */
  outcome_token_id: string
  /** Trade price (0-1) */
  price: number
  /** Market question text */
  question: string
  /** Number of shares traded */
  shares: number
  /** Taker wallet address */
  taker_address: string
  /** Transaction hash */
  tx_hash: string
}

export interface PolymarketVolumePoint {
  /** Notional trading volume in USD */
  notional_volume_usd: number
  /** Interval start Unix timestamp in seconds */
  timestamp: number
  /** Number of trades */
  trade_count: number
}

export interface PredictionMarketCategoryMetricsItem {
  /** Top-level category */
  category: string
  /** Notional trading volume in USD */
  notional_volume_usd: number
  /** Open interest in USD */
  open_interest_usd: number
  /** Prediction market platform: Kalshi or Polymarket */
  source: string
  /** Subcategory within the category */
  subcategory: string
  /** Unix timestamp in seconds (midnight UTC for the trading day) */
  timestamp: number
}

export interface KalshiEvent {
  /** Event subtitle */
  event_subtitle?: string
  /** Unique event ticker identifier */
  event_ticker: string
  /** Event title */
  event_title: string
  /** Number of markets in this event */
  market_count: number
  /** Markets within this event */
  markets: KalshiMarketItem[] | null
}

export interface KalshiPricePoint {
  /** Highest price as probability (0-1) */
  high: number
  /** Lowest price as probability (0-1) */
  low: number
  /** Opening price as probability (0-1). Present for daily interval only. */
  open?: number
  /** Yes outcome price data (close price for daily/hourly) */
  side_a: KalshiPriceSide
  /** No outcome price data (close price for daily/hourly) */
  side_b: KalshiPriceSide
  /** Unix timestamp in seconds (midnight UTC for daily, hour start for hourly, trade time for latest) */
  timestamp: number
}

export interface PolymarketMarketItem {
  /** Surf curated market category */
  category?: string
  /** Market close time (Unix seconds) */
  close_time?: number
  /** Resolution time (Unix seconds) */
  completed_time?: number
  /** Unique condition identifier */
  condition_id: string
  /** Market description */
  description?: string
  /** Market end time (Unix seconds) */
  end_time?: number
  /** Event identifier slug */
  event_slug?: string
  /** Game start time for sports markets (Unix seconds) */
  game_start_time?: number
  /** Market image URL */
  image?: string
  /** Market identifier slug */
  market_slug: string
  /** Negative risk market identifier */
  negative_risk_id?: string
  /** Link to Polymarket page */
  polymarket_link?: string
  /** URL to resolution data source */
  resolution_source?: string
  /** First outcome */
  side_a?: PolymarketMarketSide
  /** Second outcome */
  side_b?: PolymarketMarketSide
  /** Market start time (Unix seconds) */
  start_time?: number
  /** Market status: `open` or `closed` */
  status: string
  /** Surf curated market subcategory */
  subcategory?: string
  /** Market tags */
  tags?: string[] | null
  /** Market title */
  title: string
  /** Trading volume in the past month (USD) */
  volume_1_month: number
  /** Trading volume in the past week (USD) */
  volume_1_week: number
  /** Trading volume in the past year (USD) */
  volume_1_year: number
  /** Total trading volume (USD) */
  volume_total: number
  /** Winning outcome label, if resolved */
  winning_side?: string
}

export interface PolymarketPricePoint {
  /** First outcome price data */
  side_a?: PolymarketPriceSide
  /** Second outcome price data */
  side_b?: PolymarketPriceSide
  /** Interval start Unix timestamp in seconds */
  timestamp: number
}

export interface PolymarketEvent {
  /** Surf curated event category */
  category?: string
  /** Event description */
  description?: string
  /** Event end time (Unix seconds) */
  end_time?: number
  /** Event identifier slug */
  event_slug: string
  /** Event image URL */
  image?: string
  /** Number of markets in this event */
  market_count: number
  /** Markets within this event */
  markets: PolymarketMarketItem[] | null
  /** Resolution source URL */
  settlement_sources?: string
  /** Event start time (Unix seconds) */
  start_time?: number
  /** Event status: `open` if any market is open, `closed` if all markets are closed */
  status: string
  /** Surf curated event subcategory */
  subcategory?: string
  /** Event tags */
  tags?: string[] | null
  /** Event title */
  title: string
  /** Total event volume across all markets (USD) */
  volume_total: number
}
