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
  
  const previousBlockId = useRef<string | null>(null)
  const speedHistory = useRef<number[]>([]) // Храним историю скоростей для сглаживания
  const lastAnimationTime = useRef<number>(0)

  useEffect(() => {
    if (!blocksData?.block || blocksData.block.length < 2) return

    const blocks: BlockData[] = blocksData.block
    const latestBlock = blocks[0]
    
    // Проверяем, что это действительно новый блок
    if (previousBlockId.current === latestBlock.id) return
    
    // Ищем предыдущий блок (по номеру)
    const currentBlockNumber = parseInt(latestBlock.number)
    const previousBlock = blocks.find(block => 
      parseInt(block.number) === currentBlockNumber - 1
    )
    
    if (!previousBlock) {
      // Если нет предыдущего блока, сохраняем текущий как предыдущий
      previousBlockId.current = latestBlock.id
      return
    }

    // Вычисляем РЕАЛЬНОЕ время между блоками на основе их timestamp'ов
    const currentBlockTime = new Date(latestBlock.timestamp).getTime()
    const previousBlockTime = new Date(previousBlock.timestamp).getTime()
    const realTimeDiff = (currentBlockTime - previousBlockTime) / 1000 // в секундах

    if (realTimeDiff > 0) {
      // Реальная скорость сети = 1 блок / реальное время между блоками
      const realNetworkSpeed = 1 / realTimeDiff
      
      // Добавляем в историю для сглаживания
      speedHistory.current.push(realNetworkSpeed)
      
      // Оставляем только последние 3 значения для быстрой реакции
      if (speedHistory.current.length > 3) {
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
      
      // console.log('🌐 Реальная скорость сети Quantum Fusion:', {
      //   currentBlock: latestBlock.id,
      //   currentBlockNumber: currentBlockNumber,
      //   previousBlock: previousBlock.id,
      //   previousBlockNumber: parseInt(previousBlock.number),
      //   realTimeDiff: realTimeDiff.toFixed(3) + 's',
      //   networkSpeed: realNetworkSpeed.toFixed(3),
      //   averageSpeed: roundedSpeed,
      //   currentTimestamp: latestBlock.timestamp,
      //   previousTimestamp: previousBlock.timestamp
      // })
      // console.log('Последние 5 блоков:', blocks.slice(0, 5).map(b => ({ id: b.id, number: b.number, timestamp: b.timestamp })))
    }

    // Сохраняем ID текущего блока
    previousBlockId.current = latestBlock.id

  }, [blocksData, blocksPerSecond])

  return {
    blocksPerSecond,
    isChanged,
    loading,
    error
  }
} 