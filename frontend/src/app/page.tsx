'use client'

import { BlocksList } from '@/widgets/blocks/blocks_list'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-2xl font-bold mb-4">Последние 10 блоков (real-time)</h1>
      <BlocksList />
    </main>
  )
}
