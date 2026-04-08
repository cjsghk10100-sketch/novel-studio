/**
 * Market types — auto-generated from hermod OpenAPI spec.
 */

export interface ETFTickerFlow {
  /** Daily net flow in USD for this ticker */
  flow_usd: number
  /** ETF ticker symbol like `IBIT`, `GBTC`, or `ETHA` */
  ticker: string
}

export interface IndicatorValues {
  /** Bollinger lower band */
  bbands_lower?: number
  /** Bollinger middle band (SMA) */
  bbands_middle?: number
  /** Bollinger upper band */
  bbands_upper?: number
  /** Average Directional Index value */
  dmi_adx?: number
  /** Negative Directional Indicator (-DI) */
  dmi_mdi?: number
  /** Positive Directional Indicator (+DI) */
  dmi_pdi?: number
  /** Ichimoku baseline (Kijun-sen) */
  ichimoku_base?: number
  /** Ichimoku conversion line (Tenkan-sen) */
  ichimoku_conversion?: number
  /** Ichimoku current span A */
  ichimoku_current_span_a?: number
  /** Ichimoku current span B */
  ichimoku_current_span_b?: number
  /** Ichimoku lagging span A */
  ichimoku_lagging_span_a?: number
  /** Ichimoku lagging span B */
  ichimoku_lagging_span_b?: number
  /** Ichimoku leading span A (Senkou A) */
  ichimoku_span_a?: number
  /** Ichimoku leading span B (Senkou B) */
  ichimoku_span_b?: number
  /** MACD histogram (MACD minus signal) */
  macd_hist?: number
  /** MACD signal line */
  macd_signal?: number
  /** MACD line value */
  macd_value?: number
  /** Stochastic %D (slow line) */
  stoch_d?: number
  /** Stochastic %K (fast line) */
  stoch_k?: number
  /** Supertrend direction: `buy` (price above supertrend, bullish) or `sell` (price below supertrend, bearish) */
  supertrend_advice?: string
  /** Supertrend line value */
  supertrend_value?: number
}

export interface LiquidationChartItem {
  /** Long-side aggregated liquidation volume (USD) */
  long_liquidation_usd: number
  /** Short-side aggregated liquidation volume (USD) */
  short_liquidation_usd: number
  /** Unix timestamp in seconds */
  timestamp: number
}

export interface LiquidationExchangeItem {
  /** Exchange name like `Binance` or `OKX`. `All` = aggregate across all exchanges */
  exchange: string
  /** Total liquidation volume (USD) */
  liquidation_usd: number
  /** Long-side liquidation volume (USD) */
  long_liquidation_usd: number
  /** Short-side liquidation volume (USD) */
  short_liquidation_usd: number
}

export interface LiquidationOrderItem {
  /** Base token symbol like `BTC` */
  base_asset: string
  /** Exchange name like `Binance` or `OKX` */
  exchange: string
  /** Liquidation execution price (USD) */
  price: number
  /** Liquidation side: `long` or `short` */
  side: string
  /** Full trading pair like `BTCUSDT` */
  symbol: string
  /** Unix timestamp in seconds */
  timestamp: number
  /** Liquidated position size (USD) */
  usd_value: number
}

export interface MarketFearGreedHistoryItem {
  /** Human-readable classification (Extreme Fear, Fear, Neutral, Greed, Extreme Greed) */
  classification: string
  /** BTC price in USD at this point in time */
  price: number
  /** Unix timestamp in seconds for this data point */
  timestamp: number
  /** Fear and Greed Index score from 0 (extreme fear) to 100 (extreme greed) */
  value: number
}

export interface MarketFuturesItem {
  /** Current funding rate as a decimal (`0.0001` = 0.01%) */
  funding_rate: number
  /** Ratio of long to short positions */
  long_short_ratio: number
  /** Total open interest in USD */
  open_interest: number
  /** Trading symbol like `BTC` or `ETH` */
  symbol: string
  /** Unix timestamp (seconds) of last update */
  updated_at: number
  /** 24-hour trading volume in USD */
  volume_24h: number
  /** 24-hour volume change in USD (positive=increase, negative=decrease) */
  volume_change_24h: number
}

export interface MarketMetricPoint {
  /** Metric name like `nupl`, `sopr`, or `price` */
  metric?: string
  /** Token symbol this data point belongs to */
  symbol?: string
  /** Unix timestamp in seconds for this data point */
  timestamp: number
  /** Metric value at this timestamp */
  value: number
}

export interface MarketOptionsItem {
  /** Options exchange name */
  exchange: string
  /** Max pain price for the nearest expiry in USD. Only available for individual exchanges (Deribit, OKX, Binance, Bybit), not present on the `All` aggregate row. */
  max_pain_price?: number
  /** Total options open interest in USD */
  open_interest: number
  /** Put/call open interest ratio (put OI / call OI). Values above 1 indicate bearish sentiment. Only available for individual exchanges (Deribit, OKX, Binance, Bybit), not present on the `All` aggregate row. */
  put_call_ratio?: number
  /** Underlying token symbol like `BTC` or `ETH` */
  symbol: string
  /** Unix timestamp (seconds) of last update */
  updated_at: number
  /** 24-hour options trading volume in USD */
  volume_24h: number
}

export interface MarketTopCoinItem {
  /** All-time high price in USD */
  ath?: number
  /** All-time low price in USD */
  atl?: number
  /** Price change percentage over the last 24 hours */
  change_24h_pct: number
  /** Circulating token supply */
  circulating_supply?: number
  /** Fully diluted valuation in USD */
  fdv?: number
  /** Highest price in the last 24 hours in USD */
  high_24h: number
  /** Token logo image URL */
  image?: string
  /** Lowest price in the last 24 hours in USD */
  low_24h: number
  /** Total market capitalization in USD */
  market_cap_usd: number
  /** Maximum token supply (e.g. 21M for BTC). Not available for all tokens. */
  max_supply?: number
  /** Full token name */
  name: string
  /** Current price in USD */
  price_usd: number
  /** Rank position in the list (1 = highest) */
  rank: number
  /** Token ticker symbol like `BTC` or `ETH` */
  symbol: string
  /** Total token supply */
  total_supply?: number
  /** 24-hour trading volume in USD */
  volume_24h_usd: number
}

export interface MarketETFFlowItem {
  /** Flow breakdown by individual ETF ticker */
  etfs?: ETFTickerFlow[] | null
  /** Daily net flow in USD (positive=inflow, negative=outflow) */
  flow_usd: number
  /** Token price in USD at close of day */
  price_usd: number
  /** Unix timestamp in seconds (midnight UTC for the trading day) */
  timestamp: number
}

export interface MarketIndicatorItem {
  /** Time interval used to compute the indicator like `1h`, `4h`, or `1d` */
  interval: string
  /** Indicator name like `rsi`, `macd`, or `bbands` */
  name: string
  /** Token symbol this indicator is computed for */
  symbol: string
  /** Candle open timestamp in Unix seconds (present in time-series responses) */
  timestamp?: number
  /** Unix timestamp in seconds when the indicator was last computed */
  updated_at?: number
  /** Primary indicator value */
  value: number
  /** Component values for multi-value indicators. Present for macd, bbands, stoch, dmi, ichimoku, supertrend. Nil for single-value indicators (rsi, ema, sma, atr, cci, obv, vwap). */
  values?: IndicatorValues
}
