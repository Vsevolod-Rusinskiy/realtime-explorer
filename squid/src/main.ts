import {TypeormDatabase, Store} from '@subsquid/typeorm-store'
import {In} from 'typeorm'
import * as ss58 from '@subsquid/ss58'
import assert from 'assert'

import {createProcessor, ProcessorContext} from './processor'
import {Account, Block, Transaction, Event, Statistics} from './model'
import {events} from './types'
import {cleanupOldBlocks} from './db/cleanup'

let lastLogTime = Date.now()
let totalBlocksProcessed = 0
let totalBatchTime = 0
let totalDbTime = 0

async function main() {
  const processor = await createProcessor()
  processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    const batchStartTime = Date.now()
    
    const accounts = new Map<string, Account>()
    const blocks = new Map<string, Block>()
    const transactions = new Map<string, Transaction>()
    const eventsMap = new Map<string, Event>()
    
    let totalTransfers = 0
    let totalEvents = 0
    let totalWithdraws = 0
    let totalExtrinsics = 0
    
    let stats = await ctx.store.findOne(Statistics, { where: { id: '1' } })
    
    if (!stats) {
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
    
    totalBlocksProcessed += ctx.blocks.length
    
    for (const block of ctx.blocks) {
      const blockProcessStartTime = Date.now()
      const blockTimestamp = new Date(block.header.timestamp || 0)
      const blockAge = Date.now() - blockTimestamp.getTime()
      
      const blockEntity = new Block({
        id: block.header.hash,
        number: BigInt(block.header.height),
        hash: block.header.hash,
        timestamp: new Date(block.header.timestamp || 0),
        validator: block.header.validator || '',
        status: 'finalized',
        size: 0
      })
      
      blocks.set(block.header.hash, blockEntity)
      
      if (block.header.validator && !accounts.has(block.header.validator)) {
        accounts.set(block.header.validator, new Account({
          id: block.header.validator,
          balance: 0n,
          updatedAt: new Date(block.header.timestamp || 0)
        }))
      }
      
      for (const extrinsic of block.extrinsics) {
        if (extrinsic.success) {
          try {
            const txId = `${block.header.hash}-extrinsic-${extrinsic.index}`
            
            const tx = new Transaction({
              id: txId,
              block: blockEntity,
              timestamp: new Date(block.header.timestamp || 0),
              from: undefined,
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
            console.error('Error processing extrinsic:', e)
          }
        }
      }
      
      for (const event of block.events) {
        if (event.name === 'Balances.Transfer') {
          try {
            const args = event.args
            const from = args.from?.toString() || ''
            const to = args.to?.toString() || ''
            const amount = args.amount ? BigInt(args.amount.toString()) : 0n
            
            if (from && !accounts.has(from)) {
              accounts.set(from, new Account({id: from, balance: 0n, updatedAt: new Date()}))
            }
            if (to && !accounts.has(to)) {
              accounts.set(to, new Account({id: to, balance: 0n, updatedAt: new Date()}))
            }
            
            const txId = `${block.header.hash}-transfer-${totalTransfers}`
            const tx = new Transaction({
              id: txId,
              block: blockEntity,
              timestamp: new Date(block.header.timestamp || 0),
              from: accounts.get(from),
              to: accounts.get(to),
              amount: amount,
              fee: 0n,
              status: 'success',
              type: 'transfer',
              data: JSON.stringify(args)
            })
            
            transactions.set(txId, tx)
            
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
            console.error('Error processing Balances.Transfer:', e)
          }
        }
        else if (event.name.startsWith('Balances.') && event.name !== 'Balances.Transfer') {
          
          if (event.name === 'Balances.Withdraw') {
            try {
              const args = event.args
              const who = args.who?.toString() || ''
              const amount = args.amount ? BigInt(args.amount.toString()) : 0n
              
              if (who && !accounts.has(who)) {
                accounts.set(who, new Account({
                  id: who,
                  balance: 0n,
                  updatedAt: new Date(block.header.timestamp || 0)
                }))
              }
              
              totalWithdraws++
            } catch (e) {
              console.error('Error processing Balances.Withdraw:', e)
            }
          }
          
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
    
    const dbWriteStartTime = Date.now()
    
    if (blocks.size > 0) {
      await ctx.store.upsert([...blocks.values()])
    }
    
    if (transactions.size > 0) {
      await ctx.store.upsert([...transactions.values()])
    }
    
    if (eventsMap.size > 0) {
      await ctx.store.upsert([...eventsMap.values()])
    }
    
    if (accounts.size > 0) {
      await ctx.store.upsert([...accounts.values()])
    }
    
    try {
      const oldTotalBlocks = stats.totalBlocks
      stats.totalBlocks = (stats.totalBlocks || 0n) + BigInt(blocks.size)
      stats.totalTransactions = (stats.totalTransactions || 0n) + BigInt(transactions.size)
      stats.totalExtrinsics = (stats.totalExtrinsics || 0n) + BigInt(totalExtrinsics)
      stats.totalEvents = (stats.totalEvents || 0n) + BigInt(totalEvents)
      stats.totalTransfers = (stats.totalTransfers || 0n) + BigInt(totalTransfers)
      stats.totalWithdraws = (stats.totalWithdraws || 0n) + BigInt(totalWithdraws)
      stats.totalAccounts = (stats.totalAccounts || 0n) + BigInt(accounts.size)
      stats.lastUpdated = new Date()
      
      await ctx.store.upsert(stats)
      
      // Block addition logging removed for production
      
      // Stats logging reduced for production
    } catch (error) {
      console.error('❌ Error updating stats:', error)
    }
    
    const dbWriteTime = Date.now() - dbWriteStartTime
    const batchTime = Date.now() - batchStartTime
    
    totalDbTime += dbWriteTime
    totalBatchTime += batchTime
    
    const currentTime = Date.now()
    if (currentTime - lastLogTime >= 60000) {
      // Detailed performance logging removed for production
      // Only reset counters for internal tracking
      lastLogTime = currentTime
      totalBlocksProcessed = 0
      totalBatchTime = 0
      totalDbTime = 0
    }
    
    try {
      await cleanupOldBlocks(ctx)
    } catch (error) {
      console.error('Error cleaning up old blocks:', error)
    }
  })
}

main().catch(console.error)
