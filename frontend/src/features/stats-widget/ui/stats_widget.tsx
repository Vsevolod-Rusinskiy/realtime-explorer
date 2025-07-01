'use client'

import { useSubscription } from '@apollo/client'
import { STATISTICS_SUBSCRIPTION, useBlockSpeed } from '@/shared/api'
import { useTransactionSpeed } from '@/shared/api/hooks/use_transaction_speed'
import { StatCard } from '@/entities/stats'
import styles from './styles.module.css'

export function StatsWidget() {
  // Подписка на реальную статистику из БД (для транзакций)
  const { data: statsData, loading, error } = useSubscription(STATISTICS_SUBSCRIPTION)
  
  // Новый хук для расчета скорости блоков
  const { blocksPerSecond, isChanged: isBlocksChanged, loading: blocksLoading } = useBlockSpeed()
  
  // Новый хук для расчета TPS на лету
  const { transactionsPerSecond, isChanged: isTransactionsChanged, loading: tpsLoading, error: tpsError } = useTransactionSpeed()
  
  if ((loading || blocksLoading || tpsLoading) && !statsData) {
    return <div className={styles.stats_container}>Statistics loading...</div>
  }
  
  if (error || tpsError) {
    return <div className={styles.stats_container}>
      Error loading statistics: {error?.message || tpsError?.message}
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
      
      <StatCard 
        title="TRANSACTIONS PER SECOND" 
        value={transactionsPerSecond} 
        subtitle="network TPS" 
        highlightText="TPS"
        isChanged={isTransactionsChanged}
      />
    </div>
  )
} 