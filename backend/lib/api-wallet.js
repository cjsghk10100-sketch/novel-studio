/**
 * Wallet API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 * CommonJS module. Usage: const { fetchXxx } = require('./api-wallet')
 */

'use strict'

const { proxyGet, proxyPost } = require('./api')

/**
 * @typedef {Object} WalletDetailBody
 * @property {Array<WalletChainItem>|null} [active_chains] — Chains the wallet has non-zero balances on. Always present (not controlled by fields param). For Solana addresses, returns a single entry.
 * @property {Array<WalletApprovalItem>|null} [approvals] — Token approvals (EVM-only, up to 50). Only present when `approvals` is included in the `fields` param.
 * @property {Array<WalletDetailError>|null} [errors] — Per-field errors for any fields that failed to load
 * @property {EvmBalanceItem} [evm_balance] — EVM wallet balance. Populated for EVM chains only.
 * @property {Array<EvmTokenItem>|null} [evm_tokens] — EVM token holdings (up to 50). Populated for EVM chains only.
 * @property {WalletLabelItem} [labels] — Address labels and entity attribution
 * @property {Array<WalletNFTItem>|null} [nft] — NFT holdings (EVM-only, top 200 by value)
 * @property {SolBalanceItem} [sol_balance] — Solana wallet balance from Solscan. Populated for Solana chain only.
 * @property {Array<SolTokenItem>|null} [sol_tokens] — Solana SPL token holdings from Solscan (up to 50). Populated for Solana chain only.
 */

/**
 * @typedef {Object} WalletHistoryItem
 * @property {string} from_address — Sender wallet address
 * @property {number} timestamp — Unix timestamp in seconds when the transaction was confirmed
 * @property {string} to_address — Recipient wallet address
 * @property {string} tx_hash — Transaction hash
 * @property {string} [tx_type] — Transaction type: `send`, `receive`, `swap`, `approve`, etc.
 * @property {string} value — Decimal-adjusted transaction value in native token as a string
 */

/**
 * @typedef {Object} WalletLabelItem
 * @property {string} address — Wallet address
 * @property {string} [entity_name] — Name of the associated entity like `Binance` or `Aave`
 * @property {string} [entity_type] — Type of entity like `exchange`, `fund`, or `whale`
 * @property {Array<WalletLabelInfo>|null} labels — List of labels assigned to this address
 */

/**
 * @typedef {Object} WalletNetWorthPoint
 * @property {number} timestamp — Unix timestamp in seconds
 * @property {number} usd_value — Total portfolio value in USD at this point in time
 */

/**
 * @typedef {Object} WalletProtocolItem
 * @property {string} chain — Canonical chain name where the protocol operates
 * @property {string} [logo_url] — Protocol logo image URL
 * @property {Array<WalletProtocolPosition>|null} positions — Individual positions held in this protocol
 * @property {string} protocol_name — Human-readable protocol name
 * @property {string} [site_url] — Protocol website URL
 * @property {number} total_usd — Total USD value across all positions in this protocol
 */

/**
 * @typedef {Object} WalletTransferItem
 * @property {string} [activity_type] — Transfer activity type (Solana only, e.g. ACTIVITY_SPL_TRANSFER)
 * @property {string} amount — Decimal-adjusted transfer amount as a string
 * @property {number} [amount_usd] — Transfer value in USD at the time of the transaction
 * @property {string} [flow] — Transfer direction relative to the queried wallet: `in` or `out`
 * @property {string} from_address — Sender wallet address
 * @property {number} timestamp — Unix timestamp in seconds when the transfer occurred
 * @property {string} to_address — Recipient wallet address
 * @property {string} [token_address] — Token contract address (EVM) or SPL mint address (Solana)
 * @property {string} [token_symbol] — Token ticker symbol (available for EVM chains from on-chain data)
 * @property {string} tx_hash — Transaction hash (EVM) or transaction signature (Solana)
 */


/**
 * Get multiple wallet sub-resources in a single request. Lookup by `address`. Use `fields` to select: `balance`, `tokens`, `labels`, `nft`. Partial failures return available fields with per-field error info. Returns 422 if `fields` is invalid.
 * @param {Object} params
 * @param {string} params.address — Wallet address (0x hex for EVM, base58 for Solana)
 * @param {('ethereum'|'polygon'|'bsc'|'avalanche'|'arbitrum'|'optimism'|'fantom'|'base'|'solana')} [params.chain] — Chain filter for `tokens`, `nft`, and `approvals`. When omitted, inferred from address format: 0x addresses query all EVM chains, base58 addresses query Solana.
 * @param {string} [params.fields] — Comma-separated sub-resources to include. Valid: `balance`, `tokens`, `labels`, `nft`, `approvals`. The `active_chains` field is always returned. `approvals` is opt-in (not in default) as it triggers additional upstream calls. (default: balance,tokens,labels,nft)
 * @returns {Promise<{{data: WalletDetailBody, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchWalletDetail(params) {
  const qs = {}
  qs['address'] = String(params.address)
  if (params?.chain !== undefined) qs['chain'] = String(params.chain)
  qs['fields'] = String(params?.fields ?? 'balance,tokens,labels,nft')
  return proxyGet(`wallet/detail`, qs)
}

/**
 * Get full transaction history for a wallet — swaps, transfers, and contract interactions. Lookup by `address`. Filter by `chain` — supports `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `avalanche`, `fantom`, `base`.
 * @param {Object} params
 * @param {string} params.address — Wallet address — must be a raw 0x-prefixed hex address, not an ENS name
 * @param {('ethereum'|'polygon'|'bsc'|'avalanche'|'arbitrum'|'optimism'|'fantom'|'base')} [params.chain] — Chain filter. Can be `ethereum`, `polygon`, `bsc`, `avalanche`, `arbitrum`, `optimism`, `fantom`, or `base`. (default: ethereum)
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @param {('timestamp'|'value')} [params.sort_by] — Field to sort results by (default: timestamp)
 * @param {('asc'|'desc')} [params.order] — Sort order (default: desc)
 * @returns {Promise<{{data: Array<WalletHistoryItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchWalletHistory(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['address'] = String(params.address)
  qs['chain'] = String(params?.chain ?? 'ethereum')
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  qs['sort_by'] = String(params?.sort_by ?? 'timestamp')
  qs['order'] = String(params?.order ?? 'desc')
  return proxyGet(`wallet/history`, qs)
}

/**
 * Get entity labels for multiple wallet addresses. Pass up to 100 comma-separated addresses via the `addresses` query parameter. Returns entity name, type, and labels per address.
 * @param {Object} params
 * @param {string} params.addresses — Comma-separated wallet addresses to look up, max 100
 * @returns {Promise<{{data: Array<WalletLabelItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchWalletLabelsBatch(params) {
  const qs = {}
  qs['addresses'] = String(params.addresses)
  return proxyGet(`wallet/labels/batch`, qs)
}

/**
 * Get a time-series of the wallet's total net worth in USD. Returns ~288 data points at 5-minute intervals covering the last 24 hours. Fixed window — no custom time range supported.
 * @param {Object} params
 * @param {string} params.address — Wallet address (0x hex, base58, or ENS name like `vitalik.eth`)
 * @returns {Promise<{{data: Array<WalletNetWorthPoint>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchWalletNetWorth(params) {
  const qs = {}
  qs['address'] = String(params.address)
  return proxyGet(`wallet/net-worth`, qs)
}

/**
 * Get all DeFi protocol positions for a wallet — lending, staking, LP, and farming with token breakdowns and USD values. Lookup by `address`.
 * @param {Object} params
 * @param {string} params.address — Wallet address — must be a raw 0x-prefixed hex address, not an ENS name
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<WalletProtocolItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchWalletProtocols(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['address'] = String(params.address)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`wallet/protocols`, qs)
}

/**
 * Get recent token transfers **sent or received by a wallet**. Pass the **wallet address** in `address` — returns all ERC-20/SPL token transfers where this wallet is the sender or receiver. Each record includes token contract, counterparty, raw amount, and block timestamp.

Use this to audit a wallet's token flow (e.g. inflows, outflows, airdrop receipts).

Lookup: `address` (wallet, raw 0x hex or base58 — ENS not supported). Filter by `chain` — supports `ethereum`, `base`, `solana`.
Data refresh: ~24 hours · Chain: Ethereum, Base (Solana uses a different source with no delay)
 * @param {Object} params
 * @param {string} params.address — Wallet address — must be a raw address (0x-prefixed hex for EVM, base58 for Solana). ENS names like `vitalik.eth` are not supported; resolve to a 0x address first.
 * @param {('ethereum'|'base'|'solana')} [params.chain] — Chain. Can be `ethereum`, `base`, or `solana`. (default: ethereum)
 * @param {('in'|'out')} [params.flow] — Filter by transfer direction relative to the queried wallet. `in` for incoming, `out` for outgoing. Omit for both directions.
 * @param {string} [params.token] — Filter by token contract address. Use `0x0000000000000000000000000000000000000000` for native token transfers. Omit for all tokens.
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<WalletTransferItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchWalletTransfers(params) {
  if (params.limit !== undefined) params.limit = Math.max(1, Math.min(100, params.limit))
  if (params.offset !== undefined) params.offset = Math.max(0, params.offset)
  const qs = {}
  qs['address'] = String(params.address)
  qs['chain'] = String(params?.chain ?? 'ethereum')
  if (params?.flow !== undefined) qs['flow'] = String(params.flow)
  if (params?.token !== undefined) qs['token'] = String(params.token)
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`wallet/transfers`, qs)
}

module.exports = {
  fetchWalletDetail,
  fetchWalletHistory,
  fetchWalletLabelsBatch,
  fetchWalletNetWorth,
  fetchWalletProtocols,
  fetchWalletTransfers,
}
