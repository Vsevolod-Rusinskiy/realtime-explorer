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
    /widgets     # Композиционные блоки и бизнес-логика
    /features    # Фичи, пользовательские сценарии
    /entities    # Бизнес-сущности (блок, транзакция, аккаунт, событие)
    /shared      # Общие компоненты, api, ui, lib, types
```

- В папке `/src/app` — роутинг, layout и страницы Next.js (app router)
- Вся логика, UI и бизнес-структура — в FSD-слоях (`widgets`, `features`, `entities`, `shared`)
- Слой `pages` отсутствует, страницы реализуются только в `/src/app`

## Новая структура главной страницы

- Теперь в проекте используется только одна главная страница (`/`), на которой одновременно отображаются два real-time списка:
  - Слева: последние 30 блоков (обновляются в реальном времени)
  - Справа: последние 30 транзакций (обновляются в реальном времени)
- Tailwind CSS полностью удалён из проекта. Для layout и стилизации используется обычный CSS (см. файл `frontend/src/app/page.css`).
- Вся логика real-time реализована через Apollo Client и GraphQL subscriptions (WebSocket).
- Страница реализована в файле `frontend/src/app/page.tsx`.

### Пример главной страницы

```typescript
// src/app/page.tsx
import { BlocksList } from '@/widgets/blocks/blocks_list'
import { TransactionsList } from '@/widgets/transactions/transactions_list'
import './page.css'

export default function Home() {
  return (
    <main className="my_main_container">
      <div className="my_columns_wrapper">
        <div className="my_column">
          <h1 className="my_title">Последние 30 блоков (real-time)</h1>
          <BlocksList />
        </div>
        <div className="my_column">
          <h1 className="my_title">Последние 30 транзакций (real-time)</h1>
          <TransactionsList />
        </div>
      </div>
    </main>
  )
}
```

## Корректировки по структуре

- Вся логика и UI по-прежнему разделены по FSD-слоям (`widgets`, `features`, `entities`, `shared`).
- В папке `/src/app` теперь только одна страница — главная.
- Примеры страниц с отдельными виджетами (blocks, dashboard и т.д.) больше не актуальны.

## 3. Data Flow (квадратики)

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

## 5. Основные принципы (обновлено)
- FSD-структура для масштабируемости
- Только именованные экспорты
- Вся логика и UI — в FSD-слоях, в app только роутинг, layout и одна страница
- SSR и real-time через Apollo/Hasura
- **Real-time обновления реализуются через GraphQL subscriptions (WebSocket, graphql-ws) и Apollo Client**
- Для layout используется обычный CSS, а не Tailwind

## 6. План реализации
1. Инициализация Next.js проекта (app router)
2. Создание структуры FSD (app + FSD-слои)
3. Настройка Apollo Client
4. Реализация главной страницы с двумя real-time списками через app router
5. Интеграция с Hasura GraphQL (queries, subscriptions)
6. **Реализация real-time обновлений через GraphQL subscriptions (Apollo + graphql-ws):**
   - Установка пакета graphql-ws
   - Настройка split transport в Apollo Client (HTTP для query/mutation, WebSocket для subscription)
   - Использование useSubscription для real-time данных (блоки, транзакции)
   - UI автоматически обновляется при появлении новых данных
   - Добавление анимации появления новых блоков и транзакций
7. Оптимизация и тесты

## 7. Документ будет дополняться по мере разработки

# План реализации фронтенда (Next.js + Hasura + Apollo)

## 1. Интеграция Hasura
- ✅ Изменили docker-compose.yml, добавили сервис Hasura
- ✅ Запустили Hasura и проверили доступность GraphQL Console
- ✅ Проверили, что Hasura видит таблицы из PostgreSQL и генерирует GraphQL API
- ✅ Протестировали GraphQL Playground (queries, subscriptions)
- ✅ Настроили базовые разрешения (admin, публичный доступ не требуется)

## 2. Реализация фронтенда (FSD + Next.js)
- ✅ Инициализация Next.js проекта (app router)
- ✅ Создание структуры FSD (app + FSD-слои)
- ✅ Настройка Apollo Client
- ✅ Реализация главной страницы с двумя real-time списками
- ✅ Интеграция с Hasura GraphQL (queries, subscriptions)
- ✅ Реализация real-time обновлений
- ⏳ Оптимизация и тесты 

---

✅ На главной странице реализован real-time вывод блоков и транзакций в две колонки. 