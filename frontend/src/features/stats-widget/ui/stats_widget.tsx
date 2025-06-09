'use client'

import { useSubscription } from '@apollo/client'
import { useEffect, useState, useRef } from 'react'
import { STATISTICS_SUBSCRIPTION } from '@/shared/api'
import { StatCard } from '@/entities/stats'
import { DatabaseStats, CalculatedStats } from '@/entities/stats/model/types'
import styles from './styles.module.css'

export function StatsWidget() {
  // Подписка на реальную статистику из БД
  const { data: statsData, loading, error } = useSubscription(STATISTICS_SUBSCRIPTION)
  
  // State для хранения вычисленной статистики
  const [stats, setStats] = useState<CalculatedStats>({
    blocksPerSecond: 0,
    transactionsPerSecond: 0,
    totalBlocks: 0,
    totalTransactions: 0,
    totalAccounts: 0,
    lastUpdated: new Date()
  })
  
  // Для отслеживания изменений и анимации
  const [changedFields, setChangedFields] = useState<string[]>([])
  
  // Сохраняем предыдущие значения для расчета скорости
  const previousStats = useRef<DatabaseStats | null>(null)
  const previousTime = useRef<number>(Date.now())
  
  // Для контроля частоты анимации
  const lastAnimationTime = useRef<number>(0)

  // Функция для расчета реальной скорости
  const calculateSpeed = (current: DatabaseStats, previous: DatabaseStats | null, currentStats: CalculatedStats): CalculatedStats => {
    const now = Date.now()
    const timeDiff = (now - previousTime.current) / 1000 // в секундах
    
    if (!previous) {
      // Если нет предыдущих данных - просто обновляем общие данные, скорость оставляем текущую
      return {
        blocksPerSecond: currentStats.blocksPerSecond,
        transactionsPerSecond: currentStats.transactionsPerSecond,
        totalBlocks: parseInt(current.total_blocks) || 0,
        totalTransactions: parseInt(current.total_transactions) || 0,
        totalAccounts: parseInt(current.total_accounts) || 0,
        lastUpdated: new Date(current.last_updated)
      }
    }

    // Реальные расчеты на основе изменений в БД
    const blocksDiff = parseInt(current.total_blocks) - parseInt(previous.total_blocks)
    const txDiff = parseInt(current.total_transactions) - parseInt(previous.total_transactions)
    
    let blocksPerSecond = currentStats.blocksPerSecond
    let transactionsPerSecond = currentStats.transactionsPerSecond
    
    // Обновляем скорость только если прошло достаточно времени и есть изменения
    if (timeDiff >= 0.5) { // минимум 0.5 секунды
      if (blocksDiff > 0) {
        blocksPerSecond = Math.round((blocksDiff / timeDiff) * 100) / 100
      }
      if (txDiff > 0) {
        transactionsPerSecond = Math.round((txDiff / timeDiff) * 100) / 100
      }
      
      // Обновляем время только если пересчитывали скорость
      previousTime.current = now
    }

    return {
      blocksPerSecond: Math.max(0, blocksPerSecond),
      transactionsPerSecond: Math.max(0, transactionsPerSecond),
      totalBlocks: parseInt(current.total_blocks) || 0,
      totalTransactions: parseInt(current.total_transactions) || 0,
      totalAccounts: parseInt(current.total_accounts) || 0,
      lastUpdated: new Date(current.last_updated)
    }
  }

  // Обработка данных подписки
  useEffect(() => {
    if (!statsData?.statistics || statsData.statistics.length === 0) return
    
    const currentDbStats: DatabaseStats = statsData.statistics[0]
    
    // Вычисляем новую статистику
    const newStats = calculateSpeed(currentDbStats, previousStats.current, stats)
    
    // Проверяем какие поля изменились для анимации
    const changedFieldsList: string[] = []
    if (newStats.blocksPerSecond !== stats.blocksPerSecond) {
      changedFieldsList.push('blocksPerSecond')
    }
    if (newStats.transactionsPerSecond !== stats.transactionsPerSecond) {
      changedFieldsList.push('transactionsPerSecond')
    }
    
    // Обновляем состояние
    setStats(newStats)
    
    // Анимация только раз в 4 секунды
    const now = Date.now()
    if (changedFieldsList.length > 0 && (now - lastAnimationTime.current) >= 4000) {
      setChangedFields(changedFieldsList)
      lastAnimationTime.current = now
      
      // Убираем анимацию через 4 секунды
      setTimeout(() => {
        setChangedFields([])
      }, 4000)
    }
    
    // Сохраняем текущие данные как предыдущие
    previousStats.current = currentDbStats
    
  }, [statsData])
  
  if (loading && !statsData) {
    return <div className={styles.stats_container}>Загрузка статистики...</div>
  }
  
  if (error) {
    return <div className={styles.stats_container}>
      Ошибка загрузки статистики: {error.message}
    </div>
  }
  
  return (
    <div className={styles.stats_container}>
      <StatCard 
        title="БЛОКОВ В СЕКУНДУ" 
        value={stats.blocksPerSecond} 
        subtitle="real-time скорость сети" 
        highlightText="real-time"
        isChanged={changedFields.includes('blocksPerSecond')}
      />
      
      <StatCard 
        title="ТРАНЗАКЦИЙ В СЕКУНДУ" 
        value={stats.transactionsPerSecond} 
        subtitle="реальный TPS" 
        highlightText="TPS"
        isChanged={changedFields.includes('transactionsPerSecond')}
      />
    </div>
  )
} 