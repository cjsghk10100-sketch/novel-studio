/**
 * News API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 * CommonJS module. Usage: const { fetchXxx } = require('./api-news')
 */

'use strict'

const { proxyGet, proxyPost } = require('./api')

/**
 * @typedef {Object} NewsArticleDetailItem
 * @property {string} content — Full article body text
 * @property {string} id — Article ID
 * @property {string} [project_id] — Surf project UUID
 * @property {string} [project_name] — Primary crypto project referenced in the article
 * @property {number} published_at — Unix timestamp in seconds when the article was published
 * @property {string} [source] — Publisher name
 * @property {string} [summary] — Short summary of the article
 * @property {string} title — Article headline
 * @property {string} [url] — Direct URL to the original article
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
 * Returns the full content of a single news article by its ID (returned as `id` in feed and search results).
 * @param {Object} params
 * @param {string} params.id — Article ID (returned as id in feed/search results)
 * @returns {Promise<{{data: NewsArticleDetailItem, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchNewsDetail(params) {
  const qs = {}
  qs['id'] = String(params.id)
  return proxyGet(`news/detail`, qs)
}

/**
 * Browse crypto news from major sources. Filter by `source` (enum), `project`, and time range (`from`/`to`). Sort by `recency` (default) or `trending`. Use the detail endpoint with article `id` for full content.
 * @param {Object} params
 * @param {('coindesk'|'cointelegraph'|'theblock'|'decrypt'|'dlnews'|'blockbeats'|'bitcoincom'|'coinpedia'|'ambcrypto'|'cryptodaily'|'cryptopotato'|'phemex'|'panews'|'odaily'|'tradingview'|'chaincatcher'|'techflow')} [params.source] — Filter by news source
 * @param {string} [params.project] — Comma-separated project names to filter by
 * @param {string} [params.from] — Filter articles published on or after this time. Accepts Unix seconds or date string (2024-01-01)
 * @param {string} [params.to] — Filter articles published on or before this time. Accepts Unix seconds or date string (2024-02-01)
 * @param {('recency'|'trending')} [params.sort_by] — Sort order: recency (newest first) or trending (hot right now) (default: recency)
 * @param {number} [params.limit] — Results per page (max 50) (default: 20) @min 1 @max 50
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<NewsArticleItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchNewsFeed(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(50, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
  if (params?.source !== undefined) qs['source'] = String(params.source)
  if (params?.project !== undefined) qs['project'] = String(params.project)
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  qs['sort_by'] = String(params?.sort_by ?? 'recency')
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`news/feed`, qs)
}

module.exports = {
  fetchNewsDetail,
  fetchNewsFeed,
}
