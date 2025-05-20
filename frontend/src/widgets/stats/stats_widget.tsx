'use client'

import { useSubscription, gql } from '@apollo/client'
import { useEffect, useState, useRef } from 'react'
import styles from './stats_widget.module.css'

// Разделяем на отдельные подписки
const BLOCKS_COUNT_SUBSCRIPTION = gql`
  subscription BlocksCount {
    block_aggregate {
      aggregate {
        count
      }
    }
  }
`

const TRANSACTIONS_COUNT_SUBSCRIPTION = gql`
  subscription TransactionsCount {
    transaction_aggregate {
      aggregate {
        count
      }
    }
  }
`

const RECENT_BLOCKS_SUBSCRIPTION = gql`
  subscription RecentBlocks {
    block(order_by: {timestamp: desc}, limit: 10) {
      timestamp
    }
  }
`

export function StatsWidget() {
  // Используем отдельные подписки
  const { data: blocksCountData, loading: blocksCountLoading, error: blocksCountError } = 
    useSubscription(BLOCKS_COUNT_SUBSCRIPTION)
  
  const { data: txCountData, loading: txCountLoading, error: txCountError } = 
    useSubscription(TRANSACTIONS_COUNT_SUBSCRIPTION)
  
  const { data: recentBlocksData, loading: recentBlocksLoading, error: recentBlocksError } = 
    useSubscription(RECENT_BLOCKS_SUBSCRIPTION)
  
  // State для хранения статистики
  const [stats, setStats] = useState({
    blocksCount: 0,
    transactionsCount: 0,
    tps: 0,
    blocksPerMinute: 0
  })
  
  // Для отслеживания изменений и анимации
  const [changedFields, setChangedFields] = useState<string[]>([])
  const prevStats = useRef({...stats})
  
  // Обработка данных подписки на количество блоков
  useEffect(() => {
    if (!blocksCountData?.block_aggregate?.aggregate?.count) return
    
    const newCount = blocksCountData.block_aggregate.aggregate.count
    if (newCount !== stats.blocksCount) {
      setStats(prev => ({
        ...prev,
        blocksCount: newCount
      }))
      
      setChangedFields(prev => [...prev, 'blocksCount'])
      setTimeout(() => {
        setChangedFields(prev => prev.filter(field => field !== 'blocksCount'))
      }, 1500)
    }
  }, [blocksCountData, stats.blocksCount])
  
  // Обработка данных подписки на количество транзакций
  useEffect(() => {
    if (!txCountData?.transaction_aggregate?.aggregate?.count) return
    
    const newCount = txCountData.transaction_aggregate.aggregate.count
    if (newCount !== stats.transactionsCount) {
      setStats(prev => ({
        ...prev,
        transactionsCount: newCount
      }))
      
      setChangedFields(prev => [...prev, 'transactionsCount'])
      setTimeout(() => {
        setChangedFields(prev => prev.filter(field => field !== 'transactionsCount'))
      }, 1500)
    }
  }, [txCountData, stats.transactionsCount])
  
  // Обработка данных подписки на последние блоки
  useEffect(() => {
    if (!recentBlocksData?.block || recentBlocksData.block.length < 2) return
    
    const blocks = recentBlocksData.block
    const newest = new Date(blocks[0].timestamp).getTime()
    const oldest = new Date(blocks[blocks.length-1].timestamp).getTime()
    const timeSpanMinutes = (newest - oldest) / (1000 * 60) || 1 // предотвращаем деление на 0
    
    // Количество блоков в минуту
    const blocksPerMinute = Math.round((blocks.length / timeSpanMinutes) * 10) / 10
    
    if (blocksPerMinute !== stats.blocksPerMinute) {
      // Расчет TPS
      let tps = 0
      if (stats.blocksCount > 0 && stats.transactionsCount > 0) {
        const avgTxPerBlock = stats.transactionsCount / stats.blocksCount
        tps = Math.round((blocksPerMinute * avgTxPerBlock) / 60 * 100) / 100
      }
      
      setStats(prev => ({
        ...prev,
        blocksPerMinute,
        tps
      }))
      
      setChangedFields(prev => [...prev, 'blocksPerMinute', 'tps'])
      setTimeout(() => {
        setChangedFields(prev => 
          prev.filter(field => field !== 'blocksPerMinute' && field !== 'tps')
        )
      }, 1500)
    }
  }, [recentBlocksData, stats.blocksCount, stats.blocksPerMinute, stats.transactionsCount])
  
  const loading = blocksCountLoading && txCountLoading && recentBlocksLoading
  const error = blocksCountError || txCountError || recentBlocksError
  
  if (loading && !blocksCountData && !txCountData && !recentBlocksData) {
    return <div className={styles.stats_container}>Загрузка статистики...</div>
  }
  
  if (error) {
    return <div className={styles.stats_container}>
      Ошибка: {blocksCountError?.message || txCountError?.message || recentBlocksError?.message}
    </div>
  }
  
  return (
    <div className={styles.stats_container}>
      <div className={changedFields.includes('blocksCount') ? `${styles.stat_card} ${styles.fade_in}` : styles.stat_card}>
        <div className={styles.stat_title}>ВСЕГО БЛОКОВ</div>
        <div className={styles.stat_value}>{stats.blocksCount.toLocaleString()}</div>
        <div className={styles.stat_subtitle}>~1000 блоков (лимит)</div>
      </div>
      
      <div className={changedFields.includes('transactionsCount') ? `${styles.stat_card} ${styles.fade_in}` : styles.stat_card}>
        <div className={styles.stat_title}>ВСЕГО ТРАНЗАКЦИЙ</div>
        <div className={styles.stat_value}>{stats.transactionsCount.toLocaleString()}</div>
        <div className={styles.stat_subtitle}>
          в реальном времени
        </div>
      </div>
      
      <div className={changedFields.includes('blocksPerMinute') ? `${styles.stat_card} ${styles.fade_in}` : styles.stat_card}>
        <div className={styles.stat_title}>БЛОКОВ В МИНУТУ</div>
        <div className={styles.stat_value}>{stats.blocksPerMinute.toLocaleString()}</div>
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