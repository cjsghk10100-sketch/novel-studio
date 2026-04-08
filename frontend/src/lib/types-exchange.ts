/**
 * Exchange types — auto-generated from hermod OpenAPI spec.
 */

export interface ExchangeDepthLevel {
  /** Amount at this level */
  amount: number
  /** Price level */
  price: number
}

export interface ExchangeFundingHistoryItem {
  /** Exchange identifier */
  exchange: string
  /** Funding rate at this settlement */
  funding_rate: number | null
  /** Perpetual contract pair like BTC/USDT */
  pair: string
  /** Unix timestamp in seconds */
  timestamp: number | null
}

export interface ExchangeFundingItem {
  /** Exchange identifier */
  exchange: string
  /** Current funding rate (0.0001 = 0.01%) */
  funding_rate: number | null
  /** Index price derived from the weighted average of spot prices across multiple exchanges */
  index_price: number | null
  /** Funding interval like 8h */
  interval: string | null
  /** Mark price calculated by the exchange from the index price and funding rate, used as the reference for liquidations */
  mark_price: number | null
  /** Next settlement time ISO8601 */
  next_funding: string | null
  /** Perpetual contract pair like BTC/USDT */
  pair: string
}

export interface ExchangeKlineItem {
  /** Closing price */
  close: number
  /** Highest price during the interval */
  high: number
  /** Lowest price during the interval */
  low: number
  /** Opening price */
  open: number
  /** Candle open time in Unix seconds */
  timestamp: number | null
  /** Trading volume in base currency units */
  volume: number
}

export interface ExchangeLongShortRatioItem {
  /** Exchange identifier */
  exchange: string
  /** Ratio of longs to shorts (e.g. 1.5 means 60% long / 40% short). To get percentages: long% = ratio/(ratio+1)*100, short% = 100/(ratio+1) */
  long_short_ratio: number | null
  /** Perpetual contract pair like BTC/USDT */
  pair: string
  /** Unix timestamp in seconds */
  timestamp: number | null
}

export interface ExchangeMarketItem {
  /** Whether the market is active */
  active: boolean | null
  /** Base currency */
  base: string | null
  /** Exchange identifier */
  exchange: string
  /** Default maker fee rate */
  maker_fee: number | null
  /** Trading pair like BTC/USDT */
  pair: string
  /** Quote currency */
  quote: string | null
  /** Default taker fee rate */
  taker_fee: number | null
  /** Market type: spot, swap, future, option */
  type: string | null
}

export interface ExchangeOpenInterestItem {
  /** Exchange identifier */
  exchange: string
  /** Open interest in contracts */
  open_interest_amount: number | null
  /** Open interest in USD */
  open_interest_usd: number | null
  /** Trading pair like BTC/USDT */
  pair: string
  /** Unix timestamp in seconds */
  timestamp: number | null
}

export interface ExchangePriceItem {
  /** Best ask price */
  ask: number | null
  /** Best bid price */
  bid: number | null
  /** Price change percentage in 24h */
  change_24h_pct: number | null
  /** Exchange identifier like binance, okx */
  exchange: string
  /** 24h high price */
  high_24h: number | null
  /** Last traded price */
  last: number | null
  /** 24h low price */
  low_24h: number | null
  /** Trading pair like BTC/USDT */
  pair: string
  /** Unix timestamp in seconds */
  timestamp: number | null
  /** 24h trading volume in base currency units */
  volume_24h_base: number | null
}

export interface ExchangeDepthItem {
  /** Total ask-side depth in base currency units */
  ask_depth: number | null
  /** Sell orders, price ascending */
  asks: ExchangeDepthLevel[] | null
  /** Total bid-side depth in base currency units */
  bid_depth: number | null
  /** Buy orders, price descending */
  bids: ExchangeDepthLevel[] | null
  /** Exchange identifier */
  exchange: string
  /** (best_bid + best_ask) / 2 */
  mid_price: number | null
  /** Trading pair like BTC/USDT */
  pair: string
  /** Best ask - best bid */
  spread: number | null
  /** Spread as percent of mid price */
  spread_pct: number | null
}

export interface ExchangeKlineResponse {
  /** OHLCV candles */
  candles: ExchangeKlineItem[] | null
  /** Number of candles */
  count: number
  /** Exchange identifier */
  exchange: string
  /** Candle interval */
  interval: string
  /** Trading pair */
  pair: string
  /** Last candle datetime */
  period_end: string | null
  /** Highest price in period */
  period_high: number | null
  /** Lowest price in period */
  period_low: number | null
  /** First candle datetime */
  period_start: string | null
  /** Total volume in period */
  period_volume: number | null
}

export interface ExchangePerpResponse {
  /** Exchange identifier */
  exchange: string
  /** Current funding rate data; null when not requested */
  funding: ExchangeFundingItem
  /** Current open interest data; null when not requested */
  open_interest: ExchangeOpenInterestItem
  /** Perpetual contract pair like BTC/USDT */
  pair: string
}
