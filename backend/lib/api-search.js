/**
 * Search API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 * CommonJS module. Usage: const { fetchXxx } = require('./api-search')
 */

'use strict'

const { proxyGet, proxyPost } = require('./api')

/**
 * @typedef {Object} AirdropSearchItem
 * @property {string} [coin_symbol] — Token ticker symbol
 * @property {number} followers_count — X/Twitter follower count (0 if unknown)
 * @property {number} last_status_update — Last status change as Unix seconds
 * @property {string} [logo_url] — Project logo image URL
 * @property {string} [project_id] — Surf project UUID if linked
 * @property {string} project_name — Project/coin name
 * @property {number} reward_date — Expected reward date as Unix seconds (0 if unknown)
 * @property {string} [reward_type] — Reward type: airdrop, points, whitelist, nft, role, ambassador
 * @property {string} status — Airdrop lifecycle stage: `POTENTIAL` (speculated, tasks open), `CONFIRMED` (announced, tasks open), `SNAPSHOT` (eligibility snapshot taken), `VERIFICATION` (claim window open), `REWARD_AVAILABLE` (ready to claim), `DISTRIBUTED` (sent, historical)
 * @property {AirdropTaskSummary} [task_summary] — Aggregated task statistics
 * @property {Array<AirdropTaskItem>|null} [tasks] — Full task list (only with include_tasks=true)
 * @property {number} total_raise — Total project fundraise in USD (0 if unknown)
 * @property {number} xscore — CryptoRank social score (0 if unknown)
 */

/**
 * @typedef {Object} FundSearchItem
 * @property {string} id — Surf fund UUID — pass as 'id' parameter to /fund/detail or /fund/portfolio for exact lookup
 * @property {string} [image] — Fund logo URL
 * @property {number} invested_projects_count — Total number of unique invested projects (a project with multiple funding rounds counts once)
 * @property {string} name — Fund name
 * @property {number} tier — Fund tier ranking (lower is better)
 * @property {Array<FundPortfolioItem>|null} top_projects — Top invested projects (up to 5)
 * @property {string} [type] — Fund type
 */

/**
 * @typedef {Object} KalshiEvent
 * @property {string} [event_subtitle] — Event subtitle
 * @property {string} event_ticker — Unique event ticker identifier
 * @property {string} event_title — Event title
 * @property {number} market_count — Number of markets in this event
 * @property {Array<KalshiMarketItem>|null} markets — Markets within this event
 */

/**
 * @typedef {Object} NewsArticleItem
 * @property {Object.<string, Array<string>|null>} [highlights] — Search highlight fragments with <em> tags around matching terms. Only present in search results.
 * @property {string} id — Article ID. Use with the detail endpoint to fetch full content.
 * @property {string} [project_id] — Surf project UUID — pass as 'id' parameter to /project/detail, /project/events, or /project/defi/metrics for exact lookup
 * @property {string} [project_name] — Primary crypto project referenced in the article
 * @property {number} published_at — Unix timestamp in seconds when the article was published
 * @property {string} [source] — Publisher name (e.g. COINDESK, COINTELEGRAPH)
 * @property {string} [summary] — Short summary of the article
 * @property {string} title — Article headline
 * @property {string} [url] — Direct URL to the original article
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
 * @typedef {Object} ProjectEventItem
 * @property {string} [date] — Event date in ISO 8601 format
 * @property {string} [description] — Detailed event description
 * @property {string} [logo_url] — Project logo image URL
 * @property {string} title — Short event title
 * @property {string} type — Event type — one of: launch, upgrade, partnership, news, airdrop, listing, twitter
 */

/**
 * @typedef {Object} ProjectSearchItem
 * @property {Array<string>|null} [chains] — Chains the project operates on
 * @property {string} [description] — Short description of the project
 * @property {string} id — Surf project UUID — pass as 'id' parameter to /project/detail, /project/events, or /project/defi/metrics for exact lookup. Prefer over 'q' (fuzzy name search).
 * @property {string} [logo_url] — Project logo image URL
 * @property {string} name — Project name
 * @property {string} [slug] — Project slug for URL construction
 * @property {string} [symbol] — Primary token symbol like `BTC` or `ETH`
 * @property {Array<string>|null} [tags] — Project category tags
 * @property {Array<TokenSearchItem>|null} [tokens] — Associated tokens
 */

/**
 * @typedef {Object} WalletSearchItem
 * @property {string} [address] — Primary wallet address for this entity
 * @property {Array<WalletSearchAddress>|null} [addresses] — Known wallet addresses for this entity (max 10, use num_addresses for the total count)
 * @property {string} [chain] — Chain of the primary address
 * @property {string} [entity_name] — Name of the associated entity like `Binance` or `Aave`
 * @property {string} [entity_type] — Type of entity like `exchange`, `fund`, or `whale`
 * @property {string} [label] — Human-readable label for the wallet entity
 * @property {number} [num_addresses] — Total number of wallet addresses associated with this entity
 * @property {string} [twitter] — Associated X (Twitter) handle
 */

/**
 * @typedef {Object} WebSearchResultItem
 * @property {string} content — Relevant content snippet from the page
 * @property {string} description — Short description or meta description of the page
 * @property {string} title — Page title from the search result
 * @property {string} url — Full URL of the search result page
 */

/**
 * @typedef {Object} XTweet
 * @property {XAuthor} author — Author of the tweet
 * @property {number} created_at — Unix timestamp (seconds) when the tweet was posted
 * @property {Array<XMedia>|null} [media] — Attached media items (photos, videos, GIFs)
 * @property {XStats} stats — Engagement statistics (likes, reposts, replies, views)
 * @property {string} text — Full text content of the tweet
 * @property {string} tweet_id — Numeric tweet ID as a string (e.g. '1234567890123456789')
 * @property {string} url — Permanent link to the tweet on X/Twitter
 */

/**
 * @typedef {Object} XUser
 * @property {string} [avatar] — Profile picture URL
 * @property {string} [bio] — Profile biography text
 * @property {number} followers_count — Number of followers
 * @property {number} following_count — Number of accounts this user follows
 * @property {string} handle — X/Twitter handle without the @ prefix
 * @property {string} name — Display name on X/Twitter
 * @property {string} user_id — Numeric X/Twitter user ID as a string
 */


/**
 * Search and filter airdrop opportunities by keyword, status, reward type, and task type. Returns paginated results with optional task details.
 * @param {Object} params
 * @param {string} [params.q] — Search keyword for coin name
 * @param {string} [params.phase] — Comma-separated lifecycle phases. `active` = tasks open, can participate (POTENTIAL + CONFIRMED). `claimable` = eligible, can claim (SNAPSHOT + VERIFICATION + REWARD_AVAILABLE). `completed` = done (DISTRIBUTED). Defaults to `active,claimable` to show actionable airdrops. (default: active,claimable)
 * @param {('airdrop'|'points'|'whitelist'|'nft'|'role'|'ambassador')} [params.reward_type] — Filter by reward type
 * @param {('social'|'bounty-platforms'|'testnet'|'mainnet'|'role'|'form'|'liquidity'|'mint-nft'|'game'|'trading'|'staking'|'depin'|'node'|'ambassador'|'hold'|'check-wallet'|'mint-domain'|'predictions'|'deploy')} [params.task_type] — Filter activities containing tasks of this type
 * @param {boolean} [params.has_open] — Only return activities with currently OPEN tasks (default: False)
 * @param {('total_raise'|'xscore'|'last_status_update')} [params.sort_by] — Field to sort results by (default: last_status_update)
 * @param {('asc'|'desc')} [params.order] — Sort order (default: desc)
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @param {boolean} [params.include_tasks] — Include full task list per activity (default: False)
 * @returns {Promise<{{data: Array<AirdropSearchItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSearchAirdrop(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
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
  return proxyGet(`search/airdrop`, qs)
}

/**
 * Search project events by keyword, optionally filtered by `type`. Valid types: `launch`, `upgrade`, `partnership`, `news`, `airdrop`, `listing`, `twitter`. Lookup by UUID (`id`) or name (`q`). Returns 404 if the project is not found.
 * @param {Object} params
 * @param {string} [params.id] — Surf project UUID. PREFERRED — always use this when available from a previous response (e.g. project_id from /fund/portfolio or id from /search/project). Takes priority over q.
 * @param {string} [params.q] — Fuzzy entity name search. Only use when 'id' is not available. May return unexpected results for ambiguous names.
 * @param {('launch'|'upgrade'|'partnership'|'news'|'airdrop'|'listing'|'twitter')} [params.type] — Filter by event type. Can be `launch`, `upgrade`, `partnership`, `news`, `airdrop`, `listing`, or `twitter`.
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<ProjectEventItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSearchEvents(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
  if (params?.id !== undefined) qs['id'] = String(params.id)
  if (params?.q !== undefined) qs['q'] = String(params.q)
  if (params?.type !== undefined) qs['type'] = String(params.type)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`search/events`, qs)
}

/**
 * Search funds by keyword. Returns matching funds with name, tier, type, logo, and top invested projects.
 * @param {Object} params
 * @param {string} params.q — Search keyword — fund name like `a16z`, `paradigm`, or `coinbase ventures`
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<FundSearchItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSearchFund(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`search/fund`, qs)
}

/**
 * Search Kalshi events by keyword and/or category. Filter by keyword matching event title, subtitle, or market title; or by category. At least one of `q` or `category` is required. Returns events with nested markets.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} [params.q] — Search keyword matching event title, subtitle, or market title
 * @param {('crypto'|'culture'|'economics'|'financials'|'politics'|'stem'|'sports'|'unknown')} [params.category] — Filter by category
 * @param {('active'|'closed'|'determined'|'disputed'|'finalized'|'inactive'|'initialized')} [params.status] — Market status filter: `active`, `closed`, `determined`, `disputed`, `finalized`, `inactive`, or `initialized`
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<KalshiEvent>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSearchKalshi(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
  if (params?.q !== undefined) qs['q'] = String(params.q)
  if (params?.category !== undefined) qs['category'] = String(params.category)
  if (params?.status !== undefined) qs['status'] = String(params.status)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`search/kalshi`, qs)
}

/**
 * Search crypto news articles by keyword. Returns top 10 results ranked by relevance with highlighted matching fragments.
 * @param {Object} params
 * @param {string} params.q — Search keyword or phrase
 * @returns {Promise<{{data: Array<NewsArticleItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSearchNews(params) {
  const qs = {}
  qs['q'] = String(params.q)
  return proxyGet(`search/news`, qs)
}

/**
 * Search Polymarket events by keyword, tags, and/or category. Filter by keyword matching market question, event title, or description; by comma-separated tag labels; or by Surf-curated category. At least one of `q`, `tags`, or `category` is required. Returns events with nested markets ranked by volume.

Data refresh: ~30 minutes
 * @param {Object} params
 * @param {string} [params.q] — Search keyword matching market question, event title, or description
 * @param {string} [params.tags] — Comma-separated tag labels to filter by (matches any). Commonly used tags: `Crypto`, `Politics`, `Sports`, `Science`, `Pop Culture`
 * @param {('crypto'|'culture'|'early_polymarket_trades'|'economics'|'financials'|'politics'|'stem'|'sports'|'unknown')} [params.category] — Filter by Surf-curated category
 * @param {('active'|'finalized'|'ended'|'initialized'|'closed')} [params.status] — Market status filter: `active`, `finalized`, `ended`, `initialized`, or `closed` (default: active)
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<PolymarketEvent>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSearchPolymarket(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
  if (params?.q !== undefined) qs['q'] = String(params.q)
  if (params?.tags !== undefined) qs['tags'] = String(params.tags)
  if (params?.category !== undefined) qs['category'] = String(params.category)
  qs['status'] = String(params?.status ?? 'active')
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`search/polymarket`, qs)
}

/**
 * Search crypto projects by keyword. Returns matching projects with name, description, chains, and logo.
 * @param {Object} params
 * @param {string} params.q — Search keyword — project name or ticker like `uniswap`, `bitcoin`, or `ETH`
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<ProjectSearchItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSearchProject(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`search/project`, qs)
}

/**
 * Search X (Twitter) users by keyword. Returns user profiles with handle, display name, bio, follower count, and avatar.
 * @param {Object} params
 * @param {string} params.q — Search keyword or `@handle` for exact handle lookup. Use a keyword like `vitalik` for fuzzy matching across names and bios, or `@VitalikButerin` to find a specific account by handle
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {string} [params.cursor] — Opaque cursor token from a previous response's next_cursor field for fetching the next page
 * @returns {Promise<{{data: Array<XUser>, meta: {{has_more: boolean, next_cursor?: string, limit?: number}}}}>}
 */
async function fetchSearchSocialPeople(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  const qs = {}
  qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  if (params?.cursor !== undefined) qs['cursor'] = String(params.cursor)
  return proxyGet(`search/social/people`, qs)
}

/**
 * Search X (Twitter) posts by keyword or `from:handle` syntax. Returns posts with author, content, engagement metrics, and timestamp. To load more results, check `meta.has_more`; if true, pass `meta.next_cursor` as the `cursor` query parameter in the next request.
 * @param {Object} params
 * @param {string} params.q — Search keyword or `from:handle` syntax like `ethereum` or `from:cz_binance`
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {string} [params.cursor] — Opaque cursor token from a previous response's next_cursor field for fetching the next page
 * @returns {Promise<{{data: Array<XTweet>, meta: {{has_more: boolean, next_cursor?: string, limit?: number}}}}>}
 */
async function fetchSearchSocialPosts(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  const qs = {}
  qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  if (params?.cursor !== undefined) qs['cursor'] = String(params.cursor)
  return proxyGet(`search/social/posts`, qs)
}

/**
 * Search wallets by ENS name, address label, or address prefix. Returns matching wallet addresses with entity labels.
 * @param {Object} params
 * @param {string} params.q — Search keyword like `binance`, `vitalik.eth`, or `0xd8dA...`
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<WalletSearchItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSearchWallet(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`search/wallet`, qs)
}

/**
 * Search web pages, articles, and content by keyword. Filter by domain with `site` like `coindesk.com`. Returns titles, URLs, and content snippets.
 * @param {Object} params
 * @param {string} params.q — Search query like `bitcoin price prediction 2026`
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @param {string} [params.site] — Comma-separated domain filter like `coindesk.com` or `cointelegraph.com`
 * @returns {Promise<{{data: Array<WebSearchResultItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSearchWeb(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  if (params?.site !== undefined) qs['site'] = String(params.site)
  return proxyGet(`search/web`, qs)
}

module.exports = {
  fetchSearchAirdrop,
  fetchSearchEvents,
  fetchSearchFund,
  fetchSearchKalshi,
  fetchSearchNews,
  fetchSearchPolymarket,
  fetchSearchProject,
  fetchSearchSocialPeople,
  fetchSearchSocialPosts,
  fetchSearchWallet,
  fetchSearchWeb,
}
