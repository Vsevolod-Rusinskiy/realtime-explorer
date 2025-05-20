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
  // Список блоков, которые реально отображаются
  const [visibleBlocks, setVisibleBlocks] = useState<any[]>([])
  // Очередь новых блоков на появление
  const queueRef = useRef<any[]>([])
  // Для анимации: id новых блоков
  const [newIds, setNewIds] = useState<string[]>([])
  // Для предотвращения дублирования setTimeout
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Приходит новый массив блоков из подписки
  useEffect(() => {
    if (!data?.block) return
    // id уже отображаемых
    const currentIds = visibleBlocks.map(b => b.id)
    // id из подписки
    const incomingIds = data.block.map((b: any) => b.id)
    // Новые блоки (которых нет в visibleBlocks)
    const newBlocks = data.block.filter((b: any) => !currentIds.includes(b.id))
    // Добавляем новые блоки в очередь
    if (newBlocks.length > 0) {
      queueRef.current = [...queueRef.current, ...newBlocks]
      // Запускаем процесс поочерёдного добавления
      if (!timerRef.current) {
        addNextBlock()
      }
    }
    // Если какие-то блоки исчезли (например, ушли из топ-30) — удаляем их из visibleBlocks
    const stillVisible = visibleBlocks.filter(b => incomingIds.includes(b.id))
    if (stillVisible.length !== visibleBlocks.length) {
      setVisibleBlocks(stillVisible)
    }
    // eslint-disable-next-line
  }, [data])

  // Функция поочерёдного добавления блоков из очереди
  function addNextBlock() {
    if (queueRef.current.length === 0) {
      timerRef.current = null
      return
    }
    const next = queueRef.current.shift()
    setVisibleBlocks(prev => [next, ...prev].slice(0, 30))
    setNewIds(ids => [next.id, ...ids].slice(0, 30))
    timerRef.current = setTimeout(addNextBlock, 500)
  }

  // После анимации убираем id из newIds
  useEffect(() => {
    if (newIds.length === 0) return
    const timeout = setTimeout(() => {
      setNewIds([])
    }, 800)
    return () => clearTimeout(timeout)
  }, [newIds])

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
      {visibleBlocks.map((block: any) => {
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