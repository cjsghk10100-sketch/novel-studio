/**
 * Exchange API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 */

import { proxyGet, proxyPost, type ApiResponse, type ApiObjectResponse, type ExchangeDepthItem, type ExchangeFundingHistoryItem, type ExchangeKlineResponse, type ExchangeLongShortRatioItem, type ExchangeMarketItem, type ExchangePerpResponse, type ExchangePriceItem } from './api'
import { useQuery, useInfiniteQuery, type UseQueryOptions, type UseInfiniteQueryOptions } from '@tanstack/react-query'

/**
 * Get order book bid/ask levels with computed stats: spread, spread percentage, mid-price, and total bid/ask depth. Use `limit` to control the number of price levels (1–100, default 20).

Set `type=swap` to query perpetual contract order books instead of spot.
 * - pair: Trading pair (e.g. BTC/USDT)
 * - type?: Market type: spot for spot trading, swap for perpetual contracts (default: spot)
 * - limit?: Number of price levels (1-100) (default: 20) @min 1 @max 100
 * - exchange?: Exchange identifier (default: binance)
 */
export async function fetchExchangeDepth(params: { pair: string; type?: 'spot' | 'swap'; limit?: number; exchange?: 'binance' | 'okx' | 'bybit' | 'bitget' | 'coinbase' | 'kraken' | 'gate' | 'mexc' | 'upbit' | 'bitstamp' | 'deribit' | 'bitmex' | 'bithumb' }) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  const qs: Record<string, string> = {}
  qs['pair'] = String(params.pair)
  qs['type'] = String(params?.type ?? 'spot')
  qs['limit'] = String(params?.limit ?? 20)
  qs['exchange'] = String(params?.exchange ?? 'binance')
  return proxyGet<ApiResponse<ExchangeDepthItem>>(`exchange/depth`, qs)
}

/**
 * Get historical funding rate records for a perpetual contract. Use `from` to set the start time and `limit` to control result count. For longer history, paginate by using the last returned timestamp as the next `from` value.

Note: not all exchanges support historical queries via `from`; some only return recent data regardless.

For the latest funding rate snapshot, see `/exchange/perp?fields=funding`.
 * - pair: Trading pair (e.g. BTC/USDT)
 * - from?: Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD, ISO8601). Not all exchanges support historical queries; some only return recent data regardless of this value.
 * - limit?: Max number of records. For longer history, paginate using the last returned timestamp as the next from value. (default: 100) @min 1 @max 500
 * - exchange?: Exchange identifier (default: binance)
 */
export async function fetchExchangeFundingHistory(params: { pair: string; from?: string; limit?: number; exchange?: 'binance' | 'okx' | 'bybit' | 'bitget' | 'gate' | 'htx' | 'mexc' | 'bitfinex' | 'bitmex' }) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(500, params.limit))
  const qs: Record<string, string> = {}
  qs['pair'] = String(params.pair)
  if (params?.from !== undefined) qs['from'] = String(params.from)
  qs['limit'] = String(params?.limit ?? 100)
  qs['exchange'] = String(params?.exchange ?? 'binance')
  return proxyGet<ApiResponse<ExchangeFundingHistoryItem>>(`exchange/funding-history`, qs)
}

/**
 * Get OHLCV candlestick data with period summary stats (high, low, total volume). Supports 15 intervals from `1m` to `1M`.

Use `from` to set the start time and `limit` to control how many candles to return. For longer ranges, paginate by using the last returned candle's timestamp as the next `from` value. Exchange-side limits vary (200–1000 per request).

Set `type=swap` to query perpetual contract candles instead of spot.
 * - pair: Trading pair (e.g. BTC/USDT)
 * - type?: Market type: spot for spot trading, swap for perpetual contracts (default: spot)
 * - interval?: Candle interval (default: 1h)
 * - from?: Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD, ISO8601)
 * - limit?: Max number of candles to return. Exchange may cap lower (e.g. 200-1000). For longer ranges, paginate using the last returned timestamp as the next from value. (default: 100) @min 1 @max 1000
 * - exchange?: Exchange identifier (default: binance)
 */
export async function fetchExchangeKlines(params: { pair: string; type?: 'spot' | 'swap'; interval?: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M'; from?: string; limit?: number; exchange?: 'binance' | 'okx' | 'bybit' | 'bitget' | 'coinbase' | 'kraken' | 'gate' | 'htx' | 'kucoin' | 'mexc' | 'upbit' | 'bitfinex' | 'bitstamp' | 'deribit' | 'bitmex' | 'bithumb' }) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(1000, params.limit))
  const qs: Record<string, string> = {}
  qs['pair'] = String(params.pair)
  qs['type'] = String(params?.type ?? 'spot')
  qs['interval'] = String(params?.interval ?? '1h')
  if (params?.from !== undefined) qs['from'] = String(params.from)
  qs['limit'] = String(params?.limit ?? 100)
  qs['exchange'] = String(params?.exchange ?? 'binance')
  return proxyGet<ApiResponse<ExchangeKlineResponse>>(`exchange/klines`, qs)
}

/**
 * Get historical long/short ratio for a perpetual contract — ratio value, long account percentage, and short account percentage. Use `interval` (`1h`, `4h`, `1d`) for granularity, `from` for start time, and `limit` for result count. For longer history, paginate by using the last returned timestamp as the next `from` value.

Note: not all exchanges support historical queries via `from`; some only return recent data regardless.

Just pass the base pair (e.g. `pair=BTC/USDT`). For aggregated cross-exchange long/short ratio, see `/market/futures`.
 * - pair: Trading pair (e.g. BTC/USDT)
 * - interval?: Data interval (default: 1h)
 * - from?: Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD, ISO8601). Not all exchanges support historical queries; some only return recent data regardless of this value.
 * - limit?: Max number of records. For longer history, paginate using the last returned timestamp as the next from value. (default: 50) @min 1 @max 500
 * - exchange?: Exchange identifier (default: binance)
 */
export async function fetchExchangeLongShortRatio(params: { pair: string; interval?: '1h' | '4h' | '1d'; from?: string; limit?: number; exchange?: 'binance' | 'okx' | 'bybit' | 'bitget' }) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(500, params.limit))
  const qs: Record<string, string> = {}
  qs['pair'] = String(params.pair)
  qs['interval'] = String(params?.interval ?? '1h')
  if (params?.from !== undefined) qs['from'] = String(params.from)
  qs['limit'] = String(params?.limit ?? 50)
  qs['exchange'] = String(params?.exchange ?? 'binance')
  return proxyGet<ApiResponse<ExchangeLongShortRatioItem>>(`exchange/long-short-ratio`, qs)
}

/**
 * List trading pairs available on an exchange. Filter by `type` (`spot`, `swap`, `future`, `option`) or free-text `search`.

Returns pair name, base/quote currencies, market type, active status, and default fee rates. Use the returned `pair` values as the `pair` parameter in other exchange endpoints.
 * - exchange?: Exchange identifier. When omitted, searches across all supported exchanges.
 * - type?: Filter: spot, swap, future, option
 * - base?: Filter by base currency
 * - quote?: Filter by quote currency
 * - search?: Fuzzy search in pair/base/quote
 * - limit?: Max results (default: 100) @min 1 @max 5000
 */
export async function fetchExchangeMarkets(params?: { exchange?: 'binance' | 'okx' | 'bybit' | 'bitget' | 'coinbase' | 'kraken' | 'gate' | 'htx' | 'kucoin' | 'mexc' | 'upbit' | 'bitfinex' | 'bitstamp' | 'deribit' | 'bitmex' | 'bithumb'; type?: 'spot' | 'swap' | 'future' | 'option'; base?: string; quote?: string; search?: string; limit?: number }) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(5000, params?.limit))
  const qs: Record<string, string> = {}
  if (params?.exchange !== undefined) qs['exchange'] = String(params.exchange)
  if (params?.type !== undefined) qs['type'] = String(params.type)
  if (params?.base !== undefined) qs['base'] = String(params.base)
  if (params?.quote !== undefined) qs['quote'] = String(params.quote)
  if (params?.search !== undefined) qs['search'] = String(params.search)
  qs['limit'] = String(params?.limit ?? 100)
  return proxyGet<ApiResponse<ExchangeMarketItem>>(`exchange/markets`, qs)
}

/**
 * Get a combined snapshot of perpetual contract data for a pair. Use `fields` to select which sub-resources to fetch: `funding` (current funding rate, next settlement, mark/index price) and/or `oi` (open interest in contracts and USD).

Just pass the base pair (e.g. `pair=BTC/USDT`). The `:USDT` swap suffix is added automatically.
 * - pair: Trading pair (e.g. BTC/USDT). The swap suffix ':USDT' is added automatically.
 * - fields?: Comma-separated fields to include: 'funding' (current funding rate), 'oi' (open interest). Defaults to all fields. (default: funding,oi)
 * - exchange?: Exchange identifier (default: binance)
 */
export async function fetchExchangePerp(params: { pair: string; fields?: string; exchange?: 'binance' | 'okx' | 'bybit' | 'bitget' | 'htx' | 'bitfinex' | 'bitmex' }) {
  const qs: Record<string, string> = {}
  qs['pair'] = String(params.pair)
  qs['fields'] = String(params?.fields ?? 'funding,oi')
  qs['exchange'] = String(params?.exchange ?? 'binance')
  return proxyGet<ApiObjectResponse<ExchangePerpResponse>>(`exchange/perp`, qs)
}

/**
 * Get the real-time ticker for a trading pair — last price, bid/ask, 24h high/low, 24h volume, and 24h price change.

Set `type=swap` to query perpetual contract prices instead of spot. For historical price trends, use `/market/price`.
 * - pair: Trading pair (e.g. BTC/USDT)
 * - type?: Market type: spot for spot trading, swap for perpetual contracts (default: spot)
 * - exchange?: Exchange identifier (default: binance)
 */
export async function fetchExchangePrice(params: { pair: string; type?: 'spot' | 'swap'; exchange?: 'binance' | 'okx' | 'bybit' | 'bitget' | 'coinbase' | 'kraken' | 'gate' | 'htx' | 'kucoin' | 'mexc' | 'upbit' | 'bitfinex' | 'bitstamp' | 'deribit' | 'bitmex' | 'bithumb' }) {
  const qs: Record<string, string> = {}
  qs['pair'] = String(params.pair)
  qs['type'] = String(params?.type ?? 'spot')
  qs['exchange'] = String(params?.exchange ?? 'binance')
  return proxyGet<ApiResponse<ExchangePriceItem>>(`exchange/price`, qs)
}

// ---------------------------------------------------------------------------
// Exchange hooks
// ---------------------------------------------------------------------------

type QueryOpts<T> = Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>

/** Get order book depth — wraps `fetchExchangeDepth` with React Query caching. */
export function useExchangeDepth(params: Parameters<typeof fetchExchangeDepth>[0], opts?: QueryOpts<ApiResponse<ExchangeDepthItem>>) {
  return useQuery({ queryKey: ['exchange', 'depth', params], queryFn: () => fetchExchangeDepth(params!), ...opts })
}

/** Get funding rate history — wraps `fetchExchangeFundingHistory` with React Query caching. */
export function useExchangeFundingHistory(params: Parameters<typeof fetchExchangeFundingHistory>[0], opts?: QueryOpts<ApiResponse<ExchangeFundingHistoryItem>>) {
  return useQuery({ queryKey: ['exchange', 'funding', 'history', params], queryFn: () => fetchExchangeFundingHistory(params!), ...opts })
}

/** Get OHLCV candlestick data — wraps `fetchExchangeKlines` with React Query caching. */
export function useExchangeKlines(params: Parameters<typeof fetchExchangeKlines>[0], opts?: QueryOpts<ApiResponse<ExchangeKlineResponse>>) {
  return useQuery({ queryKey: ['exchange', 'klines', params], queryFn: () => fetchExchangeKlines(params!), ...opts })
}

/** Get long/short ratio history — wraps `fetchExchangeLongShortRatio` with React Query caching. */
export function useExchangeLongShortRatio(params: Parameters<typeof fetchExchangeLongShortRatio>[0], opts?: QueryOpts<ApiResponse<ExchangeLongShortRatioItem>>) {
  return useQuery({ queryKey: ['exchange', 'long', 'short', 'ratio', params], queryFn: () => fetchExchangeLongShortRatio(params!), ...opts })
}

/** List trading pairs — wraps `fetchExchangeMarkets` with React Query caching. */
export function useExchangeMarkets(params?: Parameters<typeof fetchExchangeMarkets>[0], opts?: QueryOpts<ApiResponse<ExchangeMarketItem>>) {
  return useQuery({ queryKey: ['exchange', 'markets', params], queryFn: () => fetchExchangeMarkets(params), ...opts })
}

/** Get perpetual contract snapshot — wraps `fetchExchangePerp` with React Query caching. */
export function useExchangePerp(params: Parameters<typeof fetchExchangePerp>[0], opts?: QueryOpts<ApiObjectResponse<ExchangePerpResponse>>) {
  return useQuery({ queryKey: ['exchange', 'perp', params], queryFn: () => fetchExchangePerp(params!), ...opts })
}

/** Get ticker price — wraps `fetchExchangePrice` with React Query caching. */
export function useExchangePrice(params: Parameters<typeof fetchExchangePrice>[0], opts?: QueryOpts<ApiResponse<ExchangePriceItem>>) {
  return useQuery({ queryKey: ['exchange', 'price', params], queryFn: () => fetchExchangePrice(params!), ...opts })
}
