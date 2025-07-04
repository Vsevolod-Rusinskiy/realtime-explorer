# 🔍 Realtime Blockchain Explorer

> Real-time blockchain explorer for QF TestNet with live data visualization

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-compose-blue?style=flat-square&logo=docker)

## 📋 Overview

Realtime Blockchain Explorer is a full-stack application that provides real-time monitoring and visualization of QF TestNet blockchain data. Built with modern web technologies, it offers live updates of blocks, transactions, and network statistics.

### ✨ Key Features

- 🚀 **Real-time updates** - Live blockchain data through WebSocket subscriptions
- 📊 **Network statistics** - Blocks per second, transaction throughput, network metrics
- 🔄 **Block explorer** - Browse latest blocks with detailed information
- 💰 **Transaction monitoring** - Real-time transaction feed with transfer details
- 🎨 **Modern UI** - Clean, responsive interface with live animations
- 🏗️ **Scalable architecture** - Microservices with GraphQL API

## 🛠️ Tech Stack

### Backend
- **[Squid SDK](https://subsquid.io/)** - Blockchain data indexer
- **[PostgreSQL](https://postgresql.org/)** - Relational database
- **[Hasura GraphQL Engine](https://hasura.io/)** - Auto-generated GraphQL API
- **[Docker](https://docker.com/)** - Containerization

### Frontend  
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[Apollo Client](https://apollographql.com/docs/react/)** - GraphQL client with subscriptions
- **[TypeScript](https://typescriptlang.org/)** - Type safety
- **[Feature-Sliced Design](https://feature-sliced.design/)** - Architecture methodology
- **CSS Modules** - Styling

### DevOps
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD pipeline
- **[Docker Compose](https://docs.docker.com/compose/)** - Local development
- **PM2** - Production process management

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │     │                 │
│   QF TestNet    │────▶│   Squid SDK     │────▶│   PostgreSQL    │────▶│ Hasura GraphQL  │
│ (WebSocket RPC) │     │   Indexer       │     │   Database      │     │    Engine       │
│                 │     │                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
                                                                                   │
                                                                                   │
                                                                                   ▼
                                                                        ┌─────────────────┐
                                                                        │                 │
                                                                        │   Next.js       │
                                                                        │   Frontend      │
                                                                        │                 │
                                                                        └─────────────────┘
```

### Data Flow

1. **Squid SDK** subscribes to QF TestNet blocks via WebSocket
2. **Blockchain data** is processed and stored in PostgreSQL
3. **Hasura** auto-generates GraphQL API from database schema
4. **Next.js frontend** receives real-time updates via GraphQL subscriptions
5. **UI updates** instantly when new blockchain data arrives

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **Docker** and **Docker Compose**
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/your-username/realtime-explorer.git
cd realtime-explorer
```

### 2. Environment Setup

Create environment files from examples:

```bash
# Backend configuration
cp squid/.env.example squid/.env

# Frontend configuration (create manually)
touch frontend/.env.local
```

Edit the `.env` files with your configuration:

**squid/.env:**
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=explorer_db
DB_USER=postgres
DB_PASS=your_secure_password

# Blockchain RPC
RPC_ENDPOINT=wss://testnet.qfnetwork.xyz
```

**frontend/.env.local:**
```bash
# GraphQL endpoints (adjust ports to match your setup)
NEXT_PUBLIC_HASURA_GRAPHQL_HTTP=http://localhost:YOUR_HASURA_PORT/v1/graphql
NEXT_PUBLIC_HASURA_GRAPHQL_WS=ws://localhost:YOUR_HASURA_PORT/v1/graphql

# ⚠️ SECURITY WARNING: Do not expose admin secret in production
# Use regular user tokens instead
NEXT_PUBLIC_HASURA_ADMIN_SECRET=your_hasura_admin_secret
```

> **Note:** Ports are configurable via environment variables. Check `docker-compose.yml` for default port mappings.

### 3. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access Applications

- **Frontend**: http://localhost:3000
- **Hasura Console**: http://localhost:YOUR_HASURA_PORT/console
- **GraphQL API**: http://localhost:YOUR_HASURA_PORT/v1/graphql

> **Note:** Replace `YOUR_HASURA_PORT` with the port you configured (default in docker-compose is mapped accordingly).



