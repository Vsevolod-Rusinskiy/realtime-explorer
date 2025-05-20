'use client'

import { useSubscription, gql } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import styles from './transactions_list.module.css'

const TRANSACTIONS_SUBSCRIPTION = gql`
  subscription Transactions {
    transaction(order_by: {timestamp: desc}, limit: 30) {
      id
      from_id
      to_id
      amount
      status
      timestamp
      block_id
    }
  }
`

export function TransactionsList() {
  console.log('[TransactionsList] render start')
  const { data, loading, error } = useSubscription(TRANSACTIONS_SUBSCRIPTION)
  const [visibleTxs, setVisibleTxs] = useState<any[]>([])
  const [newId, setNewId] = useState<string | null>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    console.log('[TransactionsList] useEffect', { data, loading, error })
    if (!data?.transaction) return
    if (firstRender.current) {
      setVisibleTxs(data.transaction)
      setNewId(null)
      firstRender.current = false
      return
    }
    const currentIds = visibleTxs.map(t => t.id)
    const newTx = data.transaction.find((t: any) => !currentIds.includes(t.id))
    if (newTx) {
      setVisibleTxs(data.transaction)
      setNewId(newTx.id)
      // Через 1500мс убираем эффект подсветки рамки (соответствует длительности анимации)
      setTimeout(() => setNewId(null), 1500)
    } else {
      setVisibleTxs(data.transaction)
      setNewId(null)
    }
    // eslint-disable-next-line
  }, [data])

  console.log('[TransactionsList] before return', { data, loading, error, visibleTxs, newId })

  if (loading) return <div>Загрузка транзакций...</div>
  if (error) return <div>Ошибка загрузки: {error.message}</div>

  return (
    <div className={styles.transactions_list_container}>
      {visibleTxs.map((tx: any) => {
        const isNew = newId === tx.id
        return (
          <div
            key={tx.id}
            className={styles.transaction_card + (isNew ? ' ' + styles.fade_in : '')}
          >
            <div className={styles.transaction_id}>ID: {tx.id}</div>
            <div className={styles.transaction_from_to}>
              from: {tx.from_id || '—'}<br />to: {tx.to_id || '—'}
            </div>
            <div className={styles.transaction_from_to}>
              amount: {tx.amount} | status: {tx.status}
            </div>
            <div className={styles.transaction_time}>{new Date(tx.timestamp).toLocaleString()}</div>
          </div>
        )
      })}
    </div>
  )
} 