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

const rpcUrl = 'wss://test.qfnetwork.xyz/wss'
const depth = 50 // только real-time и "хвост" новых блоков

export async function createProcessor() {
  const provider = new WsProvider(rpcUrl)
  const api = await ApiPromise.create({ provider })
  const lastHeader = await api.rpc.chain.getHeader()
  const lastBlock = lastHeader.number.toNumber()
  await api.disconnect()
  const startBlock = Math.max(0, lastBlock - depth)

  return new SubstrateBatchProcessor()
    .setRpcEndpoint({
      url: rpcUrl,
      rateLimit: 10
    })
    .setBlockRange({ from: startBlock })
    .addEvent({
      name: [
        'Balances.Transfer',
        'Balances.Withdraw',
        'Balances.Deposit',
        'System.ExtrinsicSuccess',
        'System.ExtrinsicFailed'
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
