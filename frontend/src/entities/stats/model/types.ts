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