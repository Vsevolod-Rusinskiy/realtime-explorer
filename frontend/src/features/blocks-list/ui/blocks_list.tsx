'use client'

import { useSubscription } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { BLOCKS_SUBSCRIPTION } from '@/shared/api'
import { Block, BlockCard } from '@/entities/block'
import styles from './styles.module.css'

export function BlocksList() {
  const { data, loading, error } = useSubscription(BLOCKS_SUBSCRIPTION)
  const [visibleBlocks, setVisibleBlocks] = useState<Block[]>([])
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
    const newBlock = data.block.find((b: Block) => !currentIds.includes(b.id))
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
      {visibleBlocks.map((block: Block) => (
        <BlockCard
          key={block.id}
          block={block}
          isNew={newId === block.id}
        />
      ))}
    </div>
  )
} 