export interface StatsData {
  blocksPerSecond: number
  tps: number
}

export interface StatsState {
  data: StatsData
  changedFields: string[]
  loading: boolean
  error: Error | null
} 