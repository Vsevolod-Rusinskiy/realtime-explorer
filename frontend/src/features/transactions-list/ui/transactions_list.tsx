'use client'

import { useSubscription } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { TRANSACTIONS_SUBSCRIPTION } from '@/shared/api/model/transactions'
import { Transaction, TransactionCard } from '@/entities/transaction'
import styles from './styles.module.css'

export function TransactionsList() {
  const { data, loading, error } = useSubscription(TRANSACTIONS_SUBSCRIPTION)
  const [visibleTxs, setVisibleTxs] = useState<Transaction[]>([])
  const [newId, setNewId] = useState<string | null>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (!data?.transaction) return
    if (firstRender.current) {
      setVisibleTxs(data.transaction)
      setNewId(null)
      firstRender.current = false
      return
    }
    const currentIds = visibleTxs.map(t => t.id)
    const newTx = data.transaction.find((t: Transaction) => !currentIds.includes(t.id))
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

  if (loading) return <div>Загрузка транзакций...</div>
  if (error) return <div>Ошибка загрузки: {error.message}</div>

  return (
    <div className={styles.transactions_list_container}>
      {visibleTxs.map((tx: Transaction) => (
        <TransactionCard
          key={tx.id}
          transaction={tx}
          isNew={newId === tx.id}
        />
      ))}
    </div>
  )
} 