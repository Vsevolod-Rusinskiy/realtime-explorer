'use client'

import { useSubscription, gql } from '@apollo/client'
import { useEffect, useState, useRef } from 'react'
import styles from './stats_widget.module.css'

// Подписка только на последние блоки для расчета скорости
const RECENT_BLOCKS_SUBSCRIPTION = gql`
  subscription RecentBlocks {
    block(order_by: {timestamp: desc}, limit: 10) {
      timestamp
    }
  }
`

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
  const prevStats = useRef({...stats})
  
  // Больше не используем отдельные подписки на количество блоков и транзакций
  
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
      <div className={changedFields.includes('blocksPerSecond') ? `${styles.stat_card} ${styles.fade_in}` : styles.stat_card}>
        <div className={styles.stat_title}>БЛОКОВ В СЕКУНДУ</div>
        <div className={styles.stat_value}>{stats.blocksPerSecond.toLocaleString()}</div>
        <div className={styles.stat_subtitle}>
          <span className={styles.stat_highlight}>real-time</span> скорость сети
        </div>
      </div>
      
      <div className={changedFields.includes('tps') ? `${styles.stat_card} ${styles.fade_in}` : styles.stat_card}>
        <div className={styles.stat_title}>ТРАНЗАКЦИЙ В СЕКУНДУ</div>
        <div className={styles.stat_value}>{stats.tps.toLocaleString()}</div>
        <div className={styles.stat_subtitle}>
          средняя <span className={styles.stat_highlight}>TPS</span>
        </div>
      </div>
    </div>
  )
} 