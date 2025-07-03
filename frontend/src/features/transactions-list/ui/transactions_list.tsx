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

    const currentTopTxId = visibleTxs[0]?.id
    const newTopTxId = data.transaction[0]?.id
    
    setVisibleTxs(data.transaction)
    
    if (newTopTxId && newTopTxId !== currentTopTxId) {
      const now = Date.now()
      if (now - lastAnimationTime.current >= 3000) {
        setAnimateTopTx(true)
        lastAnimationTime.current = now
        
        setTimeout(() => setAnimateTopTx(false), 1500)
      }
    }
    // eslint-disable-next-line
  }, [data])

  if (loading) return <div>Transactions loading...</div>
  if (error) return <div>Error loading: {error.message}</div>

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