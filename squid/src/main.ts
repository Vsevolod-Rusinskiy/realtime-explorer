import {TypeormDatabase, Store} from '@subsquid/typeorm-store'
import {In} from 'typeorm'
import * as ss58 from '@subsquid/ss58'
import assert from 'assert'

import {createProcessor, ProcessorContext} from './processor'
import {Account} from './model'
import {events} from './types'

async function main() {
  const processor = await createProcessor()
  processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    const accounts = new Map<string, Account>()
    let totalTransfers = 0
    for (const block of ctx.blocks) {
      console.log(`Блок #${block.header.height}, hash: ${block.header.hash}`)
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
            totalTransfers++
          } catch (e) {
            console.error('Ошибка при обработке Balances.Transfer:', e)
          }
        }
        if (event.name.startsWith('Balances.')) {
          console.log(`    Балансовое событие: ${event.name}, args:`, event.args)
        }
        if (event.name.startsWith('System.')) {
          console.log(`    Системное событие: ${event.name}, args:`, event.args)
        }
      }
    }
    // Сохраняем аккаунты
    if (accounts.size > 0) {
      await ctx.store.upsert([...accounts.values()])
      console.log(`Сохранено аккаунтов: ${accounts.size}`)
    }
    // Пример простой статистики
    console.log(`Батч обработан: блоков: ${ctx.blocks.length}, транзакций: ${totalTransfers}`)
  })
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
