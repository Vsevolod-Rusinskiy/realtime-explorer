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
- Apollo Client обеспечивает связь с GraphQL, включая real-time подписки
- Next.js рендерит интерфейс, SSR, FSD-структура
- Пользователь получает real-time обновления через UI

## 2. Структура проекта (FSD + Next.js)

```
/frontend
  /src
    /app         # Next.js app router (роутинг, layout, подключение страниц через именованные экспорты)
    /pages       # FSD-страницы (feature-sliced), только именованные экспорты
    /widgets     # Композиционные блоки и бизнес-логика
    /features    # Фичи, пользовательские сценарии
    /entities    # Бизнес-сущности (блок, транзакция, аккаунт, событие)
    /shared      # Общие компоненты, api, ui, lib, types
```

- В папке `/src/app` — только роутинг и layout Next.js, подключение страниц через именованные экспорты из `/src/pages`
- В папке `/src/pages` — FSD-страницы, только именованные экспорты (дефолтные не используем)
- Вся логика, UI и бизнес-структура — в FSD-слоях

### Пример экспорта/импорта страницы

```typescript
// src/pages/dashboard/index.ts
export { DashboardPage } from './ui/dashboard-page'

// src/app/dashboard/page.tsx
import { DashboardPage } from '@/pages/dashboard'

export default function Page() {
  return <DashboardPage />
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

## 4. Пример именованного экспорта страницы по FSD

```typescript
// src/pages/dashboard/index.ts
export { DashboardPage } from './ui/dashboard-page'
```

## 5. Основные принципы
- FSD-структура для масштабируемости
- Только именованные экспорты
- Вся логика и UI — в FSD-слоях, в app только роутинг и layout
- SSR и real-time через Apollo/Hasura
- Tailwind CSS для стилей

## 6. План реализации
1. Инициализация Next.js проекта (app router)
2. Создание структуры FSD с двумя папками pages (app и FSD/pages)
3. Настройка Apollo Client и Tailwind CSS
4. Реализация базовых страниц и виджетов через именованные экспорты
5. Интеграция с Hasura GraphQL (queries, subscriptions)
6. Реализация real-time обновлений
7. Оптимизация и тесты

## 7. Документ будет дополняться по мере разработки 