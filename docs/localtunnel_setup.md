# Запуск проекта через Localtunnel

## Установка Localtunnel
Установите Localtunnel, если он еще не установлен:
```bash
npm install -g localtunnel
```

## Запуск проекта для демо заказчику

### 1. Запустите API сервер (порт 3003)
```bash
# Убедитесь что ваш API/Hasura запущен на порту 3003
```

### 2. Создайте туннель для API
```bash
ngrok http 3003
```
Получите ссылку вида: `https://abc123.ngrok-free.app`

### 3. Обновите конфигурацию фронтенда
В файле `frontend/src/shared/api/config/apollo.ts` замените:
```typescript
const HASURA_GRAPHQL_HTTP = 'https://ваша_ngrok_ссылка_для_API.ngrok-free.app/v1/graphql'
const HASURA_GRAPHQL_WS = 'wss://ваша_ngrok_ссылка_для_API.ngrok-free.app/v1/graphql'
```

### 4. Запустите фронтенд проект
```bash
cd frontend
npm run dev
```

### 5. Создайте туннель для фронтенда
```bash
lt --port 3000
```
Получите публичную ссылку вида: `https://odd-cars-wait.loca.lt`

### 6. Получите пароль для Localtunnel
```bash
curl https://loca.lt/mytunnelpassword
```

### 7. Поделитесь ссылкой и паролем с заказчиком

## Важные моменты
- Ngrok ограничен одним туннелем на бесплатном аккаунте
- Localtunnel требует пароль для первого входа с нового IP
- Оба сервиса работают только пока ваш компьютер включен
- Туннели остаются активными пока вы не остановите их (Ctrl+C)

## Альтернативы
- **Serveo**: `ssh -R 80:localhost:3000 serveo.net`
- **Cloudflare Tunnel**: требует регистрацию
- **PageKite**: платный после пробного периода 