'use client'

import { BlocksList } from '@/widgets/blocks/blocks_list'
import { TransactionsList } from '@/widgets/transactions/transactions_list'
import { StatsWidget } from '@/widgets/stats'
import './page.css'

export default function Home() {
  console.log('[Home] page render')
  return (
    <main className="my_main_container">
      {/* Статистика наверху */}
      <StatsWidget />
      
      <div className="my_columns_wrapper">
        <div className="my_column">
          <h1 className="my_title">Блоки</h1>
          <BlocksList />
        </div>
        <div className="my_column">
          <h1 className="my_title">Транзакции</h1>
          <TransactionsList />
        </div>
      </div>
    </main>
  )
}
