/**
 * Token API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 * CommonJS module. Usage: const { fetchXxx } = require('./api-token')
 */

'use strict'

const { proxyGet, proxyPost } = require('./api')

/**
 * @typedef {Object} DexTradeItem
 * @property {number} amount_usd — Trade value in USD at execution time
 * @property {number} block_time — Unix timestamp in seconds when the trade was executed
 * @property {string} project — DEX project name like `uniswap`, `sushiswap`, or `curve`
 * @property {string} taker — Wallet address that initiated the swap
 * @property {string} [token_bought_address] — Contract address of the token bought
 * @property {number} token_bought_amount — Amount of tokens bought (decimal-adjusted)
 * @property {string} token_bought_symbol — Symbol of the token bought in this trade
 * @property {string} token_pair — Trading pair symbol like `WETH-USDC`
 * @property {string} [token_sold_address] — Contract address of the token sold
 * @property {number} token_sold_amount — Amount of tokens sold (decimal-adjusted)
 * @property {string} token_sold_symbol — Symbol of the token sold in this trade
 * @property {string} tx_hash — Transaction hash
 * @property {string} version — DEX version like `v2` or `v3`
 */

/**
 * @typedef {Object} TokenHolderItem
 * @property {string} address — Wallet address of the token holder
 * @property {string} balance — Token balance (decimal-adjusted, human-readable)
 * @property {string} [entity_name] — Name of the associated entity like `Binance` or `Aave`
 * @property {string} [entity_type] — Type of entity like `exchange`, `fund`, or `whale`
 * @property {number} [percentage] — Share of total supply held as a percentage (5.2 means 5.2%)
 */

/**
 * @typedef {Object} TokenTransferItem
 * @property {string} amount — Transfer amount (decimal-adjusted, human-readable)
 * @property {number} [amount_usd] — Transfer value in USD at the time of the transaction. Not available for all transfers.
 * @property {number} block_number — Block number in which this transfer was included
 * @property {string} from_address — Sender wallet address
 * @property {string} [symbol] — Token symbol like ETH, USDC, or WETH
 * @property {number} timestamp — Unix timestamp in seconds when the transfer occurred
 * @property {string} to_address — Recipient wallet address
 * @property {string} tx_hash — Transaction hash
 */

/**
 * @typedef {Object} TokenUnlockPoint
 * @property {Array<TokenUnlockAllocationItem>|null} [allocations] — Breakdown by allocation
 * @property {number} timestamp — Unix timestamp in seconds
 * @property {number} unlock_amount — Cumulative total tokens unlocked up to this timestamp (decimal-adjusted)
 */


/**
 * Get recent DEX swap events for a token contract address. Covers DEXes like `uniswap`, `sushiswap`, `curve`, and `balancer` on `ethereum` and `base`. Returns trading pair, amounts, USD value, and taker address.

Data refresh: ~24 hours · Chain: Ethereum, Base
 * @param {Object} params
 * @param {string} params.address — Token contract address (0x-prefixed hex)
 * @param {('ethereum'|'base')} [params.chain] — Chain. Can be `ethereum` or `base`. (default: ethereum)
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<DexTradeItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchTokenDexTrades(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['address'] = String(params.address)
  qs['chain'] = String(params?.chain ?? 'ethereum')
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`token/dex-trades`, qs)
}

/**
 * Get top token holders for a contract address — wallet address, balance, and percentage. Lookup by `address` and `chain`. Supports EVM chains and Solana.
 * @param {Object} params
 * @param {string} params.address — Token contract address (0x-prefixed hex or Solana base58)
 * @param {('ethereum'|'polygon'|'bsc'|'solana'|'avalanche'|'arbitrum'|'optimism'|'base')} params.chain — Chain. Can be `ethereum`, `polygon`, `bsc`, `solana`, `avalanche`, `arbitrum`, `optimism`, or `base`.
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (accepted for API consistency but currently ignored) (default: 0) @min 0
 * @returns {Promise<{{data: Array<TokenHolderItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchTokenHolders(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['address'] = String(params.address)
  qs['chain'] = String(params.chain)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`token/holders`, qs)
}

/**
 * Get token unlock time-series — unlock events with amounts and allocation breakdowns. Lookup by project UUID (`id`) or token `symbol`. Filter by date range with `from`/`to`. Defaults to the current calendar month when omitted. Returns 404 if no token found.
 * @param {Object} params
 * @param {string} [params.id] — Surf project UUID. PREFERRED — always use this when available from a previous response. Takes priority over symbol.
 * @param {string} [params.symbol] — Token symbol like `ARB`, `OP`, or `APT`
 * @param {string} [params.from] — Start of time range. Accepts Unix seconds (`1704067200`) or date string (`2024-01-01`)
 * @param {string} [params.to] — End of time range. Accepts Unix seconds (`1735689600`) or date string (`2025-01-01`)
 * @returns {Promise<{{data: Array<TokenUnlockPoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchTokenTokenomics(params) {
  const qs = {}
  if (params?.id !== undefined) qs['id'] = String(params.id)
  if (params?.symbol !== undefined) qs['symbol'] = String(params.symbol)
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  return proxyGet(`token/tokenomics`, qs)
}

/**
 * Get recent transfer events **for a specific token** (ERC-20/TRC-20 contract). Pass the **token contract address** in `address` — returns every on-chain transfer of that token regardless of sender/receiver. Each record includes sender, receiver, raw amount, and block timestamp.

Use this to analyze a token's on-chain activity (e.g. large movements, distribution patterns).

Lookup: `address` (token contract) + `chain`. Sort by `asc` or `desc`.
Data refresh: ~24 hours · Chain: Ethereum, Base, TRON (Solana uses a different source with no delay)
 * @param {Object} params
 * @param {string} params.address — Token contract address (0x-prefixed hex or Solana base58)
 * @param {('ethereum'|'base'|'solana'|'tron')} params.chain — Chain. Can be `ethereum`, `base`, `solana`, or `tron`.
 * @param {string} [params.from] — Start of date range. Accepts Unix seconds or YYYY-MM-DD. Defaults to 30 days ago.
 * @param {string} [params.to] — End of date range. Accepts Unix seconds or YYYY-MM-DD. Defaults to today.
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<TokenTransferItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchTokenTransfers(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['address'] = String(params.address)
  qs['chain'] = String(params.chain)
  if (params?.from !== undefined) qs['from'] = String(params.from)
  if (params?.to !== undefined) qs['to'] = String(params.to)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`token/transfers`, qs)
}

module.exports = {
  fetchTokenDexTrades,
  fetchTokenHolders,
  fetchTokenTokenomics,
  fetchTokenTransfers,
}
