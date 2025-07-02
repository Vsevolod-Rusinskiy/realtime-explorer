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
        
        const stats = await ctx.store.findOne(Statistics, { where: { id: '1' } })
        if (stats) {
          stats.totalBlocks = BigInt(await ctx.store.count(Block))
          stats.totalTransactions = BigInt(await ctx.store.count(Transaction))
          stats.totalEvents = BigInt(await ctx.store.count(Event))
          await ctx.store.upsert(stats)
        }
      }
    }
  } catch (e) {
    console.error('Ошибка при очистке старых блоков:', e)
  }
} 