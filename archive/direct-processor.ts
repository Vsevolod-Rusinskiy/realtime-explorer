import * as dotenv from 'dotenv'
import { TypeormDatabase } from '@subsquid/typeorm-store'
import { DataSource } from 'typeorm'
import { processor } from './processor'
import { Account, Block, Transaction, Statistics } from './model'
import { initProcessor } from './initProcessor'

// Загружаем .env файл
dotenv.config()

// Создаем конфигурацию TypeORM
const dataSourceConfig = {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'squid',
    synchronize: false,
    logging: true,
    entities: [Account, Block, Transaction, Statistics]
}

// Количество последних блоков для обработки
const BLOCKS_LIMIT = 10

// Сколько батчей обработать
const MAX_BATCHES = 2

// Счетчик батчей и общего количества блоков
let batchCount = 0
let totalProcessedBlocks = 0
let totalProcessedTransactions = 0

async function main() {
    console.log('Запуск процессора с прямыми настройками TypeORM...')
    console.log(`Будет обработано только ${MAX_BATCHES} батчей блоков`)
    
    try {
        // Создаем источник данных TypeORM
        const dataSource = new DataSource(dataSourceConfig)
        
        // Подключаемся к базе данных напрямую
        await dataSource.initialize()
        console.log('Соединение с базой данных успешно установлено')
        
        // Проверяем структуру таблиц
        console.log('Проверка структуры таблиц...')
        const tables = await dataSource.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`)
        console.log('Таблицы в базе данных:', tables.map((t: any) => t.tablename))
        
        // Очищаем таблицы для начала с чистого листа
        console.log('Очистка таблиц перед обработкой...')
        await dataSource.query(`TRUNCATE TABLE block, transaction, account, statistics CASCADE`)
        console.log('Таблицы очищены')
        
        // Закрываем явное соединение
        await dataSource.destroy()
        
        // Инициализируем процессор с настройками начального блока
        // и ограничиваем количество блоков
        await initProcessor(BLOCKS_LIMIT)
        
        // Запускаем процессор с нашими TypeORM настройками
        await processor.run(new TypeormDatabase({
            supportHotBlocks: true,
            stateSchema: 'public',
            isolationLevel: 'READ COMMITTED'
        }), async (ctx) => {
            try {
                batchCount++
                console.log(`Обработка батча #${batchCount} из ${MAX_BATCHES}...`)

                // Если достигли максимального количества батчей, останавливаем процессор сразу
                if (batchCount > MAX_BATCHES) {
                    console.log(`Достигнуто ограничение в ${MAX_BATCHES} батчей, завершаем обработку.`)
                    process.exit(0)
                    return
                }
                
                // Получаем данные блоков
                const blocks: Block[] = []
                const processedAccounts = new Map<string, Account>()
                const transactions: Transaction[] = []
                
                // Используем только последние BLOCKS_LIMIT блоков из текущего батча
                const limitedBlocks = ctx.blocks.slice(-BLOCKS_LIMIT)
                console.log(`Ограничиваем до ${BLOCKS_LIMIT} блоков из ${ctx.blocks.length} полученных`)
                
                for (const item of limitedBlocks) {
                    const block = new Block({
                        id: item.header.height.toString(),
                        hash: item.header.hash,
                        timestamp: new Date(item.header.timestamp || Date.now()),
                        validator: item.header.validator || '',
                        status: 'finalized'
                    })
                    blocks.push(block)
                    
                    // Обработка транзакций в блоке
                    for (const extrinsic of item.extrinsics) {
                        try {
                            // Создаем идентификатор транзакции
                            const txId = `${item.header.height}-${extrinsic.index}`
                            
                            // Получаем вызов и его данные, если они доступны
                            const call = extrinsic.call ? await extrinsic.getCall() : null
                            
                            // Создаем транзакцию с доступными данными
                            const tx = new Transaction({
                                id: txId,
                                blockNumber: parseInt(block.id),
                                timestamp: new Date(item.header.timestamp || Date.now()),
                                status: extrinsic.success ? 'success' : 'failed',
                                type: call?.name || 'unknown'
                            })
                            tx.block = block
                            
                            // Устанавливаем плату за транзакцию, если доступна
                            if (extrinsic.fee) {
                                tx.fee = extrinsic.fee
                            }
                            
                            // Анализируем события для поиска информации о переводе
                            for (const event of extrinsic.events) {
                                console.log(`Событие: ${event.name}, индекс: ${event.index}, блок: ${item.header.height}`)
                                
                                if (event.name === 'Balances.Transfer') {
                                    try {
                                        console.log('Найдено событие Balances.Transfer!')
                                        const args = event.args
                                        console.log('Аргументы события:', JSON.stringify(args))
                                        
                                        if (args && args.from && args.to) {
                                            // Извлекаем адреса отправителя и получателя
                                            const fromAddress = args.from.toString()
                                            const toAddress = args.to.toString()
                                            console.log(`Перевод от ${fromAddress} к ${toAddress}`)
                                            
                                            // Добавляем аккаунты, если они еще не обработаны
                                            if (!processedAccounts.has(fromAddress)) {
                                                processedAccounts.set(fromAddress, new Account({
                                                    id: fromAddress,
                                                    balance: 0n,
                                                    updatedAt: new Date()
                                                }))
                                                console.log(`Добавлен аккаунт отправителя: ${fromAddress}`)
                                            }
                                            
                                            if (!processedAccounts.has(toAddress)) {
                                                processedAccounts.set(toAddress, new Account({
                                                    id: toAddress,
                                                    balance: 0n,
                                                    updatedAt: new Date()
                                                }))
                                                console.log(`Добавлен аккаунт получателя: ${toAddress}`)
                                            }
                                            
                                            // Устанавливаем отправителя и получателя
                                            const sender = processedAccounts.get(fromAddress)
                                            const recipient = processedAccounts.get(toAddress)
                                            
                                            if (sender) {
                                                tx.from = sender
                                                console.log(`Установлен отправитель для транзакции ${txId}: ${fromAddress}`)
                                            }
                                            
                                            if (recipient) {
                                                tx.to = recipient
                                                console.log(`Установлен получатель для транзакции ${txId}: ${toAddress}`)
                                            }
                                            
                                            // Устанавливаем сумму перевода, если доступна
                                            if (args.amount) {
                                                tx.amount = BigInt(args.amount.toString())
                                                console.log(`Установлена сумма для транзакции ${txId}: ${args.amount.toString()}`)
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Ошибка при обработке события Balances.Transfer:', error)
                                    }
                                }
                                
                                // Также проверяем события связанные с балансами и другими действиями
                                else if (event.name.startsWith('Balances.')) {
                                    console.log(`Обнаружено другое событие баланса: ${event.name}`)
                                    console.log('Аргументы:', JSON.stringify(event.args))
                                }
                            }
                            
                            transactions.push(tx)
                        } catch (error) {
                            console.error('Ошибка при обработке экстринзика:', error)
                        }
                    }
                }
                
                // Обновляем счетчики общего количества блоков и транзакций
                totalProcessedBlocks += blocks.length
                totalProcessedTransactions += transactions.length
                
                console.log(`Обработка ${blocks.length} блоков с ${transactions.length} транзакциями и ${processedAccounts.size} аккаунтами...`)
                console.log(`Всего обработано блоков: ${totalProcessedBlocks}, транзакций: ${totalProcessedTransactions}`)
                
                if (processedAccounts.size > 0) {
                    console.log('Найденные аккаунты:', [...processedAccounts.keys()])
                }
                
                // Сохраняем блоки
                if (blocks.length > 0) {
                    await ctx.store.upsert(blocks)
                    console.log('Блоки успешно сохранены')
                }
                
                // Сохраняем аккаунты
                if (processedAccounts.size > 0) {
                    await ctx.store.upsert(Array.from(processedAccounts.values()))
                    console.log('Аккаунты успешно сохранены')
                }
                
                // Сохраняем транзакции
                if (transactions.length > 0) {
                    await ctx.store.upsert(transactions)
                    console.log('Транзакции успешно сохранены')
                }
                
                // Создаем или обновляем статистику
                try {
                    // Создаем новую статистику с общим количеством обработанных блоков
                    const stats = new Statistics({
                        id: 'current',
                        totalBlocks: totalProcessedBlocks, // Общее количество блоков
                        totalTransactions: totalProcessedTransactions, // Общее количество транзакций
                        totalAccounts: processedAccounts.size,
                        averageBlockTime: 0,
                        lastBlock: blocks.length > 0 ? parseInt(blocks[blocks.length - 1].id) : 0,
                        updatedAt: new Date()
                    })
                    
                    await ctx.store.upsert(stats)
                    console.log(`Статистика успешно обновлена: ${totalProcessedBlocks} блоков, ${totalProcessedTransactions} транзакций`)
                } catch (error) {
                    console.error('Ошибка при обновлении статистики:', error)
                }
                
                console.log('Обработка батча успешно завершена')
            } catch (error) {
                console.error('Ошибка при обработке блока:', error)
                throw error
            }
        })
    } catch (error) {
        console.error('Критическая ошибка:', error)
        process.exit(1)
    }
}

main().catch(console.error) 