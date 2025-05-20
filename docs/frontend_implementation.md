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

### Пример экспорта страницы

```typescript
// src/app/dashboard/page.tsx
import { DashboardWidget } from '@/widgets/dashboard'

export default function DashboardPage() {
  return <DashboardWidget />
}
```

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

## 4. Пример страницы по FSD (теперь только в app)

```typescript
// src/app/blocks/page.tsx
import { BlocksWidget } from '@/widgets/blocks'

export default function BlocksPage() {
  return <BlocksWidget />
}
```

## 5. Основные принципы
- FSD-структура для масштабируемости
- Только именованные экспорты
- Вся логика и UI — в FSD-слоях, в app только роутинг, layout и страницы
- SSR и real-time через Apollo/Hasura
- Tailwind CSS для стилей
- **Real-time обновления реализуются через GraphQL subscriptions (WebSocket, graphql-ws) и Apollo Client**

## 6. План реализации
1. Инициализация Next.js проекта (app router)
2. Создание структуры FSD (app + FSD-слои)
3. Настройка Apollo Client и Tailwind CSS
4. Реализация базовых страниц и виджетов через app router
5. Интеграция с Hasura GraphQL (queries, subscriptions)
6. **Реализация real-time обновлений через GraphQL subscriptions (Apollo + graphql-ws):**
   - Установка пакета graphql-ws
   - Настройка split transport в Apollo Client (HTTP для query/mutation, WebSocket для subscription)
   - Использование useSubscription для real-time данных (например, блоки)
   - UI автоматически обновляется при появлении новых данных
   - Добавление анимации появления новых блоков
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
- ⏳ Инициализация Next.js проекта (app router)
- ⏳ Создание структуры FSD (app + FSD-слои)
- ⏳ Настройка Apollo Client и Tailwind CSS
- ⏳ Реализация базовых страниц и виджетов через app router
- ⏳ Интеграция с Hasura GraphQL (queries, subscriptions)
- ⏳ Реализация real-time обновлений
- ⏳ Оптимизация и тесты 