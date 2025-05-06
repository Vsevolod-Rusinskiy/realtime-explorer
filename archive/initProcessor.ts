import { ApiPromise, WsProvider } from '@polkadot/api'
import { processor } from './processor'

/**
 * Инициализирует процессор с динамическим определением начального блока
 * Эта функция должна быть вызвана перед запуском процессора
 * @param blocksLimit Максимальное количество блоков для обработки (по умолчанию 10)
 */
export async function initProcessor(blocksLimit: number = 10): Promise<void> {
  try {
    console.log('Инициализация процессора и определение начального блока...')
    console.log(`Будут обработаны последние ${blocksLimit} блоков`)
    
    // Подключаемся к RPC эндпоинту
    const provider = new WsProvider(process.env.RPC_QF_WS || 'wss://dev.qfnetwork.xyz/wss')
    const api = await ApiPromise.create({ provider })
    
    // Получаем финализированный хэш
    const finalizedHash = await api.rpc.chain.getFinalizedHead()
    console.log(`Финализированный хэш: ${finalizedHash.toString()}`)
    
    // Получаем заголовок блока
    const finalizedHeader = await api.rpc.chain.getHeader(finalizedHash)
    const finalizedBlockNumber = finalizedHeader.number.toNumber()
    console.log(`Номер финализированного блока: ${finalizedBlockNumber}`)
    
    // Используем параметр blocksLimit как отступ
    const blockOffset = blocksLimit
    
    // Устанавливаем стартовый блок с отступом от текущего
    const startingBlock = Math.max(1, finalizedBlockNumber - blockOffset)
    console.log(`Установлен стартовый блок: ${startingBlock}`)
    
    // Настраиваем процессор на использование этого блока как начального
    processor.setBlockRange({ from: startingBlock })
    
    // Закрываем соединение
    await api.disconnect()
    
    console.log('Инициализация процессора завершена успешно')
  } catch (error) {
    console.error('Ошибка при инициализации процессора:', error)
    throw error
  }
} 