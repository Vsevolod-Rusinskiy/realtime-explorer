# Реализация фронтенда для Real-Time Explorer

## 1. Архитектурная схема (data flow)

```
+-------------------+      +-------------------+      +-------------------+      +-------------------+
|                   | ---> |                   | ---> |                   | ---> |                   |
|   Hasura GraphQL  | -->  |   Apollo Client   | -->  |     Next.js       | -->  |   Пользователь    |
|   Engine          |      | (WebSocket+HTTP)  |      |   (FSD + SSR)     |      |                   |
+-------------------+      +-------------------+      +-------------------+      +-------------------+
```

- Hasura GraphQL предоставляет API на основе схемы PostgreSQL
- Apollo Client обеспечивает связь с GraphQL, включая real-time подписки через WebSocket (graphql-ws)
- Next.js рендерит интерфейс, SSR, FSD-структура
- Пользователь получает real-time обновления через UI

## 2. Структура проекта (FSD + Next.js)

```
/frontend
  /src
    /app         # Next.js app router (роутинг, layout, страницы)
    /widgets     # Композиционные блоки (композиция фич)
    /features    # Фичи, пользовательские сценарии
    /entities    # Бизнес-сущности (блок, транзакция, статистика)
    /shared      # Общие компоненты, api, ui, lib, types
```

### Детальная структура слоев:

```
/src
  /app                  # Next.js App Router
    page.tsx            # Главная страница
    layout.tsx          # Основной лейаут с Apollo Provider
    globals.css         # Глобальные стили
    page.css            # Стили для главной страницы
    
  /widgets              # Композиционные блоки для страниц
    /blocks             # Виджет списка блоков
      blocks_list.tsx
      blocks_list.module.css
      index.ts          # Публичный API
    /transactions       # Виджет списка транзакций
      transactions_list.tsx
      transactions_list.module.css
      index.ts          # Публичный API
    /stats              # Виджет статистики
      stats_widget.tsx
      stats_widget.module.css
      index.ts          # Публичный API
      
  /features             # Бизнес-фичи
    /blocks-list        # Фича списка блоков
      /ui
        blocks_list.tsx
        styles.module.css
      index.ts          # Публичный API
    /transactions-list  # Фича списка транзакций
      /ui
        transactions_list.tsx
        styles.module.css
      index.ts          # Публичный API
    /stats-widget       # Фича виджета статистики
      /ui
        stats_widget.tsx
        styles.module.css
      index.ts          # Публичный API
      
  /entities             # Бизнес-сущности
    /block              # Сущность блока
      /model
        types.ts        # Типы для блока
      /ui
        /block_card     # UI компонент карточки блока
          index.tsx
          styles.module.css
      index.ts          # Публичный API
    /transaction        # Сущность транзакции
      /model
        types.ts        # Типы для транзакции
      /ui
        /transaction_card # UI компонент карточки транзакции
          index.tsx
          styles.module.css
      index.ts          # Публичный API
    /stats              # Сущность статистики
      /model
        types.ts        # Типы для статистики
      /ui
        /stat_card      # UI компонент карточки статистики
          index.tsx
          styles.module.css
      index.ts          # Публичный API
      
  /shared               # Общие ресурсы
    /api                # API клиент
      /model            # GraphQL запросы и подписки
        blocks.ts       # Запросы к блокам
        transactions.ts # Запросы к транзакциям
        stats.ts        # Запросы к статистике
      /config           # Конфигурация API
        apollo.ts       # Настройка Apollo Client
      apollo_provider.tsx # Провайдер Apollo Client
      index.ts          # Публичный API
```

- В папке `/src/app` — роутинг, layout и страницы Next.js (app router)
- Вся логика, UI и бизнес-структура — в FSD-слоях (`widgets`, `features`, `entities`, `shared`)
- Каждый слой имеет публичный API через index.ts файлы
- Соблюдаются правильные границы между слоями через публичные API

## Струтктура главной страницы

- Главная страница (`/`) одновременно отображает:
  - Сверху: виджет статистики с метриками (блоков в секунду, транзакций в секунду)
  - Слева: последние 30 блоков (обновляются в реальном времени)
  - Справа: последние 30 транзакций (обновляются в реальном времени)
- Для стилизации используется CSS Modules
- Вся логика real-time реализована через Apollo Client и GraphQL subscriptions (WebSocket)

### Пример главной страницы

```tsx
// src/app/page.tsx
'use client'

import { BlocksList } from '@/widgets/blocks'
import { TransactionsList } from '@/widgets/transactions'
import { StatsWidget } from '@/widgets/stats'
import './page.css'

export default function Home() {
  return (
    <main className="my_main_container">
      {/* Статистика наверху */}
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
```

## Структура данных

Для отображения данных используются следующие интерфейсы:

### Block (блок)
```typescript
export interface Block {
  id: string         // Хеш блока (primary key)
  hash: string       // Хеш блока
  timestamp: string  // Время создания в строковом формате
  number?: string    // Номер блока (опционально для фронтенда)
  validator?: string // Адрес валидатора (опционально для фронтенда)
  status?: string    // Статус блока (опционально для фронтенда)
  size?: number      // Размер блока (опционально для фронтенда)
}
```

### Transaction (транзакция)
```typescript
export interface Transaction {
  id: string             // Уникальный ID транзакции
  from_id: string | null // ID отправителя
  to_id: string | null   // ID получателя
  amount: string         // Сумма в строковом формате
  status: string         // Статус транзакции
  timestamp: string      // Время в строковом формате
  block_id: string       // ID связанного блока
  fee?: string           // Комиссия (опционально для фронтенда)
  type?: string          // Тип транзакции (опционально для фронтенда)
  data?: string          // Доп. данные (опционально для фронтенда)
}
```

### StatsData (статистика)
```typescript
export interface StatsData {
  blocksPerSecond: number   // Блоков в секунду
  tps: number               // Транзакций в секунду
  totalBlocks?: string      // Всего блоков (опционально)
  totalTransactions?: string // Всего транзакций (опционально)
  totalAccounts?: string    // Всего аккаунтов (опционально)
  averageBlockTime?: number // Среднее время блока (опционально)
  lastBlock?: number        // Последний блок (опционально)
}
```

## Data Flow (квадратики)

```
+-------------------+
|   Пользователь    |
+-------------------+
          |
          v
+-------------------+
|     Next.js       |
|   (SSR/FSD/app)   |
+-------------------+
          |
          v
+-------------------+
|  Apollo Client    |
| (Query/Subscription)
+-------------------+
          |
          v
+-------------------+
|  Hasura GraphQL   |
+-------------------+
          |
          v
+-------------------+
|   PostgreSQL      |
+-------------------+
```

## Основные принципы
- FSD-структура для масштабируемости
- Строгие границы между слоями через публичные API
- Только именованные экспорты
- Вся бизнес-логика — в слоях features и entities
- Вся композиция — в слое widgets
- Все общие модули — в слое shared
- SSR и real-time через Apollo/Hasura
- **Real-time обновления реализуются через GraphQL subscriptions (WebSocket, graphql-ws) и Apollo Client**
- Для стилизации используются CSS Modules

## GraphQL-запросы и подписки

Все GraphQL запросы и подписки вынесены в отдельные файлы в директории `/shared/api/model`:

### Blocks Subscription
```graphql
subscription Blocks {
  block(order_by: {timestamp: desc}, limit: 30) {
    id
    hash
    timestamp
    number
    validator
    status
    size
  }
}
```

### Transactions Subscription
```graphql
subscription Transactions {
  transaction(order_by: {timestamp: desc}, limit: 30) {
    id
    from_id
    to_id
    amount
    status
    timestamp
    block_id
    fee
    type
    data
  }
}
```

### Stats (Recent Blocks) Subscription
```graphql
subscription RecentBlocks {
  block(order_by: {timestamp: desc}, limit: 10) {
    timestamp
  }
}
```

## Реализация статистики в реальном времени

### Компонент StatsWidget
- Использует GraphQL подписку на таблицу `statistics` 
- Подсчитывает реальную скорость блоков и транзакций на основе изменений в БД
- Анимация обновления показывается максимум раз в 4 секунды (throttling)
- Значения не сбрасываются на 0 при отсутствии изменений

### Логика расчета скорости
```typescript
// Обновляется только при наличии реальных изменений
if (timeDiff >= 0.5 && blocksDiff > 0) {
  blocksPerSecond = Math.round((blocksDiff / timeDiff) * 100) / 100
}
if (timeDiff >= 0.5 && txDiff > 0) {
  transactionsPerSecond = Math.round((txDiff / timeDiff) * 100) / 100
}
```

### Анимация с throttling
```typescript
// Анимация только раз в 4 секунды
if (changedFieldsList.length > 0 && (now - lastAnimationTime.current) >= 4000) {
  setChangedFields(changedFieldsList)
  lastAnimationTime.current = now
}
```

## Статус проекта
- ✅ Инициализация Next.js проекта (app router)
- ✅ Создание структуры FSD (app + FSD-слои)
- ✅ Настройка Apollo Client
- ✅ Реализация главной страницы с real-time списками и статистикой
- ✅ Интеграция с Hasura GraphQL (subscriptions)
- ✅ Реализация real-time обновлений
- ✅ Рефакторинг в соответствии с FSD (четкие границы слоев)
- ✅ Исправление логики статистики (GraphQL подписка, расчет скорости)
- ✅ Оптимизация анимации (throttling, предотвращение сброса на 0)
- ⏳ Покрытие тестами 