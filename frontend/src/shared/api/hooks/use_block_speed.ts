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
  const speedHistory = useRef<number[]>([])
  const lastAnimationTime = useRef<number>(0)

  useEffect(() => {
    if (!blocksData?.block || blocksData.block.length < 2) return

    const blocks: BlockData[] = blocksData.block
    const latestBlock = blocks[0]
    
    if (previousBlockId.current === latestBlock.id) return
    
    const currentBlockNumber = parseInt(latestBlock.number)
    const previousBlock = blocks.find(block => 
      parseInt(block.number) === currentBlockNumber - 1
    )
    
    if (!previousBlock) {
      previousBlockId.current = latestBlock.id
      return
    }

    const currentBlockTime = new Date(latestBlock.timestamp).getTime()
    const previousBlockTime = new Date(previousBlock.timestamp).getTime()
    const realTimeDiff = (currentBlockTime - previousBlockTime) / 1000

    if (realTimeDiff > 0) {
      const realNetworkSpeed = 1 / realTimeDiff
      
      speedHistory.current.push(realNetworkSpeed)
      
      if (speedHistory.current.length > 3) {
        speedHistory.current.shift()
      }
      
      const averageSpeed = speedHistory.current.reduce((sum, s) => sum + s, 0) / speedHistory.current.length
      const roundedSpeed = Math.round(averageSpeed * 100) / 100
      
      if (Math.abs(roundedSpeed - blocksPerSecond) >= 0.01) {
        setBlocksPerSecond(roundedSpeed)
        
        const now = Date.now()
        if ((now - lastAnimationTime.current) >= 4000) {
          setIsChanged(true)
          lastAnimationTime.current = now
          
          setTimeout(() => {
            setIsChanged(false)
          }, 4000)
        }
      }
    }

    previousBlockId.current = latestBlock.id

  }, [blocksData, blocksPerSecond])

  return {
    blocksPerSecond,
    isChanged,
    loading,
    error
  }
} 