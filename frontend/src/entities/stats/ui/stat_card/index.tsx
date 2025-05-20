'use client'

import styles from './styles.module.css'

interface StatCardProps {
  title: string
  value: number
  subtitle: string
  highlightText: string
  isChanged: boolean
}

export function StatCard({ title, value, subtitle, highlightText, isChanged }: StatCardProps) {
  return (
    <div className={isChanged ? `${styles.stat_card} ${styles.fade_in}` : styles.stat_card}>
      <div className={styles.stat_title}>{title}</div>
      <div className={styles.stat_value}>{value.toLocaleString()}</div>
      <div className={styles.stat_subtitle}>
        {subtitle.split(highlightText).map((part, index, array) => (
          index === array.length - 1 ? 
            <span key={index}>{part}</span> : 
            <span key={index}>
              {part}
              <span className={styles.stat_highlight}>{highlightText}</span>
            </span>
        ))}
      </div>
    </div>
  )
} 