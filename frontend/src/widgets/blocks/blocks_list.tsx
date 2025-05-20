'use client'

import { useSubscription, gql } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
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
  const { data, loading, error } = useSubscription(BLOCKS_SUBSCRIPTION)
  const [visibleBlocks, setVisibleBlocks] = useState<any[]>([])
  const [newId, setNewId] = useState<string | null>(null)
  const firstRender = useRef(true)

  // Синхронизируем state с подпиской
  useEffect(() => {
    if (!data?.block) return
    // Если первый рендер — просто показываем все 30
    if (firstRender.current) {
      setVisibleBlocks(data.block)
      setNewId(null)
      firstRender.current = false
      return
    }
    // Если появился новый блок (id которого не было)
    const currentIds = visibleBlocks.map(b => b.id)
    const incomingIds = data.block.map((b: any) => b.id)
    const newBlock = data.block.find((b: any) => !currentIds.includes(b.id))
    if (newBlock) {
      setVisibleBlocks(data.block)
      setNewId(newBlock.id)
      // Через 1500мс убираем эффект подсветки рамки (соответствует длительности анимации)
      setTimeout(() => setNewId(null), 1500)
    } else {
      setVisibleBlocks(data.block)
      setNewId(null)
    }
    // eslint-disable-next-line
  }, [data])

  if (loading) return <div>Загрузка блоков...</div>
  if (error) return <div>Ошибка загрузки: {error.message}</div>

  return (
    <div className={styles.blocks_list_container}>
      {visibleBlocks.map((block: any) => {
        const isNew = newId === block.id
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