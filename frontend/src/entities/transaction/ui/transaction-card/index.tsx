'use client'

import { Transaction } from '../../model/types'
import styles from './styles.module.css'

interface TransactionCardProps {
  transaction: Transaction
  isNew: boolean
}

export function TransactionCard({ transaction, isNew }: TransactionCardProps) {
  // Функция для сокращенного отображения ID
  const shortId = (id: string) => {
    if (!id) return '—'
    if (id.length <= 40) return id
    return `${id.substring(0, 20)}...${id.substring(id.length - 20)}`
  }

  return (
    <div className={styles.transaction_card + (isNew ? ' ' + styles.fade_in : '')}>
      <div className={styles.transaction_id}>
        ID: <span title={transaction.id}>{shortId(transaction.id)}</span>
      </div>
      <div className={styles.transaction_from_to}>
        from: {shortId(transaction.from_id || '')}<br />
        to: {shortId(transaction.to_id || '')}
      </div>
      <div className={styles.transaction_from_to}>
        amount: {transaction.amount} | status: {transaction.status}
      </div>
      <div className={styles.transaction_time}>{new Date(transaction.timestamp).toLocaleString()}</div>
    </div>
  )
} 