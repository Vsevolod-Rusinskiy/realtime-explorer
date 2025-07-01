import { useSubscription } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { TRANSACTIONS_SUBSCRIPTION } from '@/shared/api'

interface Transaction {
  id: string
  timestamp: string
}

export function useTransactionSpeed() {
  const { data, loading, error } = useSubscription(TRANSACTIONS_SUBSCRIPTION)
  const [transactionsPerSecond, setTransactionsPerSecond] = useState(0)
  const [isChanged, setIsChanged] = useState(false)
  const speedHistory = useRef<number[]>([])
  const lastAnimationTime = useRef<number>(0)
  const previousTopTxId = useRef<string | null>(null)

  useEffect(() => {
    if (!data?.transaction || data.transaction.length < 2) return

    const transactions: Transaction[] = data.transaction
    const latestTx = transactions[0]
    const previousTx = transactions[1]

    // Проверяем, что это действительно новая транзакция
    if (previousTopTxId.current === latestTx.id) return

    const currentTxTime = new Date(latestTx.timestamp).getTime()
    const previousTxTime = new Date(previousTx.timestamp).getTime()
    const realTimeDiff = (currentTxTime - previousTxTime) / 1000 // в секундах

    if (realTimeDiff > 0) {
      const realTPS = 1 / realTimeDiff
      speedHistory.current.push(realTPS)
      if (speedHistory.current.length > 3) {
        speedHistory.current.shift()
      }
      const averageTPS = speedHistory.current.reduce((sum, s) => sum + s, 0) / speedHistory.current.length
      const roundedTPS = Math.round(averageTPS * 100) / 100
      if (Math.abs(roundedTPS - transactionsPerSecond) >= 0.01) {
        setTransactionsPerSecond(roundedTPS)
        const now = Date.now()
        if ((now - lastAnimationTime.current) >= 4000) {
          setIsChanged(true)
          lastAnimationTime.current = now
          setTimeout(() => setIsChanged(false), 4000)
        }
      }
      // Для отладки
      console.log('⚡️ Реальная скорость транзакций:', {
        currentTx: latestTx.id,
        previousTx: previousTx.id,
        realTimeDiff: realTimeDiff.toFixed(3) + 's',
        realTPS: realTPS.toFixed(3),
        averageTPS: roundedTPS,
        currentTimestamp: latestTx.timestamp,
        previousTimestamp: previousTx.timestamp
      })
      // Выводим последние 5 транзакций для анализа
      console.log('Последние 5 транзакций:', transactions.slice(0, 5).map(t => ({ id: t.id, timestamp: t.timestamp })))
    }
    previousTopTxId.current = latestTx.id
  }, [data, transactionsPerSecond])

  return {
    transactionsPerSecond,
    isChanged,
    loading,
    error
  }
} 