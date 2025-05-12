import { MAX_BLOCKS } from '../config'
import { ProcessorContext } from '../processor'
import { Block, Event, Transaction } from '../model'
import { In, LessThanOrEqual } from 'typeorm'

export async function cleanupOldBlocks(ctx: ProcessorContext<any>) {
  try {
    console.log('Запуск очистки старых блоков...')
    
    // Подсчитываем общее количество блоков через метод count
    const blockCount = await ctx.store.count(Block)
    
    console.log(`Текущее количество блоков: ${blockCount}, лимит: ${MAX_BLOCKS}`)
    
    if (blockCount > MAX_BLOCKS) {
      // Находим ID самых старых блоков для удаления
      const blocksToDeleteCount = blockCount - MAX_BLOCKS
      
      console.log(`Превышен лимит блоков, необходимо удалить: ${blocksToDeleteCount}`)
      
      // Получаем самые старые блоки
      const oldestBlocks = await ctx.store.find(Block, {
        order: { number: 'ASC' },
        take: blocksToDeleteCount
      })
      
      if (oldestBlocks.length > 0) {
        // Получаем ID блоков для удаления
        const blockIds = oldestBlocks.map((block: Block) => block.id)
        const minBlockNumber = Number(oldestBlocks[0].number)
        const maxBlockNumber = Number(oldestBlocks[oldestBlocks.length - 1].number)
        
        console.log(`Удаляем данные для блоков с номера ${minBlockNumber} по ${maxBlockNumber}`)
        
        // Находим все события, связанные с этими блоками
        const events = await ctx.store.find(Event, {
          where: { block: { id: In(blockIds) } }
        })
        console.log(`Найдено событий для удаления: ${events.length}`)
        
        // Находим все транзакции, связанные с этими блоками
        const transactions = await ctx.store.find(Transaction, {
          where: { block: { id: In(blockIds) } }
        })
        console.log(`Найдено транзакций для удаления: ${transactions.length}`)
        
        // Удаляем события
        if (events.length > 0) {
          await ctx.store.remove(events)
          console.log(`Удалено событий: ${events.length}`)
        }
        
        // Удаляем транзакции
        if (transactions.length > 0) {
          await ctx.store.remove(transactions)
          console.log(`Удалено транзакций: ${transactions.length}`)
        }
        
        // Удаляем блоки
        await ctx.store.remove(oldestBlocks)
        console.log(`Удалено блоков: ${oldestBlocks.length}`)
        
        console.log('Очистка завершена успешно')
      }
    } else {
      console.log(`Очистка не требуется. Текущее количество блоков (${blockCount}) не превышает лимит (${MAX_BLOCKS})`)
    }
  } catch (error) {
    console.error('Ошибка при очистке старых блоков:', error)
  }
} 