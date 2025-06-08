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
    // ⏱️ Засекаем время начала обработки батча
    const batchStartTime = Date.now()
    
    const accounts = new Map<string, Account>()
    const blocks = new Map<string, Block>()
    const transactions = new Map<string, Transaction>()
    const eventsMap = new Map<string, Event>()
    
    // Статистика
    let totalTransfers = 0
    let totalEvents = 0
    let totalWithdraws = 0
    let totalExtrinsics = 0
    
    // Получаем текущую статистику из БД
    let stats = await ctx.store.findOne(Statistics, { where: { id: '1' } })
    
    if (!stats) {
      // Если статистики нет, создаем новую
      stats = new Statistics({
        id: '1',
        totalBlocks: 0n,
        totalExtrinsics: 0n,
        totalEvents: 0n,
        totalTransfers: 0n,
        totalWithdraws: 0n,
        totalTransactions: 0n,
        totalAccounts: 0n,
        lastUpdated: new Date()
      })
    }
    
    console.log(`🔄 Начинаем обработку батча из ${ctx.blocks.length} блоков`)
    
    for (const block of ctx.blocks) {
      const blockProcessStartTime = Date.now()
      const blockTimestamp = new Date(block.header.timestamp || 0)
      const blockAge = Date.now() - blockTimestamp.getTime()
      
      console.log(`📦 Блок #${block.header.height}`)
      console.log(`   Hash: ${block.header.hash}`)
      console.log(`   Время блока: ${blockTimestamp.toISOString()}`)
      console.log(`   Возраст блока: ${blockAge}ms`)
      
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
      
      // Добавляем аккаунт валидатора
      if (block.header.validator && !accounts.has(block.header.validator)) {
        accounts.set(block.header.validator, new Account({
          id: block.header.validator,
          balance: 0n,
          updatedAt: new Date(block.header.timestamp || 0)
        }))
      }
      
      for (const extrinsic of block.extrinsics) {
        // Добавляем экзинтриксики как транзакции
        if (extrinsic.success) {
          try {
            // Используем безопасный доступ к данным с проверкой типов
            const txId = `${block.header.hash}-extrinsic-${extrinsic.index}`
            
            const tx = new Transaction({
              id: txId,
              block: blockEntity,
              timestamp: new Date(block.header.timestamp || 0),
              from: undefined, // Мы не можем надежно получить отправителя, уберем это поле
              to: undefined,
              amount: 0n,
              fee: extrinsic.fee ? BigInt(extrinsic.fee.toString()) : 0n,
              status: 'success',
              type: 'extrinsic',
              data: JSON.stringify({
                hash: extrinsic.hash,
                index: extrinsic.index
              })
            })
            
            transactions.set(txId, tx)
            totalExtrinsics++
          } catch (e) {
            console.error('Ошибка при обработке экзинтриксика:', e)
          }
        }
      }
      
      for (const event of block.events) {
        console.log(`  Событие: ${event.name}`)
        
        // Обработка Balances.Transfer (как было раньше)
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
        // Обработка других событий Balances (как было раньше)
        else if (event.name.startsWith('Balances.') && event.name !== 'Balances.Transfer') {
          console.log(`    Балансовое событие: ${event.name}, args:`, event.args)
          
          // Если это Balances.Withdraw, добавляем аккаунт
          if (event.name === 'Balances.Withdraw') {
            try {
              const args = event.args
              const who = args.who?.toString() || ''
              const amount = args.amount ? BigInt(args.amount.toString()) : 0n
              
              // Создаем аккаунт, если еще не существует
              if (who && !accounts.has(who)) {
                console.log(`    Добавляем аккаунт: ${who} из события Withdraw`)
                accounts.set(who, new Account({
                  id: who,
                  balance: 0n, // Баланс нам неизвестен
                  updatedAt: new Date(block.header.timestamp || 0)
                }))
              }
              
              totalWithdraws++
            } catch (e) {
              console.error('Ошибка при обработке Balances.Withdraw:', e)
            }
          }
          
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
        // NEW: Обработка System.ExtrinsicSuccess и других событий
        else {
          const [section, method] = event.name.split('.')
          
          // Получаем связанную транзакцию если это событие для экзинтриксика
          let transaction = undefined
          if (event.extrinsic) {
            const txId = `${block.header.hash}-extrinsic-${event.extrinsic.index}`
            transaction = transactions.get(txId)
          }
          
          // Создаем событие
          const eventId = `${block.header.hash}-event-${event.index}`
          const eventEntity = new Event({
            id: eventId,
            block: blockEntity,
            transaction: transaction,
            section: section,
            method: method,
            data: JSON.stringify(event.args || {})
          })
          
          eventsMap.set(eventId, eventEntity)
          totalEvents++
        }
      }
      
      const blockProcessTime = Date.now() - blockProcessStartTime
      console.log(`   ⏱️ Время обработки блока: ${blockProcessTime}ms`)
    }
    
    // ⏱️ Засекаем время начала записи в БД
    const dbWriteStartTime = Date.now()
    
    // Сохраняем блоки
    if (blocks.size > 0) {
      const blockSaveStart = Date.now()
      await ctx.store.upsert([...blocks.values()])
      const blockSaveTime = Date.now() - blockSaveStart
      console.log(`💾 Сохранено блоков: ${blocks.size} за ${blockSaveTime}ms`)
    }
    
    // Сохраняем транзакции
    if (transactions.size > 0) {
      const txSaveStart = Date.now()
      await ctx.store.upsert([...transactions.values()])
      const txSaveTime = Date.now() - txSaveStart
      console.log(`💾 Сохранено транзакций: ${transactions.size} за ${txSaveTime}ms`)
    }
    
    // Сохраняем события
    if (eventsMap.size > 0) {
      const eventSaveStart = Date.now()
      await ctx.store.upsert([...eventsMap.values()])
      const eventSaveTime = Date.now() - eventSaveStart
      console.log(`💾 Сохранено событий: ${eventsMap.size} за ${eventSaveTime}ms`)
    }
    
    // Сохраняем аккаунты
    if (accounts.size > 0) {
      const accountSaveStart = Date.now()
      await ctx.store.upsert([...accounts.values()])
      const accountSaveTime = Date.now() - accountSaveStart
      console.log(`💾 Сохранено аккаунтов: ${accounts.size} за ${accountSaveTime}ms`)
    }
    
    // Обновляем статистику
    stats.totalBlocks = BigInt(await ctx.store.count(Block))
    stats.totalTransactions = (stats.totalTransactions || 0n) + BigInt(transactions.size)
    stats.totalExtrinsics = (stats.totalExtrinsics || 0n) + BigInt(totalExtrinsics)
    stats.totalEvents = (stats.totalEvents || 0n) + BigInt(totalEvents)
    stats.totalTransfers = (stats.totalTransfers || 0n) + BigInt(totalTransfers)
    stats.totalWithdraws = (stats.totalWithdraws || 0n) + BigInt(totalWithdraws)
    stats.totalAccounts = BigInt(await ctx.store.count(Account))
    stats.lastUpdated = new Date()
    
    await ctx.store.upsert(stats)
    
    const dbWriteTime = Date.now() - dbWriteStartTime
    const totalBatchTime = Date.now() - batchStartTime
    
    console.log(`📊 Статистика батча:`)
    console.log(`   - Блоков обработано: ${ctx.blocks.length}`)
    console.log(`   - Транзакций: ${transactions.size}`)
    console.log(`   - Событий: ${eventsMap.size}`)
    console.log(`   - Аккаунтов: ${accounts.size}`)
    console.log(`   ⏱️ Время записи в БД: ${dbWriteTime}ms`)
    console.log(`   ⏱️ Общее время батча: ${totalBatchTime}ms`)
    console.log(`   🚀 Скорость: ${(ctx.blocks.length / (totalBatchTime / 1000)).toFixed(2)} блоков/сек`)
    console.log(`---`)
    
    // Очищаем старые блоки
    try {
      await cleanupOldBlocks(ctx)
    } catch (error) {
      console.error('Ошибка при очистке старых блоков:', error)
    }
  })
}

main().catch(console.error)
