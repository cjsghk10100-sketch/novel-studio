/**
 * News API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 */

import { proxyGet, proxyPost, type ApiResponse, type ApiObjectResponse, type NewsArticleDetailItem, type NewsArticleItem } from './api'
import { useQuery, useInfiniteQuery, type UseQueryOptions, type UseInfiniteQueryOptions } from '@tanstack/react-query'

/**
 * Returns the full content of a single news article by its ID (returned as `id` in feed and search results).
 * - id: Article ID (returned as id in feed/search results)
 */
export async function fetchNewsDetail(params: { id: string }) {
  const qs: Record<string, string> = {}
  qs['id'] = String(params.id)
  return proxyGet<ApiObjectResponse<NewsArticleDetailItem>>(`news/detail`, qs)
}

/**
 * Browse crypto news from major sources. Filter by `source` (enum), `project`, and time range (`from`/`to`). Sort by `recency` (default) or `trending`. Use the detail endpoint with article `id` for full content.
 * - source?: Filter by news source
 * - project?: Comma-separated project names to filter by
 * - from?: Filter articles published on or after this time. Accepts Unix seconds or date string (2024-01-01)
 * - to?: Filter articles published on or before this time. Accepts Unix seconds or date string (2024-02-01)
 * - sort_by?: Sort order: recency (newest first) or trending (hot right now) (default: recency)
 * - limit?: Results per page (max 50) (default: 20) @min 1 @max 50
 * - offset?: Pagination offset (default: 0) @min 0
 */
export async function fetchNewsFeed(params?: { source?: 'coindesk' | 'cointelegraph' | 'theblock' | 'decrypt' | 'dlnews' | 'blockbeats' | 'bitcoincom' | 'coinpedia' | 'ambcrypto' | 'cryptodaily' | 'cryptopotato' | 'phemex' | 'panews' | 'odaily' | 'tradingview' | 'chaincatcher' | 'techflow'; project?: string; from?: string; to?: string; sort_by?: 'recency' | 'trending'; limit?: number; offset?: number }) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(50, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs: Record<string, string> = {}
  if (params?.source !== undefined) qs['source'] = String(params.source)
  if (params?.project !== undefined) qs['project'] = String(params.project)
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  qs['sort_by'] = String(params?.sort_by ?? 'recency')
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet<ApiResponse<NewsArticleItem>>(`news/feed`, qs)
}

// ---------------------------------------------------------------------------
// News hooks
// ---------------------------------------------------------------------------

type QueryOpts<T> = Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>

/** News article detail — wraps `fetchNewsDetail` with React Query caching. */
export function useNewsDetail(params: Parameters<typeof fetchNewsDetail>[0], opts?: QueryOpts<ApiObjectResponse<NewsArticleDetailItem>>) {
  return useQuery({ queryKey: ['news', 'detail', params], queryFn: () => fetchNewsDetail(params!), ...opts })
}

/** Crypto news feed — wraps `fetchNewsFeed` with React Query caching. */
export function useNewsFeed(params?: Parameters<typeof fetchNewsFeed>[0], opts?: QueryOpts<ApiResponse<NewsArticleItem>>) {
  return useQuery({ queryKey: ['news', 'feed', params], queryFn: () => fetchNewsFeed(params), ...opts })
}

// ---------------------------------------------------------------------------
// News infinite query hooks (auto-pagination)
// ---------------------------------------------------------------------------

type OffsetInfiniteOpts<T> = Omit<UseInfiniteQueryOptions<T, Error, T, T, unknown[], number>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'>

/** Crypto news feed — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteNewsFeed(params?: Omit<Parameters<typeof fetchNewsFeed>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<NewsArticleItem>>) {
  return useInfiniteQuery({
    queryKey: ['news', 'feed', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchNewsFeed({ ...params, offset: pageParam }),
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
