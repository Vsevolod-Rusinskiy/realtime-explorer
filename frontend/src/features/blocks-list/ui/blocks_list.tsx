'use client'

import { useSubscription } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { BLOCKS_SUBSCRIPTION } from '@/shared/api'
import { Block, BlockCard } from '@/entities/block'
import styles from './styles.module.css'

export function BlocksList() {
  const { data, loading, error } = useSubscription(BLOCKS_SUBSCRIPTION)
  const [visibleBlocks, setVisibleBlocks] = useState<Block[]>([])
  const [animateTopBlock, setAnimateTopBlock] = useState(false)
  const firstRender = useRef(true)
  const lastAnimationTime = useRef(Date.now())

  // Синхронизируем state с подпиской
  useEffect(() => {
    if (!data?.block) return
    
    // Если первый рендер — просто показываем все 30
    if (firstRender.current) {
      setVisibleBlocks(data.block)
      firstRender.current = false
      return
    }

    // Обновляем блоки в реальном времени
    const currentTopBlockId = visibleBlocks[0]?.id
    const newTopBlockId = data.block[0]?.id
    
    setVisibleBlocks(data.block)
    
    // Если изменился верхний блок И прошло 3 секунды - анимируем
    if (newTopBlockId && newTopBlockId !== currentTopBlockId) {
      const now = Date.now()
      if (now - lastAnimationTime.current >= 3000) { // 3 секунды
        setAnimateTopBlock(true)
        lastAnimationTime.current = now
        
        // Убираем анимацию через 1.5 секунды
        setTimeout(() => setAnimateTopBlock(false), 1500)
      }
    }
    // eslint-disable-next-line
  }, [data])

  if (loading) return <div>Blocks loading...</div>
  if (error) return <div>Error loading: {error.message}</div>

  return (
    <div className={styles.blocks_list_container}>
      {visibleBlocks.map((block: Block, index: number) => (
        <BlockCard
          key={block.id}
          block={block}
          isNew={index === 0 && animateTopBlock}
        />
      ))}
    </div>
  )
} 