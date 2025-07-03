export interface Block {
  id: string
  hash: string
  timestamp: string
  number?: string
  validator?: string
  status?: string
  size?: number
}

export interface BlocksState {
  visibleBlocks: Block[]
  newId: string | null
  loading: boolean
  error: Error | null
} 