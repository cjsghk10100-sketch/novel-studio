/**
 * Web API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 * CommonJS module. Usage: const { fetchXxx } = require('./api-web')
 */

'use strict'

const { proxyGet, proxyPost } = require('./api')

/**
 * @typedef {Object} WebFetchResultItem
 * @property {string} content — Full page content converted to clean markdown text
 * @property {string} [title] — Page title extracted from the HTML
 * @property {string} url — The URL that was fetched
 */


/**
 * Fetch a web page and convert it to clean, LLM-friendly markdown. Use `target_selector` to extract specific page sections and `remove_selector` to strip unwanted elements. Returns 400 if the URL is invalid or unreachable.
 * @param {Object} params
 * @param {string} params.url — URL to fetch and parse
 * @param {string} [params.target_selector] — CSS selector to extract specific content
 * @param {string} [params.remove_selector] — CSS selector to remove unwanted elements
 * @param {string} [params.wait_for_selector] — CSS selector to wait for before extracting
 * @param {number} [params.timeout] — Request timeout in milliseconds (default: 30000) @min 1000 @max 60000
 * @returns {Promise<{{data: WebFetchResultItem, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchWebFetch(params) {
  if (params.timeout !== undefined) params.timeout = Math.max(1000, Math.min(60000, params.timeout))
  const qs = {}
  qs['url'] = String(params.url)
  if (params?.target_selector !== undefined) qs['target_selector'] = String(params.target_selector)
  if (params?.remove_selector !== undefined) qs['remove_selector'] = String(params.remove_selector)
  if (params?.wait_for_selector !== undefined) qs['wait_for_selector'] = String(params.wait_for_selector)
  qs['timeout'] = String(params?.timeout ?? 30000)
  return proxyGet(`web/fetch`, qs)
}

module.exports = {
  fetchWebFetch,
}
