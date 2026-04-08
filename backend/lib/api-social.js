/**
 * Social API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 * CommonJS module. Usage: const { fetchXxx } = require('./api-social')
 */

'use strict'

const { proxyGet, proxyPost } = require('./api')

/**
 * @typedef {Object} MindshareTopProject
 * @property {MindshareTopProjectInfo} [project] — Project metadata
 * @property {number} rank — Rank position in the mindshare leaderboard
 * @property {string} [sentiment] — Sentiment polarity: positive or negative
 * @property {number} [sentiment_score] — Weighted sentiment score from -1 (very negative) to 1 (very positive)
 * @property {Array<string>|null} [tags] — Project category tags
 * @property {MindshareTopTokenInfo} [token] — Token metadata
 * @property {string} [trending_short_reason] — Deprecated: no longer populated.
 * @property {string} [trending_summary] — Deprecated: no longer populated.
 * @property {MindshareTopTwitterInfo} [twitter] — X (Twitter) account metadata
 */

/**
 * @typedef {Object} SmartFollowerHistoryPoint
 * @property {number} count — Number of smart followers on this date
 * @property {string} date — Date in YYYY-MM-DD format
 */

/**
 * @typedef {Object} SocialDetailBody
 * @property {FollowerGeoData} [follower_geo] — Geographic breakdown of followers
 * @property {string} [project_id] — Surf project UUID — pass as 'id' parameter to /project/detail, /project/events, or /project/defi/metrics. Omitted for direct x_id lookups.
 * @property {string} [project_name] — Project name (omitted for direct x_id lookups)
 * @property {SentimentData} [sentiment] — Sentiment analysis data for the project
 * @property {SmartFollowersData} [smart_followers] — Top smart followers for the project
 * @property {string} twitter_id — Numeric X (Twitter) account ID
 */

/**
 * @typedef {Object} SocialMindsharePoint
 * @property {number} timestamp — Unix timestamp in seconds
 * @property {number} value — Mindshare view count at this timestamp
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
 * Get a **point-in-time snapshot** of social analytics: sentiment score, follower geo breakdown, and top smart followers. Use `fields` to select: `sentiment`, `follower_geo`, `smart_followers`. Lookup by X account ID (`x_id`) or project name (`q`, e.g. `uniswap`, `solana`). The `q` parameter must be a crypto project name, not a personal Twitter handle. Returns 404 if the project has no linked Twitter account.

For sentiment **trends over time**, use `/social/mindshare` instead.
 * @param {Object} params
 * @param {string} [params.x_id] — Numeric X (Twitter) account ID (takes priority over `q`)
 * @param {string} [params.q] — Entity name to resolve like `uniswap`, `ethereum`, or `aave`
 * @param {string} [params.fields] — Comma-separated sub-resources to include. Can be `sentiment`, `follower_geo`, or `smart_followers`. (default: sentiment,follower_geo,smart_followers)
 * @param {('24h'|'48h'|'7d'|'30d'|'3m'|'6m'|'1y')} [params.time_range] — Timeframe for sentiment data. Can be `24h`, `48h`, `7d`, `30d`, `3m`, `6m`, or `1y`. (default: 7d)
 * @param {number} [params.geo_limit] — Max geo locations to return (default: 20) @min 1 @max 100
 * @returns {Promise<{{data: SocialDetailBody, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSocialDetail(params) {
  if (params?.geo_limit !== undefined) params.geo_limit = Math.max(1, Math.min(100, params?.geo_limit))
  const qs = {}
  if (params?.x_id !== undefined) qs['x_id'] = String(params.x_id)
  if (params?.q !== undefined) qs['q'] = String(params.q)
  qs['fields'] = String(params?.fields ?? 'sentiment,follower_geo,smart_followers')
  qs['time_range'] = String(params?.time_range ?? '7d')
  qs['geo_limit'] = String(params?.geo_limit ?? 20)
  return proxyGet(`social/detail`, qs)
}

/**
 * Get mindshare (social view count) **time-series trend** for a project, aggregated by `interval`. Use this when the user asks about sentiment **trends**, mindshare **over time**, or social momentum changes. `interval` can be `5m`, `1h`, `1d`, or `7d`. Filter by date range with `from`/`to` (Unix seconds). Lookup by name (`q`).

For a **point-in-time snapshot** of social analytics (sentiment score, follower geo, smart followers), use `/social/detail` instead.
 * @param {Object} params
 * @param {string} params.q — Entity name to resolve like `uniswap`, `ethereum`, or `aave`
 * @param {('5m'|'1h'|'1d'|'7d')} params.interval — Time aggregation interval. Can be `5m`, `1h`, `1d`, or `7d`.
 * @param {string} [params.from] — Start timestamp. Accepts Unix seconds (1704067200) or date string (2024-01-01)
 * @param {string} [params.to] — End timestamp. Accepts Unix seconds (1706745600) or date string (2024-02-01)
 * @returns {Promise<{{data: Array<SocialMindsharePoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSocialMindshare(params) {
  const qs = {}
  qs['q'] = String(params.q)
  qs['interval'] = String(params.interval)
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  return proxyGet(`social/mindshare`, qs)
}

/**
 * Get top crypto projects ranked by mindshare (social view count), sourced directly from Argus real-time data (refreshed every 5 minutes). Filter by `tag` to scope to a category (e.g. `dex`, `l1`, `meme`). Use `time_range` (`24h`, `48h`, `7d`, `30d`) to control the ranking window. Supports `limit`/`offset` pagination.
 * @param {Object} params
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {('l1'|'l2'|'dex'|'derivatives'|'cex'|'gamefi'|'nft'|'oracle'|'prediction'|'rwa'|'yield'|'data'|'devtool'|'compliance'|'meme'|'')} [params.tag] — Filter by project category. `l1` = Layer 1, `l2` = Layer 2/scaling, `dex` = DEX/AMM, `derivatives` = perps/options, `cex` = centralized exchange, `gamefi` = gaming, `nft` = NFT collections, `oracle` = oracle, `prediction` = prediction market, `rwa` = real-world assets, `yield` = yield/asset management, `data` = data/analytics, `devtool` = developer tooling, `compliance` = compliance/regtech, `meme` = meme/token launchpad.
 * @param {('24h'|'48h'|'7d'|'30d')} [params.time_range] — Mindshare ranking timeframe window (default: 7d)
 * @param {('positive'|'negative'|'')} [params.sentiment] — Filter by sentiment polarity. Only projects with sufficient tweet data are classified.
 * @returns {Promise<{{data: Array<MindshareTopProject>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSocialRanking(params) {
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  const qs = {}
  qs['offset'] = String(params?.offset ?? 0)
  qs['limit'] = String(params?.limit ?? 20)
  if (params?.tag !== undefined) qs['tag'] = String(params.tag)
  qs['time_range'] = String(params?.time_range ?? '7d')
  if (params?.sentiment !== undefined) qs['sentiment'] = String(params.sentiment)
  return proxyGet(`social/ranking`, qs)
}

/**
 * Get smart follower count time-series for a project, sorted by date descending. Lookup by X account ID (`x_id`) or project name (`q`). The `q` parameter must be a project name (e.g. `uniswap`, `ethereum`), not a personal X handle — use `x_id` for individual accounts. Returns 404 if the project has no linked X account.
 * @param {Object} params
 * @param {string} [params.x_id] — Numeric X (Twitter) account ID (takes priority over `q`)
 * @param {string} [params.q] — Project name to resolve (e.g. `uniswap`, `ethereum`). Must be a project with a linked X account — personal handles like `VitalikButerin` return 404. Use `x_id` for individual accounts.
 * @param {number} [params.limit] — Max data points to return (upstream typically provides ~36 daily points) (default: 36) @min 1 @max 100
 * @returns {Promise<{{data: Array<SmartFollowerHistoryPoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSocialSmartFollowersHistory(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  const qs = {}
  if (params?.x_id !== undefined) qs['x_id'] = String(params.x_id)
  if (params?.q !== undefined) qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 36)
  return proxyGet(`social/smart-followers/history`, qs)
}

/**
 * Returns replies/comments on a specific tweet. Lookup by `tweet_id`.
 * @param {Object} params
 * @param {string} params.tweet_id — Tweet ID to get replies for
 * @param {number} [params.limit] — Max results to return (default: 20) @min 1 @max 100
 * @param {string} [params.cursor] — Opaque cursor token from a previous response's next_cursor field for fetching the next page
 * @returns {Promise<{{data: Array<XTweet>, meta: {{has_more: boolean, next_cursor?: string, limit?: number}}}}>}
 */
async function fetchSocialTweetReplies(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  const qs = {}
  qs['tweet_id'] = String(params.tweet_id)
  qs['limit'] = String(params?.limit ?? 20)
  if (params?.cursor !== undefined) qs['cursor'] = String(params.cursor)
  return proxyGet(`social/tweet/replies`, qs)
}

/**
 * Get X (Twitter) posts by numeric post ID strings. Pass up to 100 comma-separated IDs via the `ids` query parameter.
 * @param {Object} params
 * @param {string} params.ids — Comma-separated numeric post ID strings, max 100
 * @returns {Promise<{{data: Array<XTweet>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSocialTweets(params) {
  const qs = {}
  qs['ids'] = String(params.ids)
  return proxyGet(`social/tweets`, qs)
}

/**
 * Get an X (Twitter) user profile — display name, follower count, following count, and bio. Lookup by `handle` (without @).
 * @param {Object} params
 * @param {string} params.handle — X (Twitter) username without @ like `cz_binance` or `vitalikbuterin`
 * @returns {Promise<{{data: XUser, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchSocialUser(params) {
  const qs = {}
  qs['handle'] = String(params.handle)
  return proxyGet(`social/user`, qs)
}

/**
 * Returns a list of followers for the specified handle on X (Twitter). Lookup by `handle` (without @).
 * @param {Object} params
 * @param {string} params.handle — X (Twitter) username without @ like `vitalikbuterin` or `cz_binance`
 * @param {number} [params.limit] — Max results to return (default: 20) @min 1 @max 100
 * @param {string} [params.cursor] — Opaque cursor token from a previous response's next_cursor field for fetching the next page
 * @returns {Promise<{{data: Array<XUser>, meta: {{has_more: boolean, next_cursor?: string, limit?: number}}}}>}
 */
async function fetchSocialUserFollowers(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  const qs = {}
  qs['handle'] = String(params.handle)
  qs['limit'] = String(params?.limit ?? 20)
  if (params?.cursor !== undefined) qs['cursor'] = String(params.cursor)
  return proxyGet(`social/user/followers`, qs)
}

/**
 * Returns a list of users that the specified handle follows on X (Twitter). Lookup by `handle` (without @).
 * @param {Object} params
 * @param {string} params.handle — X (Twitter) username without @ like `vitalikbuterin` or `cz_binance`
 * @param {number} [params.limit] — Max results to return (default: 20) @min 1 @max 100
 * @param {string} [params.cursor] — Opaque cursor token from a previous response's next_cursor field for fetching the next page
 * @returns {Promise<{{data: Array<XUser>, meta: {{has_more: boolean, next_cursor?: string, limit?: number}}}}>}
 */
async function fetchSocialUserFollowing(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  const qs = {}
  qs['handle'] = String(params.handle)
  qs['limit'] = String(params?.limit ?? 20)
  if (params?.cursor !== undefined) qs['cursor'] = String(params.cursor)
  return proxyGet(`social/user/following`, qs)
}

/**
 * Get recent X (Twitter) posts by a specific user, ordered by recency. Lookup by `handle` (without @). Use `filter=original` to exclude retweets. To load more results, check `meta.has_more`; if true, pass `meta.next_cursor` as the `cursor` query parameter in the next request.
 * @param {Object} params
 * @param {string} params.handle — X (Twitter) username without @ like `vitalikbuterin` or `cz_binance`
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {string} [params.cursor] — Opaque cursor token from a previous response's next_cursor field for fetching the next page
 * @param {('all'|'original')} [params.filter] — Filter tweets: `all` returns everything, `original` excludes retweets (default: all)
 * @returns {Promise<{{data: Array<XTweet>, meta: {{has_more: boolean, next_cursor?: string, limit?: number}}}}>}
 */
async function fetchSocialUserPosts(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  const qs = {}
  qs['handle'] = String(params.handle)
  qs['limit'] = String(params?.limit ?? 20)
  if (params?.cursor !== undefined) qs['cursor'] = String(params.cursor)
  qs['filter'] = String(params?.filter ?? 'all')
  return proxyGet(`social/user/posts`, qs)
}

/**
 * Returns recent replies by the specified handle on X (Twitter). Lookup by `handle` (without @).
 * @param {Object} params
 * @param {string} params.handle — X (Twitter) username without @ like `vitalikbuterin` or `cz_binance`
 * @param {number} [params.limit] — Max results to return (default: 20) @min 1 @max 100
 * @param {string} [params.cursor] — Opaque cursor token from a previous response's next_cursor field for fetching the next page
 * @returns {Promise<{{data: Array<XTweet>, meta: {{has_more: boolean, next_cursor?: string, limit?: number}}}}>}
 */
async function fetchSocialUserReplies(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  const qs = {}
  qs['handle'] = String(params.handle)
  qs['limit'] = String(params?.limit ?? 20)
  if (params?.cursor !== undefined) qs['cursor'] = String(params.cursor)
  return proxyGet(`social/user/replies`, qs)
}

module.exports = {
  fetchSocialDetail,
  fetchSocialMindshare,
  fetchSocialRanking,
  fetchSocialSmartFollowersHistory,
  fetchSocialTweetReplies,
  fetchSocialTweets,
  fetchSocialUser,
  fetchSocialUserFollowers,
  fetchSocialUserFollowing,
  fetchSocialUserPosts,
  fetchSocialUserReplies,
}
