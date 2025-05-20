export interface Block {
  id: string
  hash: string
  timestamp: string
}

export interface BlocksState {
  visibleBlocks: Block[]
  newId: string | null
  loading: boolean
  error: Error | null
} 