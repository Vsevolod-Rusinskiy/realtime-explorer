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

# 5. Запуск всех сервисов (squid запустится автоматически внутри контейнера)
docker-compose up -d

# 6. Проверка статуса
docker-compose ps
docker-compose logs --tail=50 squid

echo "Deploy complete." 