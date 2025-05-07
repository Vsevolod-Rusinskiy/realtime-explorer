#!/bin/bash

set -e

echo "Start deploy realtime-explorer..."

# 1. NVM и Node.js
source ~/.nvm/nvm.sh
nvm use 20.9.0

# 2. Переход в проект
cd /var/www/realtime-explorer/
echo "PWD: $(pwd)"
ls -l .env docker-compose.yml

# 3. Обновление кода.
git pull origin main

# 4. Docker Compose: билд и запуск
# (убедись, что docker-compose.yml настроен на порты 3003 и 5433)
set -a
source .env
set +a
docker-compose pull
docker-compose build

# 5. Переходим в папку squid и выполняем codegen, build и миграции
cd squid
npx squid-typeorm-codegen
npm run build
npx squid-typeorm-migration apply
cd ..

# 6. Запуск всех сервисов
docker-compose up -d

# 7. Проверка статуса
docker-compose ps
docker-compose logs --tail=50

echo "Deploy complete." 