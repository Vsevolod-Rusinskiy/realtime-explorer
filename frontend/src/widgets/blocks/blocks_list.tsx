'use client'

import { useSubscription, gql } from '@apollo/client'
import { useEffect, useRef } from 'react'
import styles from './blocks_list.module.css'

// GraphQL subscription на последние 30 блоков (по убыванию времени)
const BLOCKS_SUBSCRIPTION = gql`
  subscription Blocks {
    block(order_by: {timestamp: desc}, limit: 30) {
      id
      hash
      timestamp
    }
  }
`

export function BlocksList() {
  // Apollo useSubscription автоматически обновляет данные при появлении новых блоков
  const { data, loading, error } = useSubscription(BLOCKS_SUBSCRIPTION)
  const prevIds = useRef<string[]>([])

  // Вычисляем новые блоки (id которых не было в предыдущем рендере)
  const newIds = data?.block
    ? data.block.map((b: any) => b.id).filter((id: string) => !prevIds.current.includes(id))
    : []

  useEffect(() => {
    if (data?.block) {
      prevIds.current = data.block.map((b: any) => b.id)
    }
  }, [data])

  useEffect(() => {
    if (error) {
      console.error('[BlocksList] ошибка подписки:', error)
    }
  }, [error])

  if (loading) {
    return <div>Загрузка блоков...</div>
  }
  if (error) {
    return <div>Ошибка загрузки: {error.message}</div>
  }

  return (
    <div className={styles.blocks_list_container}>
      {data.block.map((block: any) => {
        const isNew = newIds.includes(block.id)
        return (
          <div
            key={block.id}
            className={styles.block_card + (isNew ? ' ' + styles.fade_in : '')}
          >
            <div className={styles.block_id}>ID: {block.id}</div>
            <div className={styles.block_hash}>Hash: {block.hash}</div>
            <div className={styles.block_time}>{new Date(block.timestamp).toLocaleString()}</div>
          </div>
        )
      })}
    </div>
  )
}

// Tailwind анимация (fade-in)
// Добавь в tailwind.config.js:
// theme: { extend: { keyframes: { 'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } } }, animation: { 'fade-in': 'fade-in 0.7s ease' } } } 