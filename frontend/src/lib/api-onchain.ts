/**
 * Onchain API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 */

import { proxyGet, proxyPost, type ApiResponse, type ApiObjectResponse, type BridgeRankingItem, type OnchainGasPriceItem, type OnchainSchemaTable, type OnchainTxItem, type StructuredFilter, type StructuredSort, type YieldRankingItem } from './api'
import { useQuery, useInfiniteQuery, type UseQueryOptions, type UseInfiniteQueryOptions } from '@tanstack/react-query'

/**
 * List bridge protocols ranked by total USD volume over a time range.
 * - time_range?: Aggregation window (default: 30d)
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - offset?: Pagination offset (default: 0) @min 0
 */
export async function fetchOnchainBridgeRanking(params?: { time_range?: '7d' | '30d' | '90d' | '180d' | '1y' | 'all'; limit?: number; offset?: number }) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs: Record<string, string> = {}
  qs['time_range'] = String(params?.time_range ?? '30d')
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet<ApiResponse<BridgeRankingItem>>(`onchain/bridge/ranking`, qs)
}

/**
 * Get the current gas price for an EVM chain via `eth_gasPrice` JSON-RPC. Returns gas price in both wei (raw) and Gwei (human-readable).

**Supported chains:** `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`, `linea`, `cyber`.
 * - chain: Chain. Can be `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`, `linea`, or `cyber`.
 */
export async function fetchOnchainGasPrice(params: { chain: 'ethereum' | 'polygon' | 'bsc' | 'arbitrum' | 'optimism' | 'base' | 'avalanche' | 'fantom' | 'linea' | 'cyber' }) {
  const qs: Record<string, string> = {}
  qs['chain'] = String(params.chain)
  return proxyGet<ApiObjectResponse<OnchainGasPriceItem>>(`onchain/gas-price`, qs)
}

/** Execute a structured JSON query on blockchain data. No raw SQL needed — specify source, fields, filters, sort, and pagination.

All tables live in the **agent** database. Use `GET /v1/onchain/schema` to discover available tables and their columns.

- Source format: `agent.<table_name>` like `agent.ethereum_transactions` or `agent.ethereum_dex_trades`
- Max 10,000 rows (default 20), 30s timeout.
- **Always filter on block_date** — it is the partition key. Without it, queries scan billions of rows and will timeout.
- **Data refresh:** ~24 hours.

## Example

```json
{
  "source": "agent.ethereum_dex_trades",
  "fields": ["block_time", "project", "token_pair", "amount_usd", "taker"],
  "filters": [
    {"field": "block_date", "op": "gte", "value": "2025-03-01"},
    {"field": "project", "op": "eq", "value": "uniswap"},
    {"field": "amount_usd", "op": "gte", "value": 100000}
  ],
  "sort": [{"field": "amount_usd", "order": "desc"}],
  "limit": 20
}
``` */
export async function fetchOnchainQuery(params: { fields?: string[]; filters?: StructuredFilter[]; limit?: number; offset?: number; sort?: StructuredSort[]; source: string }) {
  return proxyPost<any>(`onchain/query`, params)
}

/** Get table metadata — database, table, column names, types, and comments for all available on-chain databases. */
export async function fetchOnchainSchema() {
  return proxyGet<ApiResponse<OnchainSchemaTable>>(`onchain/schema`)
}

/**
 * Get transaction details by hash. All numeric fields are hex-encoded — use parseInt(hex, 16) to convert.

**Supported chains:** `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`, `linea`, `cyber`. Returns 404 if the transaction is not found.
 * - hash: Transaction hash (0x-prefixed hex)
 * - chain: Chain. Can be `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`, `linea`, or `cyber`.
 */
export async function fetchOnchainTx(params: { hash: string; chain: 'ethereum' | 'polygon' | 'bsc' | 'arbitrum' | 'optimism' | 'base' | 'avalanche' | 'fantom' | 'linea' | 'cyber' }) {
  const qs: Record<string, string> = {}
  qs['hash'] = String(params.hash)
  qs['chain'] = String(params.chain)
  return proxyGet<ApiResponse<OnchainTxItem>>(`onchain/tx`, qs)
}

/**
 * List DeFi yield pools ranked by APY or TVL. Returns the latest snapshot. Filter by protocol.
 * - project?: Filter by protocol name like `lido`, `aave`, or `uniswap`
 * - sort_by?: Ranking metric: `apy` or `tvl_usd`. When sorted by `apy`, only pools with TVL >= $100k are included (default: apy)
 * - order?: Sort direction (default: desc)
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - offset?: Pagination offset (default: 0) @min 0
 */
export async function fetchOnchainYieldRanking(params?: { project?: string; sort_by?: 'apy' | 'tvl_usd'; order?: 'asc' | 'desc'; limit?: number; offset?: number }) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs: Record<string, string> = {}
  if (params?.project !== undefined) qs['project'] = String(params.project)
  qs['sort_by'] = String(params?.sort_by ?? 'apy')
  qs['order'] = String(params?.order ?? 'desc')
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet<ApiResponse<YieldRankingItem>>(`onchain/yield/ranking`, qs)
}

// ---------------------------------------------------------------------------
// Onchain hooks
// ---------------------------------------------------------------------------

type QueryOpts<T> = Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>

/** Get bridge ranking by volume — wraps `fetchOnchainBridgeRanking` with React Query caching. */
export function useOnchainBridgeRanking(params?: Parameters<typeof fetchOnchainBridgeRanking>[0], opts?: QueryOpts<ApiResponse<BridgeRankingItem>>) {
  return useQuery({ queryKey: ['onchain', 'bridge', 'ranking', params], queryFn: () => fetchOnchainBridgeRanking(params), ...opts })
}

/** Get current gas price — wraps `fetchOnchainGasPrice` with React Query caching. */
export function useOnchainGasPrice(params: Parameters<typeof fetchOnchainGasPrice>[0], opts?: QueryOpts<ApiObjectResponse<OnchainGasPriceItem>>) {
  return useQuery({ queryKey: ['onchain', 'gas', 'price', params], queryFn: () => fetchOnchainGasPrice(params!), ...opts })
}

/** Get on-chain table schema — wraps `fetchOnchainSchema` with React Query caching. */
export function useOnchainSchema(opts?: QueryOpts<ApiResponse<OnchainSchemaTable>>) {
  return useQuery({ queryKey: ['onchain', 'schema'], queryFn: () => fetchOnchainSchema(), ...opts })
}

/** Get transaction by hash — wraps `fetchOnchainTx` with React Query caching. */
export function useOnchainTx(params: Parameters<typeof fetchOnchainTx>[0], opts?: QueryOpts<ApiResponse<OnchainTxItem>>) {
  return useQuery({ queryKey: ['onchain', 'tx', params], queryFn: () => fetchOnchainTx(params!), ...opts })
}

/** Get yield pool ranking — wraps `fetchOnchainYieldRanking` with React Query caching. */
export function useOnchainYieldRanking(params?: Parameters<typeof fetchOnchainYieldRanking>[0], opts?: QueryOpts<ApiResponse<YieldRankingItem>>) {
  return useQuery({ queryKey: ['onchain', 'yield', 'ranking', params], queryFn: () => fetchOnchainYieldRanking(params), ...opts })
}

// ---------------------------------------------------------------------------
// Onchain infinite query hooks (auto-pagination)
// ---------------------------------------------------------------------------

type OffsetInfiniteOpts<T> = Omit<UseInfiniteQueryOptions<T, Error, T, T, unknown[], number>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'>

/** Get bridge ranking by volume — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteOnchainBridgeRanking(params?: Omit<Parameters<typeof fetchOnchainBridgeRanking>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<BridgeRankingItem>>) {
  return useInfiniteQuery({
    queryKey: ['onchain', 'bridge', 'ranking', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchOnchainBridgeRanking({ ...params, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const meta = (lastPage as any)?.meta
      if (!meta?.total || !meta?.limit) return undefined
      const next = (meta.offset ?? 0) + meta.limit
      return next < meta.total ? next : undefined
    },
    ...opts,
  })
}

/** Get yield pool ranking — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteOnchainYieldRanking(params?: Omit<Parameters<typeof fetchOnchainYieldRanking>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<YieldRankingItem>>) {
  return useInfiniteQuery({
    queryKey: ['onchain', 'yield', 'ranking', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchOnchainYieldRanking({ ...params, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const meta = (lastPage as any)?.meta
      if (!meta?.total || !meta?.limit) return undefined
      const next = (meta.offset ?? 0) + meta.limit
      return next < meta.total ? next : undefined
    },
    ...opts,
  })
}
