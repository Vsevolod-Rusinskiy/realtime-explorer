'use client'

import { TransactionsList as TransactionsListFeature } from '@/features/transactions-list'
import styles from './transactions_list.module.css'

export function TransactionsList() {
  return (
    <div className={styles.transactions_list_wrapper}>
      <h1 className={styles.title}>Transactions</h1>
      <TransactionsListFeature />
    </div>
  )
} 