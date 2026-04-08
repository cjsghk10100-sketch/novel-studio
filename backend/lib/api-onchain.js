/**
 * Onchain API — auto-generated from hermod OpenAPI spec.
 * Generated at: 2026-03-26T15:40:45Z
 * CommonJS module. Usage: const { fetchXxx } = require('./api-onchain')
 */

'use strict'

const { proxyGet, proxyPost } = require('./api')

/**
 * @typedef {Object} BridgeRankingItem
 * @property {string} project — Bridge protocol name
 * @property {number} tx_count — Total number of bridge transfers
 * @property {number} volume_usd — Total USD volume in the time range
 */

/**
 * @typedef {Object} OnchainGasPriceItem
 * @property {string} chain — Canonical chain name
 * @property {string} gas_price — Gas price in wei
 * @property {number} gas_price_gwei — Gas price in Gwei
 */

/**
 * @typedef {Object} OnchainSchemaTable
 * @property {Array<OnchainSchemaCol>|null} columns — List of columns in this table
 * @property {string} database — Database name (always `agent`)
 * @property {string} table — Table name
 */

/**
 * @typedef {Object} OnchainTxItem
 * @property {Array<AccessListEntry>|null} accessList — List of addresses and storage keys. Empty array for legacy; populated for EIP-2930+
 * @property {Array<string>|null} [blobVersionedHashes] — Versioned hashes of blob commitments. EIP-4844 only
 * @property {?string} blockHash — Block hash, null if pending
 * @property {?string} blockNumber — Block number (hex), null if pending
 * @property {string} [chainId] — Chain ID (hex)
 * @property {string} from — Sender address (0x-prefixed)
 * @property {string} gas — Gas limit (hex)
 * @property {string} [gasPrice] — Gas price in wei (hex). Present in all types; for EIP-1559 this is the effective gas price
 * @property {string} hash — Transaction hash (0x-prefixed)
 * @property {string} input — Call data (hex)
 * @property {string} [maxFeePerBlobGas] — Max fee per blob gas in wei (hex). EIP-4844 only
 * @property {string} [maxFeePerGas] — Max fee per gas in wei (hex). EIP-1559/EIP-4844 only
 * @property {string} [maxPriorityFeePerGas] — Max priority fee per gas in wei (hex). EIP-1559/EIP-4844 only
 * @property {string} nonce — Sender nonce (hex)
 * @property {string} r — Signature R (hex)
 * @property {string} s — Signature S (hex)
 * @property {?string} to — Recipient address, null for contract creation
 * @property {?string} transactionIndex — Index in block (hex), null if pending
 * @property {string} type — Transaction type: 0x0=legacy, 0x1=EIP-2930, 0x2=EIP-1559, 0x3=EIP-4844
 * @property {string} v — Signature V (hex). Legacy: recovery ID (0x1b/0x1c); EIP-2930+: parity (0x0/0x1)
 * @property {string} value — ETH value in wei (hex)
 * @property {string} [yParity] — Signature Y parity (hex). Present in EIP-2930+ transactions
 */

/**
 * @typedef {Object} StructuredFilter
 * @property {string} field — Column name to filter on like `block_number` or `from_address`
 * @property {string} op — Comparison operator: eq, neq, gt, gte, lt, lte, like, in, not_in. For `in`/`not_in`, value must be a JSON array
 * @property {*} value — Comparison value. Use a JSON array for `in`/`not_in` operators like `[21000000, 21000001]`
 */

/**
 * @typedef {Object} StructuredSort
 * @property {string} field — Column name to sort by like `gas`, `block_number`, or `amount_usd`
 * @property {string} [order] — Sort direction: asc (default) or desc
 */

/**
 * @typedef {Object} YieldRankingItem
 * @property {number} apy — Total APY (base + reward)
 * @property {number} apy_base — Base APY from pool fees or interest
 * @property {number} apy_reward — Reward token APY
 * @property {string} pool_address — Pool or vault contract address
 * @property {string} project — Protocol name
 * @property {string} symbol — Token symbol
 * @property {string} token_address — Underlying token address
 * @property {number} tvl_usd — Pool TVL in USD
 * @property {string} version — Protocol version
 */


/**
 * List bridge protocols ranked by total USD volume over a time range.
 * @param {Object} params
 * @param {('7d'|'30d'|'90d'|'180d'|'1y'|'all')} [params.time_range] — Aggregation window (default: 30d)
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<BridgeRankingItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchOnchainBridgeRanking(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
  qs['time_range'] = String(params?.time_range ?? '30d')
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`onchain/bridge/ranking`, qs)
}

/**
 * Get the current gas price for an EVM chain via `eth_gasPrice` JSON-RPC. Returns gas price in both wei (raw) and Gwei (human-readable).

**Supported chains:** `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`, `linea`, `cyber`.
 * @param {Object} params
 * @param {('ethereum'|'polygon'|'bsc'|'arbitrum'|'optimism'|'base'|'avalanche'|'fantom'|'linea'|'cyber')} params.chain — Chain. Can be `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`, `linea`, or `cyber`.
 * @returns {Promise<{{data: OnchainGasPriceItem, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchOnchainGasPrice(params) {
  const qs = {}
  qs['chain'] = String(params.chain)
  return proxyGet(`onchain/gas-price`, qs)
}

/**
 * Execute a structured JSON query on blockchain data. No raw SQL needed — specify source, fields, filters, sort, and pagination.

All tables live in the **agent** database. Use `GET /v1/onchain/schema` to discover available tables and their columns.

- Source format: `agent.<table_name>` like `agent.ethereum_transactions` or `agent.ethereum_dex_trades`
- Max 10,000 rows (default 20), 30s timeout.
- **Always filter on block_date** — it is the partition key. Without it, queries scan billions of rows and will timeout.
- **Data refresh:** ~24 hours.

## Example

```json
{
  "source": "agent.ethereum_dex_trades",
  "fields": ["block_time", "project", "token_pair", "amount_usd", "taker"],
  "filters": [
    {"field": "block_date", "op": "gte", "value": "2025-03-01"},
    {"field": "project", "op": "eq", "value": "uniswap"},
    {"field": "amount_usd", "op": "gte", "value": 100000}
  ],
  "sort": [{"field": "amount_usd", "order": "desc"}],
  "limit": 20
}
```
 * @param {Object} params
 * @param {Array<string>|null} [params.fields] — Columns to return. Omit to return all columns. Example for agent.ethereum_transactions: [`transaction_hash`, `from_address`, `value`]
 * @param {Array<StructuredFilter>|null} [params.filters] — WHERE conditions (ANDed together)
 * @param {number} [params.limit] — Max rows to return. Default 20, max 10000
 * @param {number} [params.offset] — Rows to skip for pagination. Default 0
 * @param {Array<StructuredSort>|null} [params.sort] — ORDER BY clauses
 * @param {string} params.source — Fully-qualified table name like `agent.my_table`
 * @returns {Promise<Object>}
 */
async function fetchOnchainQuery(params) {
  return proxyPost(`onchain/query`, params)
}

/**
 * Get table metadata — database, table, column names, types, and comments for all available on-chain databases.
 * @returns {Promise<{{data: Array<OnchainSchemaTable>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchOnchainSchema() {
  return proxyGet(`onchain/schema`)
}

/**
 * Get transaction details by hash. All numeric fields are hex-encoded — use parseInt(hex, 16) to convert.

**Supported chains:** `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`, `linea`, `cyber`. Returns 404 if the transaction is not found.
 * @param {Object} params
 * @param {string} params.hash — Transaction hash (0x-prefixed hex)
 * @param {('ethereum'|'polygon'|'bsc'|'arbitrum'|'optimism'|'base'|'avalanche'|'fantom'|'linea'|'cyber')} params.chain — Chain. Can be `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`, `linea`, or `cyber`.
 * @returns {Promise<{{data: Array<OnchainTxItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchOnchainTx(params) {
  const qs = {}
  qs['hash'] = String(params.hash)
  qs['chain'] = String(params.chain)
  return proxyGet(`onchain/tx`, qs)
}

/**
 * List DeFi yield pools ranked by APY or TVL. Returns the latest snapshot. Filter by protocol.
 * @param {Object} params
 * @param {string} [params.project] — Filter by protocol name like `lido`, `aave`, or `uniswap`
 * @param {('apy'|'tvl_usd')} [params.sort_by] — Ranking metric: `apy` or `tvl_usd`. When sorted by `apy`, only pools with TVL >= $100k are included (default: apy)
 * @param {('asc'|'desc')} [params.order] — Sort direction (default: desc)
 * @param {number} [params.limit] — Results per page (default: 20) @min 1 @max 100
 * @param {number} [params.offset] — Pagination offset (default: 0) @min 0
 * @returns {Promise<{{data: Array<YieldRankingItem>, meta?: {{total?: number, limit?: number, offset?: number}}}}>}
 */
async function fetchOnchainYieldRanking(params) {
  if (params?.limit !== undefined) params.limit = Math.max(1, Math.min(100, params?.limit))
  if (params?.offset !== undefined) params.offset = Math.max(0, params?.offset)
  const qs = {}
  if (params?.project !== undefined) qs['project'] = String(params.project)
  qs['sort_by'] = String(params?.sort_by ?? 'apy')
  qs['order'] = String(params?.order ?? 'desc')
  qs['limit'] = String(params?.limit ?? 20)
  qs['offset'] = String(params?.offset ?? 0)
  return proxyGet(`onchain/yield/ranking`, qs)
}

module.exports = {
  fetchOnchainBridgeRanking,
  fetchOnchainGasPrice,
  fetchOnchainQuery,
  fetchOnchainSchema,
  fetchOnchainTx,
  fetchOnchainYieldRanking,
}
