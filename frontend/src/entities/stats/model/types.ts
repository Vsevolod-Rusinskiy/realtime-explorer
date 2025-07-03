export interface StatsData {
  blocksPerSecond: number
  tps: number
  totalBlocks?: string
  totalTransactions?: string
  totalAccounts?: string
  averageBlockTime?: number
  lastBlock?: number
}

export interface StatsState {
  data: StatsData
  changedFields: string[]
  loading: boolean
  error: Error | null
}

export interface DatabaseStats {
  id: string
  total_blocks: string
  total_transactions: string
  total_transfers: string
  total_events: string
  total_extrinsics: string
  total_accounts: string
  last_updated: string
}

export interface CalculatedStats {
  blocksPerSecond: number
  transactionsPerSecond: number
  totalBlocks: number
  totalTransactions: number
  totalAccounts: number
  lastUpdated: Date
} 