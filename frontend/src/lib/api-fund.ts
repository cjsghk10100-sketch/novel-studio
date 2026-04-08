/**
 * Fund API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 */

import { proxyGet, proxyPost, type ApiResponse, type ApiObjectResponse, type FundDetailItem, type FundPortfolioItem, type FundSearchItem } from './api'
import { useQuery, useInfiniteQuery, type UseQueryOptions, type UseInfiniteQueryOptions } from '@tanstack/react-query'

/**
 * Get a fund's **profile metadata**: X accounts, team members, recent research, and invested project count. This does NOT return the list of investments — use `/fund/portfolio` for that. Lookup by UUID (`id`) or name (`q`). Returns 404 if not found.
 * - id?: Surf fund UUID. PREFERRED — always use this when available from a previous response (e.g. id from /search/fund). Takes priority over q.
 * - q?: Fuzzy fund name search. Only use when 'id' is not available. May return unexpected results for ambiguous names.
 */
export async function fetchFundDetail(params?: { id?: string; q?: string }) {
  const qs: Record<string, string> = {}
  if (params?.id !== undefined) qs['id'] = String(params.id)
  if (params?.q !== undefined) qs['q'] = String(params.q)
  return proxyGet<ApiObjectResponse<FundDetailItem>>(`fund/detail`, qs)
}

/**
 * List investment rounds for a fund's portfolio, sorted by date (newest first). A project may appear multiple times if the fund participated in multiple rounds. Each entry includes project name, logo, date, raise amount, and lead investor status. Lookup by UUID (`id`) or name (`q`).
 * - id?: Surf fund UUID. PREFERRED — always use this when available from a previous response (e.g. id from /search/fund). Takes priority over q.
 * - q?: Fuzzy fund name search. Only use when 'id' is not available. May return unexpected results for ambiguous names.
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - offset?: Pagination offset (default: 0) @min 0
 * - is_lead?: Filter by lead investor status. Omit or leave empty for all investments.
 * - invested_after?: Only include investments at or after this Unix timestamp (seconds)
 * - invested_before?: Only include investments before this Unix timestamp (seconds)
 * - sort_by?: Field to sort results by (default: invested_at)
 * - order?: Sort order (default: desc)
 */
export async function fetchFundPortfolio(params?: { id?: string; q?: string; limit?: number; offset?: number; is_lead?: 'true' | 'false' | ''; invested_after?: number; invested_before?: number; sort_by?: 'invested_at' | 'recent_raise' | 'total_raise'; order?: 'asc' | 'desc' }) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs: Record<string, string> = {}
  if (params?.id !== undefined) qs['id'] = String(params.id)
  if (params?.q !== undefined) qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  if (params?.is_lead !== undefined) qs['is_lead'] = String(params.is_lead)
  if (params?.invested_after !== undefined) qs['invested_after'] = String(params.invested_after)
  if (params?.invested_before !== undefined) qs['invested_before'] = String(params.invested_before)
  qs['sort_by'] = String(params?.sort_by ?? 'invested_at')
  qs['order'] = String(params?.order ?? 'desc')
  return proxyGet<ApiResponse<FundPortfolioItem>>(`fund/portfolio`, qs)
}

/**
 * List top-ranked funds by metric. Available metrics: `tier` (lower is better), `portfolio_count` (number of invested projects).
 * - metric: Ranking metric. Can be `tier` (lower is better) or `portfolio_count` (number of invested projects).
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - offset?: Pagination offset (default: 0) @min 0
 */
export async function fetchFundRanking(params: { metric: 'tier' | 'portfolio_count'; limit?: number; offset?: number }) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs: Record<string, string> = {}
  qs['metric'] = String(params.metric)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet<ApiResponse<FundSearchItem>>(`fund/ranking`, qs)
}

// ---------------------------------------------------------------------------
// Fund hooks
// ---------------------------------------------------------------------------

type QueryOpts<T> = Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>

/** Get fund detail — wraps `fetchFundDetail` with React Query caching. */
export function useFundDetail(params?: Parameters<typeof fetchFundDetail>[0], opts?: QueryOpts<ApiObjectResponse<FundDetailItem>>) {
  return useQuery({ queryKey: ['fund', 'detail', params], queryFn: () => fetchFundDetail(params), ...opts })
}

/** Get fund portfolio — wraps `fetchFundPortfolio` with React Query caching. */
export function useFundPortfolio(params?: Parameters<typeof fetchFundPortfolio>[0], opts?: QueryOpts<ApiResponse<FundPortfolioItem>>) {
  return useQuery({ queryKey: ['fund', 'portfolio', params], queryFn: () => fetchFundPortfolio(params), ...opts })
}

/** Get top funds by metric — wraps `fetchFundRanking` with React Query caching. */
export function useFundRanking(params: Parameters<typeof fetchFundRanking>[0], opts?: QueryOpts<ApiResponse<FundSearchItem>>) {
  return useQuery({ queryKey: ['fund', 'ranking', params], queryFn: () => fetchFundRanking(params!), ...opts })
}

// ---------------------------------------------------------------------------
// Fund infinite query hooks (auto-pagination)
// ---------------------------------------------------------------------------

type OffsetInfiniteOpts<T> = Omit<UseInfiniteQueryOptions<T, Error, T, T, unknown[], number>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'>

/** Get fund portfolio — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteFundPortfolio(params?: Omit<Parameters<typeof fetchFundPortfolio>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<FundPortfolioItem>>) {
  return useInfiniteQuery({
    queryKey: ['fund', 'portfolio', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchFundPortfolio({ ...params, offset: pageParam }),
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

/** Get top funds by metric — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteFundRanking(params: Omit<Parameters<typeof fetchFundRanking>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<FundSearchItem>>) {
  return useInfiniteQuery({
    queryKey: ['fund', 'ranking', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchFundRanking({ ...params!, offset: pageParam }),
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
