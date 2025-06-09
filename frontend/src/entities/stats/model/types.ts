export interface StatsData {
  blocksPerSecond: number   // Блоков в секунду
  tps: number               // Транзакций в секунду
  totalBlocks?: string      // Всего блоков (опционально)
  totalTransactions?: string // Всего транзакций (опционально)
  totalAccounts?: string    // Всего аккаунтов (опционально)
  averageBlockTime?: number // Среднее время блока (опционально)
  lastBlock?: number        // Последний блок (опционально)
}

export interface StatsState {
  data: StatsData
  changedFields: string[]
  loading: boolean
  error: Error | null
}

// Новые типы для реальной статистики из БД (snake_case как в БД)
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