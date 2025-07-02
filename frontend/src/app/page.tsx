'use client'

import { BlocksList } from '@/widgets/blocks'
import { TransactionsList } from '@/widgets/transactions'
import { StatsWidget } from '@/widgets/stats'
import './page.css'

export default function Home() {
  return (
    <main className="my_main_container">
      <StatsWidget />
      
      <div className="my_columns_wrapper">
        <div className="my_column">
          <BlocksList />
        </div>
        <div className="my_column">
          <TransactionsList />
        </div>
      </div>
    </main>
  )
}
