/**
 * Project API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 * CommonJS module. Usage: const { fetchXxx } = require('./api-project')
 */

'use strict'

const { proxyGet, proxyPost } = require('./api')

/**
 * @typedef {Object} HumaProjectDetailBody
 * @property {ProjectContractsItem} [contracts] — Deployed smart contract addresses across chains
 * @property {ProjectFundingItem} [funding] — Fundraising history (rounds, amounts, investors)
 * @property {ProjectOverviewItem} [overview] — Comprehensive project overview (name, description, website, tags, chains, token symbol, social handles)
 * @property {ProjectSocialItem} [social] — Social media links and follower counts
 * @property {ProjectTeamItem} [team] — Team members with roles and social links
 * @property {ProjectTgeStatusItem} [tge_status] — TGE status and exchange listings (pre/upcoming/post)
 * @property {ProjectTokenInfoItem} [token_info] — Native token market data (price, supply, market cap, price changes)
 * @property {ProjectTokenomicsItem} [tokenomics] — Token distribution and supply metrics
 */

/**
 * @typedef {Object} ProjectMetricPoint
 * @property {number} timestamp — Unix timestamp in seconds for this data point
 * @property {number} value — Metric value at this timestamp
 */

/**
 * @typedef {Object} ProjectTopRankItem
 * @property {number} [fees]
 * @property {string} [logo_url] — Project logo image URL
 * @property {string} name
 * @property {number} [revenue]
 * @property {string} [symbol]
 * @property {number} [tvl]
 * @property {number} [users]
 * @property {number} [volume]
 */


/**
 * Get time-series DeFi metrics for a project. Available metrics: `volume`, `fee`, `fees`, `revenue`, `tvl`, `users`. Lookup by UUID (`id`) or name (`q`). Filter by `chain` and date range (`from`/`to`). Returns 404 if the project is not found. **Note:** this endpoint only returns data for DeFi protocol projects (e.g. `aave`, `uniswap`, `lido`, `makerdao`). Use `q` with a DeFi protocol name.
 * @param {Object} params
 * @param {string} [params.id] — Surf project UUID. PREFERRED — always use this when available from a previous response (e.g. project_id from /fund/portfolio or id from /search/project). Takes priority over q.
 * @param {string} [params.q] — Fuzzy entity name search. Only use when 'id' is not available. May return unexpected results for ambiguous names.
 * @param {('volume'|'fee'|'fees'|'revenue'|'tvl'|'users')} params.metric — Metric to query. Can be `volume`, `fees` (or `fee` alias), `revenue`, `tvl`, or `users`.
 * @param {string} [params.from] — Start of time range. Accepts Unix seconds (`1704067200`) or date string (`2024-01-01`)
 * @param {string} [params.to] — End of time range. Accepts Unix seconds (`1706745600`) or date string (`2024-02-01`)
 * @param {('ethereum'|'polygon'|'bsc'|'arbitrum'|'optimism'|'base'|'avalanche'|'fantom'|'solana')} [params.chain] — Filter by chain. Can be `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`, or `solana`.
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<ProjectMetricPoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchProjectDefiMetrics(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  if (params?.id !== undefined) qs['id'] = String(params.id)
  if (params?.q !== undefined) qs['q'] = String(params.q)
  qs['metric'] = String(params.metric)
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  if (params?.chain !== undefined) qs['chain'] = String(params.chain)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`project/defi/metrics`, qs)
}

/**
 * Get top DeFi projects ranked by a protocol metric. Available metrics: `tvl`, `revenue`, `fees`, `volume`, `users`.
 * @param {Object} params
 * @param {('tvl'|'revenue'|'fees'|'volume'|'users')} params.metric — Ranking metric. Can be `tvl`, `revenue`, `fees`, `volume`, or `users`.
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<ProjectTopRankItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchProjectDefiRanking(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['metric'] = String(params.metric)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`project/defi/ranking`, qs)
}

/**
 * Get multiple project sub-resources in a single request. Use `fields` to select: `overview`, `token_info`, `tokenomics`, `funding`, `team`, `contracts`, `social`, `tge_status`. **Accepts project names directly** via `q` (e.g. `?q=aave`) — no need to call `/search/project` first. Also accepts UUID via `id`. Returns 404 if not found.

For DeFi metrics (TVL, fees, revenue, volume, users) and per-chain breakdown, use `/project/defi/metrics`.
 * @param {Object} params
 * @param {string} [params.id] — Surf project UUID. PREFERRED — always use this when available from a previous response (e.g. project_id from /fund/portfolio or id from /search/project). Takes priority over q.
 * @param {string} [params.q] — Fuzzy entity name search. Only use when 'id' is not available. May return unexpected results for ambiguous names.
 * @param {string} [params.fields] — Comma-separated sub-resources to include. Can be `overview`, `token_info`, `tokenomics`, `funding`, `team`, `contracts`, `social`, or `tge_status`. (default: overview,token_info,tokenomics,funding,team,contracts,social,tge_status)
 * @returns {Promise<{{data: HumaProjectDetailBody, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchProjectDetail(params) {
  const qs = {}
  if (params?.id !== undefined) qs['id'] = String(params.id)
  if (params?.q !== undefined) qs['q'] = String(params.q)
  qs['fields'] = String(params?.fields ?? 'overview,token_info,tokenomics,funding,team,contracts,social,tge_status')
  return proxyGet(`project/detail`, qs)
}

module.exports = {
  fetchProjectDefiMetrics,
  fetchProjectDefiRanking,
  fetchProjectDetail,
}
