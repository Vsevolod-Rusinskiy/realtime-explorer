import { ApiPromise, WsProvider } from '@polkadot/api'
import {
  SubstrateBatchProcessor,
  SubstrateBatchProcessorFields,
  BlockHeader,
  DataHandlerContext,
  Event as _Event,
  Call as _Call,
  Extrinsic as _Extrinsic
} from '@subsquid/substrate-processor'

import { RPC_URL, DEPTH } from './config'
import { DB_CONFIG } from './db-config'

// Выводим информацию о настройках подключения к БД
console.log('Используем настройки подключения к базе данных:')
console.log(`- Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`)
console.log(`- Database: ${DB_CONFIG.database}`)

export async function createProcessor() {
  const provider = new WsProvider(RPC_URL)
  const api = await ApiPromise.create({ provider })
  const lastHeader = await api.rpc.chain.getHeader()
  const lastBlock = lastHeader.number.toNumber()
  await api.disconnect()
  const startBlock = Math.max(0, lastBlock - DEPTH)

  return new SubstrateBatchProcessor()
    .setRpcEndpoint({
      url: RPC_URL,
      rateLimit: 10
    })
    .setBlockRange({ from: startBlock })
    .addEvent({
      name: [
        'Balances.Withdraw',
        'Balances.Deposit',
        'System.ExtrinsicSuccess',
        'System.ExtrinsicFailed',
        'balances.Transfer',
        'balances.Issued',
        'staking.EraPaid',
        'staking.Withdrawn',
        'staking.Bonded',
        'staking.Unbonded'
      ],
      extrinsic: true
    })
    .setFields({
      block: {
        timestamp: true,
        specVersion: true,
        validator: true
      },
      event: {
        args: true,
        indexInBlock: true,
        phase: true
      },
      call: {
        args: true,
        error: true,
        success: true
      },
      extrinsic: {
        hash: true,
        fee: true,
        tip: true,
        success: true,
        error: true
      }
    })
}

export type Fields = SubstrateBatchProcessorFields<ReturnType<typeof createProcessor>>
export type Block = BlockHeader<Fields>
export type Event = _Event<Fields>
export type Call = _Call<Fields>
export type Extrinsic = _Extrinsic<Fields>
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>
