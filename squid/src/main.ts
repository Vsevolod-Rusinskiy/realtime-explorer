import {TypeormDatabase, Store} from '@subsquid/typeorm-store'
import {In} from 'typeorm'
import * as ss58 from '@subsquid/ss58'
import assert from 'assert'

import {createProcessor, ProcessorContext} from './processor'
import {Account, Block, Transaction, Event, Statistics} from './model'
import {events} from './types'
import {cleanupOldBlocks} from './db/cleanup'

async function main() {
  const processor = await createProcessor()
  processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    const accounts = new Map<string, Account>()
    const blocks = new Map<string, Block>()
    const transactions = new Map<string, Transaction>()
    const eventsMap = new Map<string, Event>()
    
    let totalTransfers = 0
    
    for (const block of ctx.blocks) {
      console.log(`Блок #${block.header.height}, hash: ${block.header.hash}`)
      
      // Создаем объект блока
      const blockEntity = new Block({
        id: block.header.hash,
        number: BigInt(block.header.height),
        hash: block.header.hash,
        timestamp: new Date(block.header.timestamp || 0),
        validator: block.header.validator || '',
        status: 'finalized',
        size: 0 // Размер можно будет добавить позже
      })
      
      blocks.set(block.header.hash, blockEntity)
      
      for (const event of block.events) {
        console.log(`  Событие: ${event.name}`)
        
        if (event.name === 'Balances.Transfer') {
          try {
            const args = event.args
            const from = args.from?.toString() || ''
            const to = args.to?.toString() || ''
            const amount = args.amount ? BigInt(args.amount.toString()) : 0n
            console.log(`    Перевод: ${from} -> ${to}, сумма: ${amount}`)
            
            // Создаём/обновляем аккаунты
            if (from && !accounts.has(from)) {
              accounts.set(from, new Account({id: from, balance: 0n, updatedAt: new Date()}))
            }
            if (to && !accounts.has(to)) {
              accounts.set(to, new Account({id: to, balance: 0n, updatedAt: new Date()}))
            }
            
            // Создаем транзакцию
            const txId = `${block.header.hash}-transfer-${totalTransfers}`
            const tx = new Transaction({
              id: txId,
              block: blockEntity,
              timestamp: new Date(block.header.timestamp || 0),
              from: accounts.get(from),
              to: accounts.get(to),
              amount: amount,
              fee: 0n, // Можно будет уточнить позже
              status: 'success',
              type: 'transfer',
              data: JSON.stringify(args)
            })
            
            transactions.set(txId, tx)
            
            // Создаем событие
            const eventId = `${block.header.hash}-event-${event.index}`
            const eventEntity = new Event({
              id: eventId,
              block: blockEntity,
              transaction: tx,
              section: 'Balances',
              method: 'Transfer',
              data: JSON.stringify(args)
            })
            
            eventsMap.set(eventId, eventEntity)
            
            totalTransfers++
          } catch (e) {
            console.error('Ошибка при обработке Balances.Transfer:', e)
          }
        }
        
        if (event.name.startsWith('Balances.') && event.name !== 'Balances.Transfer') {
          console.log(`    Балансовое событие: ${event.name}, args:`, event.args)
          
          // Создаем событие для других балансовых операций
          const eventId = `${block.header.hash}-event-${event.index}`
          const eventEntity = new Event({
            id: eventId,
            block: blockEntity,
            section: 'Balances',
            method: event.name.split('.')[1],
            data: JSON.stringify(event.args)
          })
          
          eventsMap.set(eventId, eventEntity)
        }
      }
    }
    
    // Сохраняем блоки
    if (blocks.size > 0) {
      await ctx.store.upsert([...blocks.values()])
      console.log(`Сохранено блоков: ${blocks.size}`)
    }
    
    // Сохраняем транзакции
    if (transactions.size > 0) {
      await ctx.store.upsert([...transactions.values()])
      console.log(`Сохранено транзакций: ${transactions.size}`)
    }
    
    // Сохраняем события
    if (eventsMap.size > 0) {
      await ctx.store.upsert([...eventsMap.values()])
      console.log(`Сохранено событий: ${eventsMap.size}`)
    }
    
    // Сохраняем аккаунты
    if (accounts.size > 0) {
      await ctx.store.upsert([...accounts.values()])
      console.log(`Сохранено аккаунтов: ${accounts.size}`)
    }
    
    console.log(`Батч обработан: блоков: ${ctx.blocks.length}, транзакций: ${totalTransfers}`)
    
    // Очищаем старые блоки
    try {
      await cleanupOldBlocks(ctx)
    } catch (error) {
      console.error('Ошибка при очистке старых блоков:', error)
    }
  })
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
