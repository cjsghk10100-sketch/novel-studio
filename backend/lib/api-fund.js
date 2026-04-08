/**
 * Fund API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 * CommonJS module. Usage: const { fetchXxx } = require('./api-fund')
 */

'use strict'

const { proxyGet, proxyPost } = require('./api')

/**
 * @typedef {Object} FundDetailItem
 * @property {string} [description] — Fund description
 * @property {string} id — Surf fund UUID — pass as 'id' parameter to /fund/detail or /fund/portfolio for exact lookup
 * @property {string} [image] — Fund logo URL
 * @property {number} invested_projects_count — Total number of unique invested projects (a project with multiple funding rounds counts once)
 * @property {string} [jurisdiction] — Fund jurisdiction
 * @property {Array<FundLinkItem>|null} links — Fund links (website, social, etc.)
 * @property {Array<FundMemberItem>|null} members — Fund team members
 * @property {string} name — Fund name
 * @property {Array<FundResearchItem>|null} recent_researches — Recent research publications
 * @property {number} tier — Fund tier ranking (lower is better)
 * @property {string} [type] — Fund type like `VC` or `Accelerator`
 * @property {Array<FundXAccountItem>|null} x_accounts — X (Twitter) accounts
 */

/**
 * @typedef {Object} FundPortfolioItem
 * @property {number} [invested_at] — Investment date (Unix seconds)
 * @property {boolean} is_lead — Whether this fund was the lead investor
 * @property {string} project_id — Surf project UUID — pass as 'id' parameter to /project/detail, /project/events, or /project/defi/metrics for exact lookup. Prefer over 'q' (fuzzy name search).
 * @property {string} [project_logo] — Project logo URL
 * @property {string} project_name — Project name
 * @property {string} [project_slug] — Project slug
 * @property {number} [recent_raise] — Most recent funding round amount in USD
 * @property {number} [total_raise] — Total amount raised by the project in USD
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
 * Get a fund's **profile metadata**: X accounts, team members, recent research, and invested project count. This does NOT return the list of investments — use `/fund/portfolio` for that. Lookup by UUID (`id`) or name (`q`). Returns 404 if not found.
 * @param {Object} params
 * @param {string} [params.id] — Surf fund UUID. PREFERRED — always use this when available from a previous response (e.g. id from /search/fund). Takes priority over q.
 * @param {string} [params.q] — Fuzzy fund name search. Only use when 'id' is not available. May return unexpected results for ambiguous names.
 * @returns {Promise<{{data: FundDetailItem, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchFundDetail(params) {
  const qs = {}
  if (params?.id !== undefined) qs['id'] = String(params.id)
  if (params?.q !== undefined) qs['q'] = String(params.q)
  return proxyGet(`fund/detail`, qs)
}

/**
 * List investment rounds for a fund's portfolio, sorted by date (newest first). A project may appear multiple times if the fund participated in multiple rounds. Each entry includes project name, logo, date, raise amount, and lead investor status. Lookup by UUID (`id`) or name (`q`).
 * @param {Object} params
 * @param {string} [params.id] — Surf fund UUID. PREFERRED — always use this when available from a previous response (e.g. id from /search/fund). Takes priority over q.
 * @param {string} [params.q] — Fuzzy fund name search. Only use when 'id' is not available. May return unexpected results for ambiguous names.
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @param {('true'|'false'|'')} [params.is_lead] — Filter by lead investor status. Omit or leave empty for all investments.
 * @param {number} [params.invested_after] — Only include investments at or after this Unix timestamp (seconds)
 * @param {number} [params.invested_before] — Only include investments before this Unix timestamp (seconds)
 * @param {('invested_at'|'recent_raise'|'total_raise')} [params.sort_by] — Field to sort results by (default: invested_at)
 * @param {('asc'|'desc')} [params.order] — Sort order (default: desc)
 * @returns {Promise<{{data: Array<FundPortfolioItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchFundPortfolio(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
  if (params?.id !== undefined) qs['id'] = String(params.id)
  if (params?.q !== undefined) qs['q'] = String(params.q)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  if (params?.is_lead !== undefined) qs['is_lead'] = String(params.is_lead)
  if (params?.invested_after !== undefined) qs['invested_after'] = String(params.invested_after)
  if (params?.invested_before !== undefined) qs['invested_before'] = String(params.invested_before)
  qs['sort_by'] = String(params?.sort_by ?? 'invested_at')
  qs['order'] = String(params?.order ?? 'desc')
  return proxyGet(`fund/portfolio`, qs)
}

/**
 * List top-ranked funds by metric. Available metrics: `tier` (lower is better), `portfolio_count` (number of invested projects).
 * @param {Object} params
 * @param {('tier'|'portfolio_count')} params.metric — Ranking metric. Can be `tier` (lower is better) or `portfolio_count` (number of invested projects).
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<FundSearchItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchFundRanking(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['metric'] = String(params.metric)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`fund/ranking`, qs)
}

module.exports = {
  fetchFundDetail,
  fetchFundPortfolio,
  fetchFundRanking,
}
