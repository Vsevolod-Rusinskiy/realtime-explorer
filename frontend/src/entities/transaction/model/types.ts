export interface Transaction {
  id: string
  from_id: string | null
  to_id: string | null
  amount: string
  status: string
  timestamp: string
  block_id: string
}

export interface TransactionsState {
  visibleTxs: Transaction[]
  newId: string | null
  loading: boolean
  error: Error | null
} 