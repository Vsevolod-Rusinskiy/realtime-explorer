import {
    SubstrateBatchProcessor, 
    SubstrateBatchProcessorFields, 
    BlockHeader, 
    DataHandlerContext, 
    Event as _Event, 
    Call as _Call, 
    Extrinsic as _Extrinsic
} from '@subsquid/substrate-processor'
import {Store} from '@subsquid/typeorm-store'

// Начальная конфигурация процессора 
export const processor = new SubstrateBatchProcessor()
    .setRpcEndpoint({
        url: process.env.RPC_QF_WS || 'wss://dev.qfnetwork.xyz/wss',
        rateLimit: 10,
        maxBatchCallSize: 10 // Совпадает с BLOCKS_LIMIT
    })
    .setBlockRange({ from: 14080000 - 100000 }) // Начинаем с более раннего блока
    
    // Добавляем все нужные события для полной индексации
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
    
    // Устанавливаем все необходимые поля с оптимизацией запросов
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

export type Fields = SubstrateBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Event = _Event<Fields>
export type Call = _Call<Fields>
export type Extrinsic = _Extrinsic<Fields>
export type ProcessorContext = DataHandlerContext<Store, Fields>
