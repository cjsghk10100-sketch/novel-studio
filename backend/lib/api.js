/**
 * Crypto API client — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 *
 * Backend-only: CommonJS fetch functions, no React Query hooks.
 * Usage:
 *   const { fetchMarketPrice, proxyGet } = require('./api')
 */

// ---------------------------------------------------------------------------
// Proxy helpers
// ---------------------------------------------------------------------------

const DATA_PROXY_BASE = process.env.DATA_PROXY_BASE || 'http://127.0.0.1:9999/proxy'

/**
 * Normalize logical proxy paths; strips leading slashes and proxy/ prefix.
 * @param {string} path - The proxy path to normalize
 * @returns {string} Normalized path without leading slashes or proxy/ prefix
 */
function normalizeProxyPath(path) {
  const trimmed = String(path || '').replace(/^\/+/, '')
  return trimmed.replace(/^(?:proxy\/)+/, '')
}

/**
 * Fetch JSON with retry on empty response.
 * @param {string} url - The URL to fetch
 * @param {RequestInit} [init] - Optional fetch init options
 * @param {number} [retries=1] - Number of retries on empty response
 * @returns {Promise<*>} Parsed JSON response
 */
async function fetchWithRetry(url, init, retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, init)
    const text = await res.text()
    if (text) return JSON.parse(text)
    if (attempt < retries) await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error(`Empty response from ${url.replace(DATA_PROXY_BASE, '')}`)
}

/**
 * Proxy GET — calls DATA_PROXY_BASE/{path} with query params.
 * @param {string} path - API path (e.g. 'market/price')
 * @param {Object.<string, string>} [params] - Query parameters
 * @returns {Promise<*>} Parsed JSON response
 */
async function proxyGet(path, params) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return fetchWithRetry(`${DATA_PROXY_BASE}/${normalizeProxyPath(path)}${qs}`)
}

/**
 * Proxy POST — calls DATA_PROXY_BASE/{path} with JSON body.
 * @param {string} path - API path (e.g. 'onchain/sql')
 * @param {*} [body] - Request body (will be JSON-serialized)
 * @returns {Promise<*>} Parsed JSON response
 */
async function proxyPost(path, body) {
  return fetchWithRetry(`${DATA_PROXY_BASE}/${normalizeProxyPath(path)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

module.exports.DATA_PROXY_BASE = DATA_PROXY_BASE
module.exports.normalizeProxyPath = normalizeProxyPath
module.exports.fetchWithRetry = fetchWithRetry
module.exports.proxyGet = proxyGet
module.exports.proxyPost = proxyPost

// ---------------------------------------------------------------------------
// Re-export all category modules for convenience
// Usage: const { fetchMarketPrice, fetchWalletBalance } = require('./api')
// ---------------------------------------------------------------------------

Object.assign(module.exports, require('./api-market'))
Object.assign(module.exports, require('./api-project'))
Object.assign(module.exports, require('./api-wallet'))
Object.assign(module.exports, require('./api-token'))
Object.assign(module.exports, require('./api-social'))
Object.assign(module.exports, require('./api-news'))
Object.assign(module.exports, require('./api-onchain'))
Object.assign(module.exports, require('./api-web'))
Object.assign(module.exports, require('./api-fund'))
Object.assign(module.exports, require('./api-search'))
Object.assign(module.exports, require('./api-prediction-market'))
Object.assign(module.exports, require('./api-exchange'))
