'use client'

import { useSubscription } from '@apollo/client'
import { useEffect, useState, useRef } from 'react'
import { LATEST_BLOCKS_SUBSCRIPTION } from '../model/stats'

interface BlockData {
  id: string
  number: string
  timestamp: string
}

export function useBlockSpeed() {
  const { data: blocksData, loading, error } = useSubscription(LATEST_BLOCKS_SUBSCRIPTION)
  const [blocksPerSecond, setBlocksPerSecond] = useState(0)
  const [isChanged, setIsChanged] = useState(false)
  
  const previousBlockTime = useRef<number | null>(null)
  const speedHistory = useRef<number[]>([]) // Храним историю скоростей для сглаживания
  const lastAnimationTime = useRef<number>(0)

  useEffect(() => {
    if (!blocksData?.block || blocksData.block.length === 0) return

    const blocks: BlockData[] = blocksData.block
    const latestBlock = blocks[0]
    const currentBlockTime = new Date(latestBlock.timestamp).getTime()

    // Если это первый блок, просто сохраняем время
    if (previousBlockTime.current === null) {
      previousBlockTime.current = currentBlockTime
      return
    }

    // Вычисляем время между блоками
    const timeDiff = (currentBlockTime - previousBlockTime.current) / 1000 // в секундах

    if (timeDiff > 0) {
      // Скорость = 1 блок / время между блоками
      const speed = 1 / timeDiff
      
      // Добавляем в историю для сглаживания
      speedHistory.current.push(speed)
      
      // Оставляем только последние 5 значений
      if (speedHistory.current.length > 5) {
        speedHistory.current.shift()
      }
      
      // Вычисляем среднюю скорость
      const averageSpeed = speedHistory.current.reduce((sum, s) => sum + s, 0) / speedHistory.current.length
      const roundedSpeed = Math.round(averageSpeed * 100) / 100
      
      // Обновляем скорость только если изменение значительное
      if (Math.abs(roundedSpeed - blocksPerSecond) >= 0.01) {
        setBlocksPerSecond(roundedSpeed)
        
        // Анимация с throttling (раз в 4 секунды)
        const now = Date.now()
        if ((now - lastAnimationTime.current) >= 4000) {
          setIsChanged(true)
          lastAnimationTime.current = now
          
          setTimeout(() => {
            setIsChanged(false)
          }, 4000)
        }
      }
      
      console.log('🔄 Расчет скорости блоков:', {
        timeDiff: timeDiff.toFixed(2),
        speed: speed.toFixed(2),
        averageSpeed: roundedSpeed,
        blockNumber: latestBlock.number
      })
    }

    // Сохраняем время текущего блока
    previousBlockTime.current = currentBlockTime

  }, [blocksData, blocksPerSecond])

  return {
    blocksPerSecond,
    isChanged,
    loading,
    error
  }
} 