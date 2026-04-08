/**
 * Search API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 */

import { proxyGet, proxyPost, type ApiResponse, type ApiCursorResponse, type AirdropSearchItem, type FundSearchItem, type KalshiEvent, type NewsArticleItem, type PolymarketEvent, type ProjectEventItem, type ProjectSearchItem, type WalletSearchItem, type WebSearchResultItem, type XTweet, type XUser } from './api'
import { useQuery, useInfiniteQuery, type UseQueryOptions, type UseInfiniteQueryOptions } from '@tanstack/react-query'

/**
 * Search and filter airdrop opportunities by keyword, status, reward type, and task type. Returns paginated results with optional task details.
 * - q?: Search keyword for coin name
 * - phase?: Comma-separated lifecycle phases. `active` = tasks open, can participate (POTENTIAL + CONFIRMED). `claimable` = eligible, can claim (SNAPSHOT + VERIFICATION + REWARD_AVAILABLE). `completed` = done (DISTRIBUTED). Defaults to `active,claimable` to show actionable airdrops. (default: active,claimable)
 * - reward_type?: Filter by reward type
 * - task_type?: Filter activities containing tasks of this type
 * - has_open?: Only return activities with currently OPEN tasks (default: False)
 * - sort_by?: Field to sort results by (default: last_status_update)
 * - order?: Sort order (default: desc)
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - offset?: Pagination offset (default: 0) @min 0
 * - include_tasks?: Include full task list per activity (default: False)
 */
export async function fetchSearchAirdrop(params?: { q?: string; phase?: string; reward_type?: 'airdrop' | 'points' | 'whitelist' | 'nft' | 'role' | 'ambassador'; task_type?: 'social' | 'bounty-platforms' | 'testnet' | 'mainnet' | 'role' | 'form' | 'liquidity' | 'mint-nft' | 'game' | 'trading' | 'staking' | 'depin' | 'node' | 'ambassador' | 'hold' | 'check-wallet' | 'mint-domain' | 'predictions' | 'deploy'; has_open?: boolean; sort_by?: 'total_raise' | 'xscore' | 'last_status_update'; order?: 'asc' | 'desc'; limit?: number; offset?: number; include_tasks?: boolean }) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs: Record<string, string> = {}
  if (params?.q !== undefined) qs['q'] = String(params.q)
  qs['phase'] = String(params?.phase ?? 'active,claimable')
  if (params?.reward_type !== undefined) qs['reward_type'] = String(params.reward_type)
  if (params?.task_type !== undefined) qs['task_type'] = String(params.task_type)
  qs['has_open'] = String(params?.has_open ?? False)
  qs['sort_by'] = String(params?.sort_by ?? 'last_status_update')
  qs['order'] = String(params?.order ?? 'desc')
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  qs['include_tasks'] = String(params?.include_tasks ?? False)
  return proxyGet<ApiResponse<AirdropSearchItem>>(`search/airdrop`, qs)
}

/**
 * Search project events by keyword, optionally filtered by `type`. Valid types: `launch`, `upgrade`, `partnership`, `news`, `airdrop`, `listing`, `twitter`. Lookup by UUID (`id`) or name (`q`). Returns 404 if the project is not found.
 * - id?: Surf project UUID. PREFERRED — always use this when available from a previous response (e.g. project_id from /fund/portfolio or id from /search/project). Takes priority over q.
 * - q?: Fuzzy entity name search. Only use when 'id' is not available. May return unexpected results for ambiguous names.
 * - type?: Filter by event type. Can be `launch`, `upgrade`, `partnership`, `news`, `airdrop`, `listing`, or `twitter`.
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - offset?: Pagination offset (default: 0) @min 0
 */
export async function fetchSearchEvents(params?: { id?: string; q?: string; type?: 'launch' | 'upgrade' | 'partnership' | 'news' | 'airdrop' | 'listing' | 'twitter'; limit?: number; offset?: number }) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs: Record<string, string> = {}
  if (params?.id !== undefined) qs['id'] = String(params.id)
  if (params?.q !== undefined) qs['q'] = String(params.q)
  if (params?.type !== undefined) qs['type'] = String(params.type)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet<ApiResponse<ProjectEventItem>>(`search/events`, qs)
}

/**
 * Search funds by keyword. Returns matching funds with name, tier, type, logo, and top invested projects.
 * - q: Search keyword — fund name like `a16z`, `paradigm`, or `coinbase ventures`
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - offset?: Pagination offset (default: 0) @min 0
 */
export async function fetchSearchFund(params: { q: string; limit?: number; offset?: number }) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs: Record<string, string> = {}
  qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet<ApiResponse<FundSearchItem>>(`search/fund`, qs)
}

/**
 * Search Kalshi events by keyword and/or category. Filter by keyword matching event title, subtitle, or market title; or by category. At least one of `q` or `category` is required. Returns events with nested markets.

Data refresh: ~30 minutes
 * - q?: Search keyword matching event title, subtitle, or market title
 * - category?: Filter by category
 * - status?: Market status filter: `active`, `closed`, `determined`, `disputed`, `finalized`, `inactive`, or `initialized`
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - offset?: Pagination offset (default: 0) @min 0
 */
export async function fetchSearchKalshi(params?: { q?: string; category?: 'crypto' | 'culture' | 'economics' | 'financials' | 'politics' | 'stem' | 'sports' | 'unknown'; status?: 'active' | 'closed' | 'determined' | 'disputed' | 'finalized' | 'inactive' | 'initialized'; limit?: number; offset?: number }) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs: Record<string, string> = {}
  if (params?.q !== undefined) qs['q'] = String(params.q)
  if (params?.category !== undefined) qs['category'] = String(params.category)
  if (params?.status !== undefined) qs['status'] = String(params.status)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet<ApiResponse<KalshiEvent>>(`search/kalshi`, qs)
}

/**
 * Search crypto news articles by keyword. Returns top 10 results ranked by relevance with highlighted matching fragments.
 * - q: Search keyword or phrase
 */
export async function fetchSearchNews(params: { q: string }) {
  const qs: Record<string, string> = {}
  qs['q'] = String(params.q)
  return proxyGet<ApiResponse<NewsArticleItem>>(`search/news`, qs)
}

/**
 * Search Polymarket events by keyword, tags, and/or category. Filter by keyword matching market question, event title, or description; by comma-separated tag labels; or by Surf-curated category. At least one of `q`, `tags`, or `category` is required. Returns events with nested markets ranked by volume.

Data refresh: ~30 minutes
 * - q?: Search keyword matching market question, event title, or description
 * - tags?: Comma-separated tag labels to filter by (matches any). Commonly used tags: `Crypto`, `Politics`, `Sports`, `Science`, `Pop Culture`
 * - category?: Filter by Surf-curated category
 * - status?: Market status filter: `active`, `finalized`, `ended`, `initialized`, or `closed` (default: active)
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - offset?: Pagination offset (default: 0) @min 0
 */
export async function fetchSearchPolymarket(params?: { q?: string; tags?: string; category?: 'crypto' | 'culture' | 'early_polymarket_trades' | 'economics' | 'financials' | 'politics' | 'stem' | 'sports' | 'unknown'; status?: 'active' | 'finalized' | 'ended' | 'initialized' | 'closed'; limit?: number; offset?: number }) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs: Record<string, string> = {}
  if (params?.q !== undefined) qs['q'] = String(params.q)
  if (params?.tags !== undefined) qs['tags'] = String(params.tags)
  if (params?.category !== undefined) qs['category'] = String(params.category)
  qs['status'] = String(params?.status ?? 'active')
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet<ApiResponse<PolymarketEvent>>(`search/polymarket`, qs)
}

/**
 * Search crypto projects by keyword. Returns matching projects with name, description, chains, and logo.
 * - q: Search keyword — project name or ticker like `uniswap`, `bitcoin`, or `ETH`
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - offset?: Pagination offset (default: 0) @min 0
 */
export async function fetchSearchProject(params: { q: string; limit?: number; offset?: number }) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs: Record<string, string> = {}
  qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet<ApiResponse<ProjectSearchItem>>(`search/project`, qs)
}

/**
 * Search X (Twitter) users by keyword. Returns user profiles with handle, display name, bio, follower count, and avatar.
 * - q: Search keyword or `@handle` for exact handle lookup. Use a keyword like `vitalik` for fuzzy matching across names and bios, or `@VitalikButerin` to find a specific account by handle
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - cursor?: Opaque cursor token from a previous response's next_cursor field for fetching the next page
 */
export async function fetchSearchSocialPeople(params: { q: string; limit?: number; cursor?: string }) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  const qs: Record<string, string> = {}
  qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  if (params?.cursor !== undefined) qs['cursor'] = String(params.cursor)
  return proxyGet<ApiCursorResponse<XUser>>(`search/social/people`, qs)
}

/**
 * Search X (Twitter) posts by keyword or `from:handle` syntax. Returns posts with author, content, engagement metrics, and timestamp. To load more results, check `meta.has_more`; if true, pass `meta.next_cursor` as the `cursor` query parameter in the next request.
 * - q: Search keyword or `from:handle` syntax like `ethereum` or `from:cz_binance`
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - cursor?: Opaque cursor token from a previous response's next_cursor field for fetching the next page
 */
export async function fetchSearchSocialPosts(params: { q: string; limit?: number; cursor?: string }) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  const qs: Record<string, string> = {}
  qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  if (params?.cursor !== undefined) qs['cursor'] = String(params.cursor)
  return proxyGet<ApiCursorResponse<XTweet>>(`search/social/posts`, qs)
}

/**
 * Search wallets by ENS name, address label, or address prefix. Returns matching wallet addresses with entity labels.
 * - q: Search keyword like `binance`, `vitalik.eth`, or `0xd8dA...`
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - offset?: Pagination offset (default: 0) @min 0
 */
export async function fetchSearchWallet(params: { q: string; limit?: number; offset?: number }) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs: Record<string, string> = {}
  qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet<ApiResponse<WalletSearchItem>>(`search/wallet`, qs)
}

/**
 * Search web pages, articles, and content by keyword. Filter by domain with `site` like `coindesk.com`. Returns titles, URLs, and content snippets.
 * - q: Search query like `bitcoin price prediction 2026`
 * - limit?: Results per page (default: 20) @min 1 @max 100
 * - offset?: Pagination offset (default: 0) @min 0
 * - site?: Comma-separated domain filter like `coindesk.com` or `cointelegraph.com`
 */
export async function fetchSearchWeb(params: { q: string; limit?: number; offset?: number; site?: string }) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs: Record<string, string> = {}
  qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  if (params?.site !== undefined) qs['site'] = String(params.site)
  return proxyGet<ApiResponse<WebSearchResultItem>>(`search/web`, qs)
}

// ---------------------------------------------------------------------------
// Search hooks
// ---------------------------------------------------------------------------

type QueryOpts<T> = Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>

/** Search airdrops — wraps `fetchSearchAirdrop` with React Query caching. */
export function useSearchAirdrop(params?: Parameters<typeof fetchSearchAirdrop>[0], opts?: QueryOpts<ApiResponse<AirdropSearchItem>>) {
  return useQuery({ queryKey: ['search', 'airdrop', params], queryFn: () => fetchSearchAirdrop(params), ...opts })
}

/** Search project events — wraps `fetchSearchEvents` with React Query caching. */
export function useSearchEvents(params?: Parameters<typeof fetchSearchEvents>[0], opts?: QueryOpts<ApiResponse<ProjectEventItem>>) {
  return useQuery({ queryKey: ['search', 'events', params], queryFn: () => fetchSearchEvents(params), ...opts })
}

/** Search funds — wraps `fetchSearchFund` with React Query caching. */
export function useSearchFund(params: Parameters<typeof fetchSearchFund>[0], opts?: QueryOpts<ApiResponse<FundSearchItem>>) {
  return useQuery({ queryKey: ['search', 'fund', params], queryFn: () => fetchSearchFund(params!), ...opts })
}

/** Search Kalshi events — wraps `fetchSearchKalshi` with React Query caching. */
export function useSearchKalshi(params?: Parameters<typeof fetchSearchKalshi>[0], opts?: QueryOpts<ApiResponse<KalshiEvent>>) {
  return useQuery({ queryKey: ['search', 'kalshi', params], queryFn: () => fetchSearchKalshi(params), ...opts })
}

/** Search news articles — wraps `fetchSearchNews` with React Query caching. */
export function useSearchNews(params: Parameters<typeof fetchSearchNews>[0], opts?: QueryOpts<ApiResponse<NewsArticleItem>>) {
  return useQuery({ queryKey: ['search', 'news', params], queryFn: () => fetchSearchNews(params!), ...opts })
}

/** Search Polymarket events — wraps `fetchSearchPolymarket` with React Query caching. */
export function useSearchPolymarket(params?: Parameters<typeof fetchSearchPolymarket>[0], opts?: QueryOpts<ApiResponse<PolymarketEvent>>) {
  return useQuery({ queryKey: ['search', 'polymarket', params], queryFn: () => fetchSearchPolymarket(params), ...opts })
}

/** Search projects — wraps `fetchSearchProject` with React Query caching. */
export function useSearchProject(params: Parameters<typeof fetchSearchProject>[0], opts?: QueryOpts<ApiResponse<ProjectSearchItem>>) {
  return useQuery({ queryKey: ['search', 'project', params], queryFn: () => fetchSearchProject(params!), ...opts })
}

/** Search social users — wraps `fetchSearchSocialPeople` with React Query caching. */
export function useSearchSocialPeople(params: Parameters<typeof fetchSearchSocialPeople>[0], opts?: QueryOpts<ApiCursorResponse<XUser>>) {
  return useQuery({ queryKey: ['search', 'social', 'people', params], queryFn: () => fetchSearchSocialPeople(params!), ...opts })
}

/** Search social posts — wraps `fetchSearchSocialPosts` with React Query caching. */
export function useSearchSocialPosts(params: Parameters<typeof fetchSearchSocialPosts>[0], opts?: QueryOpts<ApiCursorResponse<XTweet>>) {
  return useQuery({ queryKey: ['search', 'social', 'posts', params], queryFn: () => fetchSearchSocialPosts(params!), ...opts })
}

/** Search wallets — wraps `fetchSearchWallet` with React Query caching. */
export function useSearchWallet(params: Parameters<typeof fetchSearchWallet>[0], opts?: QueryOpts<ApiResponse<WalletSearchItem>>) {
  return useQuery({ queryKey: ['search', 'wallet', params], queryFn: () => fetchSearchWallet(params!), ...opts })
}

/** Search the internet — wraps `fetchSearchWeb` with React Query caching. */
export function useSearchWeb(params: Parameters<typeof fetchSearchWeb>[0], opts?: QueryOpts<ApiResponse<WebSearchResultItem>>) {
  return useQuery({ queryKey: ['search', 'web', params], queryFn: () => fetchSearchWeb(params!), ...opts })
}

// ---------------------------------------------------------------------------
// Search infinite query hooks (auto-pagination)
// ---------------------------------------------------------------------------

type OffsetInfiniteOpts<T> = Omit<UseInfiniteQueryOptions<T, Error, T, T, unknown[], number>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'>
type CursorInfiniteOpts<T> = Omit<UseInfiniteQueryOptions<T, Error, T, T, unknown[], string>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'>

/** Search airdrops — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteSearchAirdrop(params?: Omit<Parameters<typeof fetchSearchAirdrop>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<AirdropSearchItem>>) {
  return useInfiniteQuery({
    queryKey: ['search', 'airdrop', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchSearchAirdrop({ ...params, offset: pageParam }),
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

/** Search project events — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteSearchEvents(params?: Omit<Parameters<typeof fetchSearchEvents>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<ProjectEventItem>>) {
  return useInfiniteQuery({
    queryKey: ['search', 'events', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchSearchEvents({ ...params, offset: pageParam }),
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

/** Search funds — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteSearchFund(params: Omit<Parameters<typeof fetchSearchFund>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<FundSearchItem>>) {
  return useInfiniteQuery({
    queryKey: ['search', 'fund', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchSearchFund({ ...params!, offset: pageParam }),
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

/** Search Kalshi events — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteSearchKalshi(params?: Omit<Parameters<typeof fetchSearchKalshi>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<KalshiEvent>>) {
  return useInfiniteQuery({
    queryKey: ['search', 'kalshi', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchSearchKalshi({ ...params, offset: pageParam }),
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

/** Search Polymarket events — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteSearchPolymarket(params?: Omit<Parameters<typeof fetchSearchPolymarket>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<PolymarketEvent>>) {
  return useInfiniteQuery({
    queryKey: ['search', 'polymarket', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchSearchPolymarket({ ...params, offset: pageParam }),
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

/** Search projects — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteSearchProject(params: Omit<Parameters<typeof fetchSearchProject>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<ProjectSearchItem>>) {
  return useInfiniteQuery({
    queryKey: ['search', 'project', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchSearchProject({ ...params!, offset: pageParam }),
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

/** Search social users — infinite-scroll wrapper with automatic cursor pagination. */
export function useInfiniteSearchSocialPeople(params: Omit<Parameters<typeof fetchSearchSocialPeople>[0], 'cursor'>, opts?: CursorInfiniteOpts<ApiCursorResponse<XUser>>) {
  return useInfiniteQuery({
    queryKey: ['search', 'social', 'people', 'infinite', params],
    queryFn: ({ pageParam }) => fetchSearchSocialPeople({ ...params!, ...(pageParam ? { cursor: pageParam } : {}) }),
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      const meta = (lastPage as any)?.meta
      if (!meta?.has_more || !meta?.next_cursor) return undefined
      return meta.next_cursor
    },
    ...opts,
  })
}

/** Search social posts — infinite-scroll wrapper with automatic cursor pagination. */
export function useInfiniteSearchSocialPosts(params: Omit<Parameters<typeof fetchSearchSocialPosts>[0], 'cursor'>, opts?: CursorInfiniteOpts<ApiCursorResponse<XTweet>>) {
  return useInfiniteQuery({
    queryKey: ['search', 'social', 'posts', 'infinite', params],
    queryFn: ({ pageParam }) => fetchSearchSocialPosts({ ...params!, ...(pageParam ? { cursor: pageParam } : {}) }),
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      const meta = (lastPage as any)?.meta
      if (!meta?.has_more || !meta?.next_cursor) return undefined
      return meta.next_cursor
    },
    ...opts,
  })
}

/** Search wallets — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteSearchWallet(params: Omit<Parameters<typeof fetchSearchWallet>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<WalletSearchItem>>) {
  return useInfiniteQuery({
    queryKey: ['search', 'wallet', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchSearchWallet({ ...params!, offset: pageParam }),
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

/** Search the internet — infinite-scroll wrapper with automatic offset pagination. */
export function useInfiniteSearchWeb(params: Omit<Parameters<typeof fetchSearchWeb>[0], 'offset'>, opts?: OffsetInfiniteOpts<ApiResponse<WebSearchResultItem>>) {
  return useInfiniteQuery({
    queryKey: ['search', 'web', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => fetchSearchWeb({ ...params!, offset: pageParam }),
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
