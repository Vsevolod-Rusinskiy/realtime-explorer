'use client'

import { useSubscription } from '@apollo/client'
import { STATISTICS_SUBSCRIPTION, useBlockSpeed } from '@/shared/api'
import { StatCard } from '@/entities/stats'
import styles from './styles.module.css'

export function StatsWidget() {
  const { data: statsData, loading, error } = useSubscription(STATISTICS_SUBSCRIPTION)
  
  const { blocksPerSecond, isChanged: isBlocksChanged, loading: blocksLoading } = useBlockSpeed()
  
  if ((loading || blocksLoading) && !statsData) {
    return <div className={styles.stats_container}>Statistics loading...</div>
  }
  
  if (error) {
    return <div className={styles.stats_container}>
      Error loading statistics: {error?.message}
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
      {/*
      <StatCard 
        title="TRANSACTIONS PER SECOND" 
        value={transactionsPerSecond} 
        subtitle="network TPS" 
        highlightText="TPS"
        isChanged={isTransactionsChanged}
      />
      */}
    </div>
  )
} 