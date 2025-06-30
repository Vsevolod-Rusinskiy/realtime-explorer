#!/bin/bash

set -e

echo "Starting deploy realtime-explorer..."

# 1. NVM and Node.js
source ~/.nvm/nvm.sh
nvm use 20.9.0

# 2. Navigate to project
cd /var/www/realtime-explorer/
echo "PWD: $(pwd)"
ls -l .env docker-compose.yml

# 3. Update code
git pull origin main

# 4. Docker Compose: build and run
set -a
source .env
set +a
docker-compose pull
docker-compose build

# 5. Start all services (squid will start automatically inside container)
docker-compose up -d

# 6. Check status
docker-compose ps
docker-compose logs --tail=50 squid

echo "Deploy completed." 