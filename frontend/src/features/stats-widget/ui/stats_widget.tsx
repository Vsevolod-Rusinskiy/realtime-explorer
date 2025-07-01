'use client'

import { useSubscription } from '@apollo/client'
import { useEffect, useState, useRef } from 'react'
import { STATISTICS_SUBSCRIPTION, useBlockSpeed } from '@/shared/api'
import { StatCard } from '@/entities/stats'
import { DatabaseStats } from '@/entities/stats/model/types'
import styles from './styles.module.css'

export function StatsWidget() {
  // Подписка на реальную статистику из БД (для транзакций)
  const { data: statsData, loading, error } = useSubscription(STATISTICS_SUBSCRIPTION)
  
  // Новый хук для расчета скорости блоков
  const { blocksPerSecond, isChanged: isBlocksChanged, loading: blocksLoading } = useBlockSpeed()
  
  // State для хранения вычисленной статистики транзакций
  const [transactionsPerSecond, setTransactionsPerSecond] = useState(0)
  const [isTransactionsChanged, setIsTransactionsChanged] = useState(false)
  
  // Сохраняем предыдущие значения для расчета скорости транзакций
  const previousStats = useRef<DatabaseStats | null>(null)
  const previousTime = useRef<number>(Date.now())
  
  // Для контроля частоты анимации транзакций
  const lastAnimationTime = useRef<number>(0)

  // Функция для расчета скорости транзакций (старая логика)
  const calculateTransactionSpeed = (current: DatabaseStats, previous: DatabaseStats | null): number => {
    const now = Date.now()
    const timeDiff = (now - previousTime.current) / 1000 // в секундах
    
    if (!previous || timeDiff < 0.5) {
      return transactionsPerSecond // Возвращаем текущее значение
    }

    const txDiff = parseInt(current.total_transactions) - parseInt(previous.total_transactions)
    
    console.log('📊 Отладка расчета скорости транзакций:', {
      current_tx: current.total_transactions,
      previous_tx: previous.total_transactions,
      txDiff,
      timeDiff,
      currentTPS: transactionsPerSecond
    })

    if (txDiff > 0) {
      const newTPS = Math.round((txDiff / timeDiff) * 100) / 100
      console.log('🟢 Обновили транзакции/сек:', newTPS)
      
      // Обновляем время
      previousTime.current = now
      
      return Math.max(0, newTPS)
    }

    return transactionsPerSecond // Возвращаем текущее значение если нет изменений
  }

  // Обработка данных подписки для транзакций
  useEffect(() => {
    if (!statsData?.statistics || statsData.statistics.length === 0) return
    
    const currentDbStats: DatabaseStats = statsData.statistics[0]
    
    // Вычисляем новую скорость транзакций
    const newTPS = calculateTransactionSpeed(currentDbStats, previousStats.current)
    
    // Проверяем изменения для анимации
    if (newTPS !== transactionsPerSecond) {
      setTransactionsPerSecond(newTPS)
      
      // Анимация только раз в 4 секунды
      const now = Date.now()
      if ((now - lastAnimationTime.current) >= 4000) {
        setIsTransactionsChanged(true)
        lastAnimationTime.current = now
        
        setTimeout(() => {
          setIsTransactionsChanged(false)
        }, 4000)
      }
    }
    
    // Сохраняем текущие данные как предыдущие
    previousStats.current = currentDbStats
    
  }, [statsData, transactionsPerSecond])
  
  if ((loading || blocksLoading) && !statsData) {
    return <div className={styles.stats_container}>Statistics loading...</div>
  }
  
  if (error) {
    return <div className={styles.stats_container}>
      Error loading statistics: {error.message}
    </div>
  }
  
  return (
    <div className={styles.stats_container}>
      <StatCard 
        title="BLOCKS PER SECOND" 
        value={blocksPerSecond} 
        subtitle="network speed" 
        highlightText="speed"
        isChanged={isBlocksChanged}
      />
      
      {/* <StatCard 
        title="ТРАНЗАКЦИЙ В СЕКУНДУ" 
        value={transactionsPerSecond} 
        subtitle="TPS сети" 
        highlightText="TPS"
        isChanged={isTransactionsChanged}
      /> */}
    </div>
  )
} 