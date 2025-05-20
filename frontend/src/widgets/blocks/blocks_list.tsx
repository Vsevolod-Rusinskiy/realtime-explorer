'use client'

import { useSubscription, gql } from '@apollo/client'
import { useEffect, useRef } from 'react'
import styles from './blocks_list.module.css'

// GraphQL subscription на последние 10 блоков (по убыванию времени)
const BLOCKS_SUBSCRIPTION = gql`
  subscription Blocks {
    block(order_by: {timestamp: desc}, limit: 10) {
      id
      hash
      timestamp
    }
  }
`

export function BlocksList() {
  console.log('[BlocksList] render')
  // Apollo useSubscription автоматически обновляет данные при появлении новых блоков
  const { data, loading, error } = useSubscription(BLOCKS_SUBSCRIPTION)
  const prevIds = useRef<string[]>([])

  // Для анимации: определяем, какие блоки новые
  useEffect(() => {
    if (data?.block) {
      console.log('[BlocksList] получили данные:', data.block)
      prevIds.current = data.block.map((b: any) => b.id)
    }
  }, [data])

  useEffect(() => {
    if (error) {
      console.error('[BlocksList] ошибка подписки:', error)
    }
  }, [error])

  if (loading) {
    console.log('[BlocksList] loading...')
    return <div>Загрузка блоков...</div>
  }
  if (error) {
    console.error('[BlocksList] ошибка загрузки:', error)
    return <div>Ошибка загрузки: {error.message}</div>
  }

  return (
    <div className={styles.blocks_list_container}>
      {data.block.map((block: any) => {
        console.log('[BlocksList] рендер блока:', block)
        return (
          <div
            key={block.id}
            className={styles.block_card}
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