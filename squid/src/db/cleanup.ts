import { MAX_BLOCKS } from '../config'
import { ProcessorContext } from '../processor'
import { Block, Event, Transaction, Statistics } from '../model'
import { In, LessThanOrEqual } from 'typeorm'

export async function cleanupOldBlocks(ctx: ProcessorContext<any>) {
  try {
    const blockCount = await ctx.store.count(Block)
    
    if (blockCount > MAX_BLOCKS) {
      const blocksToDeleteCount = blockCount - MAX_BLOCKS
      
      const oldestBlocks = await ctx.store.find(Block, {
        order: { number: 'ASC' },
        take: blocksToDeleteCount
      })
      
      if (oldestBlocks.length > 0) {
        const blockIds = oldestBlocks.map((block: Block) => block.id)
        
        const events = await ctx.store.find(Event, {
          where: { block: { id: In(blockIds) } }
        })
        
        const transactions = await ctx.store.find(Transaction, {
          where: { block: { id: In(blockIds) } }
        })
        
        if (events.length > 0) {
          await ctx.store.remove(events)
        }
        
        if (transactions.length > 0) {
          await ctx.store.remove(transactions)
        }
        
        await ctx.store.remove(oldestBlocks)
        
        // После удаления блоков обновляем статистику
        const stats = await ctx.store.findOne(Statistics, { where: { id: '1' } })
        if (stats) {
          const oldTotalBlocks = stats.totalBlocks
          stats.totalBlocks = stats.totalBlocks - BigInt(blocksToDeleteCount)
          stats.totalTransactions = stats.totalTransactions - BigInt(transactions.length)
          stats.totalEvents = stats.totalEvents - BigInt(events.length)
          await ctx.store.save(stats)
          
          // 🔍 Отладочное логирование
          console.log(`🧹 Очистка: удалено ${blocksToDeleteCount} блоков`)
          console.log(`   📊 Статистика блоков: ${oldTotalBlocks} -> ${stats.totalBlocks}`)
          console.log(`   📊 Удалено транзакций: ${transactions.length}`)
          console.log(`   📊 Удалено событий: ${events.length}`)
        }
      }
    }
  } catch (error) {
    console.error('Ошибка при очистке старых блоков:', error)
  }
} 