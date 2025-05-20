export interface Block {
  id: string         // Хеш блока (primary key)
  hash: string       // Хеш блока
  timestamp: string  // Время создания в строковом формате
  number?: string    // Номер блока (опционально для фронтенда)
  validator?: string // Адрес валидатора (опционально для фронтенда)
  status?: string    // Статус блока (опционально для фронтенда)
  size?: number      // Размер блока (опционально для фронтенда)
}

export interface BlocksState {
  visibleBlocks: Block[]
  newId: string | null
  loading: boolean
  error: Error | null
} 