'use client'

import { Block } from '../../model/types'
import styles from './styles.module.css'

interface BlockCardProps {
  block: Block
  isNew: boolean
}

export function BlockCard({ block, isNew }: BlockCardProps) {
  // Функция для сокращенного отображения ID и хеша
  const shortStr = (str: string) => {
    if (!str) return '—'
    if (str.length <= 40) return str
    return `${str.substring(0, 20)}...${str.substring(str.length - 20)}`
  }

  return (
    <div className={styles.block_card + (isNew ? ' ' + styles.fade_in : '')}>
      {block.number && (
        <div className={styles.block_number}>
          Block #{block.number}
        </div>
      )}
      <div className={styles.block_id}>
        ID: <span title={block.id}>{shortStr(block.id)}</span>
      </div>
      <div className={styles.block_hash}>
        Hash: <span title={block.hash}>{shortStr(block.hash)}</span>
      </div>
      <div className={styles.block_time}>{new Date(block.timestamp).toLocaleString()}</div>
    </div>
  )
} 