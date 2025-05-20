'use client'

import { useSubscription } from '@apollo/client'
import { useEffect, useState } from 'react'
import { RECENT_BLOCKS_SUBSCRIPTION } from '@/shared/api'
import { StatCard } from '@/entities/stats'
import styles from './styles.module.css'

export function StatsWidget() {
  // Используем только одну подписку на последние блоки
  const { data: recentBlocksData, loading: recentBlocksLoading, error: recentBlocksError } = 
    useSubscription(RECENT_BLOCKS_SUBSCRIPTION)
  
  // State для хранения статистики
  const [stats, setStats] = useState({
    blocksPerSecond: 0,
    tps: 0
  })
  
  // Для отслеживания изменений и анимации
  const [changedFields, setChangedFields] = useState<string[]>([])
  
  // Обработка данных подписки на последние блоки
  useEffect(() => {
    if (!recentBlocksData?.block || recentBlocksData.block.length < 2) return
    
    const blocks = recentBlocksData.block
    const newest = new Date(blocks[0].timestamp).getTime()
    const oldest = new Date(blocks[blocks.length-1].timestamp).getTime()
    const timeSpanSeconds = (newest - oldest) / 1000 || 1 // Время в секундах между блоками
    
    // Количество блоков в секунду
    const blocksPerSecond = Math.round((blocks.length / timeSpanSeconds) * 100) / 100
    
    if (blocksPerSecond !== stats.blocksPerSecond) {
      // Расчет TPS на основе блоков в секунду
      // Примерно один блок содержит примерно одну транзакцию
      const tps = Math.round(blocksPerSecond * 100) / 10
      
      setStats({
        blocksPerSecond,
        tps
      })
      
      setChangedFields(prev => [...prev, 'blocksPerSecond', 'tps'])
      setTimeout(() => {
        setChangedFields(prev => 
          prev.filter(field => field !== 'blocksPerSecond' && field !== 'tps')
        )
      }, 1500)
    }
  }, [recentBlocksData, stats.blocksPerSecond])
  
  const loading = recentBlocksLoading
  const error = recentBlocksError
  
  if (loading && !recentBlocksData) {
    return <div className={styles.stats_container}>Загрузка статистики...</div>
  }
  
  if (error) {
    return <div className={styles.stats_container}>
      Ошибка: {recentBlocksError?.message}
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
        value={stats.tps} 
        subtitle="средняя TPS" 
        highlightText="TPS"
        isChanged={changedFields.includes('tps')}
      />
    </div>
  )
} 