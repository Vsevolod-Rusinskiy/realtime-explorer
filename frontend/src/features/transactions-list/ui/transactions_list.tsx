'use client'

import { useSubscription } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { TRANSACTIONS_SUBSCRIPTION } from '@/shared/api'
import { Transaction, TransactionCard } from '@/entities/transaction'
import styles from './styles.module.css'

export function TransactionsList() {
  const { data, loading, error } = useSubscription(TRANSACTIONS_SUBSCRIPTION)
  const [visibleTxs, setVisibleTxs] = useState<Transaction[]>([])
  const [animateTopTx, setAnimateTopTx] = useState(false)
  const firstRender = useRef(true)
  const lastAnimationTime = useRef(Date.now())

  useEffect(() => {
    if (!data?.transaction) return
    
    if (firstRender.current) {
      setVisibleTxs(data.transaction)
      firstRender.current = false
      return
    }

    // Обновляем транзакции в реальном времени
    const currentTopTxId = visibleTxs[0]?.id
    const newTopTxId = data.transaction[0]?.id
    
    setVisibleTxs(data.transaction)
    
    // Если изменилась верхняя транзакция И прошло 3 секунды - анимируем
    if (newTopTxId && newTopTxId !== currentTopTxId) {
      const now = Date.now()
      if (now - lastAnimationTime.current >= 3000) { // 3 секунды
        setAnimateTopTx(true)
        lastAnimationTime.current = now
        
        // Убираем анимацию через 1.5 секунды
        setTimeout(() => setAnimateTopTx(false), 1500)
      }
    }
    // eslint-disable-next-line
  }, [data])

  if (loading) return <div>Загрузка транзакций...</div>
  if (error) return <div>Ошибка загрузки: {error.message}</div>

  return (
    <div className={styles.transactions_list_container}>
      {visibleTxs.map((tx: Transaction, index: number) => (
        <TransactionCard
          key={tx.id}
          transaction={tx}
          isNew={index === 0 && animateTopTx}
        />
      ))}
    </div>
  )
} 