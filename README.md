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

### 4. Manual Setup (Alternative)

If you prefer to run services individually:

```bash
# Start PostgreSQL
docker run -d \
  --name explorer-postgres \
  -e POSTGRES_DB=explorer_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  postgres:15

# Start Hasura (adjust port as needed)
docker run -d \
  --name explorer-hasura \
  -e HASURA_GRAPHQL_DATABASE_URL=postgresql://postgres:your_secure_password@localhost:5432/explorer_db \
  -e HASURA_GRAPHQL_ENABLE_CONSOLE=true \
  -e HASURA_GRAPHQL_ADMIN_SECRET=your_hasura_admin_secret \
  -p YOUR_HASURA_PORT:8080 \
  hasura/graphql-engine:latest

# Start Squid indexer
cd squid
npm install
npm run build
npm run migration:apply
npm run start

# Start frontend (in another terminal)
cd frontend  
npm install
npm run dev
```

### 5. Access Applications

- **Frontend**: http://localhost:3000
- **Hasura Console**: http://localhost:YOUR_HASURA_PORT/console
- **GraphQL API**: http://localhost:YOUR_HASURA_PORT/v1/graphql

> **Note:** Replace `YOUR_HASURA_PORT` with the port you configured (default in docker-compose is mapped accordingly).

## 📁 Project Structure

```
realtime-explorer/
├── squid/                    # Blockchain indexer (Squid SDK)
│   ├── src/
│   │   ├── processor.ts      # Blockchain connection setup
│   │   ├── main.ts          # Data processing logic
│   │   ├── model/           # Database entities
│   │   │   └── generated/   # Auto-generated models
│   │   ├── types/           # TypeScript type definitions
│   │   └── config.ts        # Configuration utilities
│   ├── db/
│   │   └── migrations/      # Database migration files
│   ├── schema.graphql       # GraphQL schema
│   ├── squid.yaml          # Squid configuration
│   └── package.json
│
├── frontend/                # Next.js application
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── widgets/         # Page-level components (FSD)
│   │   │   ├── blocks/      # Blocks widget
│   │   │   ├── stats/       # Statistics widget
│   │   │   └── transactions/ # Transactions widget
│   │   ├── features/        # Business features (FSD)
│   │   │   ├── blocks-list/
│   │   │   ├── stats-widget/
│   │   │   └── transactions-list/
│   │   ├── entities/        # Business entities (FSD)
│   │   │   ├── block/
│   │   │   ├── stats/
│   │   │   └── transaction/
│   │   └── shared/          # Shared utilities (FSD)
│   │       ├── api/         # GraphQL client & queries
│   │       ├── lib/         # Utilities & helpers
│   │       ├── types/       # TypeScript types
│   │       └── ui/          # Reusable UI components
│   └── package.json
│
├── docs/                    # Project documentation
├── .github/
│   └── workflows/           # CI/CD configuration
├── docker-compose.yml       # Development environment
└── README.md               # This file
```

### Frontend Architecture (Feature-Sliced Design)

The frontend follows [Feature-Sliced Design](https://feature-sliced.design/) methodology:

```
src/
├── app/                     # Next.js routing & pages
├── widgets/                 # Composite UI blocks
│   ├── blocks/             # Blocks list widget
│   ├── transactions/       # Transactions list widget
│   └── stats/              # Statistics widget
├── features/               # User scenarios
│   ├── blocks-list/        # Block browsing feature
│   ├── transactions-list/  # Transaction monitoring
│   └── stats-widget/       # Network statistics
├── entities/               # Business entities
│   ├── block/              # Block entity & UI
│   ├── transaction/        # Transaction entity & UI
│   └── stats/              # Statistics entity & UI
└── shared/                 # Shared resources
    ├── api/                # GraphQL client & queries
    ├── ui/                 # Reusable UI components
    └── lib/                # Utilities & helpers
```

## 🔧 Development

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Backend Development

```bash
cd squid

# Install dependencies
npm install

# Generate database migrations
npm run build
npm run migration:generate

# Apply migrations
npm run migration:apply

# Start indexer
npm run start
```

### Database Management

```bash
# Access PostgreSQL
docker exec -it explorer-postgres psql -U postgres -d explorer_db

# View tables
\dt

# Check latest blocks
SELECT id, number, timestamp FROM block ORDER BY number DESC LIMIT 10;
```

## 📊 Features in Detail

### Real-time Block Monitoring
- Live feed of new blocks as they're mined
- Block details including hash, timestamp, validator
- Visual indicators for new block arrivals

### Transaction Tracking  
- Real-time transaction stream
- Transfer details with amounts and addresses
- Transaction status and fee information

### Network Statistics
- Blocks per second calculation
- Transaction throughput metrics
- Network performance indicators
- Historical data visualization

### GraphQL API
- Auto-generated from database schema
- Real-time subscriptions via WebSocket
- RESTful queries for historical data
- Built-in GraphiQL explorer

## 🔄 Data Processing

### Blockchain Indexing
- Connects to QF TestNet via WebSocket
- Processes blocks, transactions, and events
- Maintains last 1000 blocks for performance
- Automatic cleanup of old data

### Real-time Updates
- GraphQL subscriptions for live data
- WebSocket connections for instant updates
- Optimistic UI updates
- Error handling and reconnection

## 🚢 Deployment

### Production Environment

The application is configured for production deployment with:

- **Docker containerization** for all services
- **GitHub Actions** for automated CI/CD
- **Environment variable configuration**
- **Health checks** and monitoring
- **Horizontal scaling** capabilities

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `postgres` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASS` | Database password | Required |
| `NEXT_PUBLIC_HASURA_GRAPHQL_HTTP` | Hasura HTTP endpoint | Required |
| `NEXT_PUBLIC_HASURA_GRAPHQL_WS` | Hasura WebSocket endpoint | Required |
| `NEXT_PUBLIC_HASURA_ADMIN_SECRET` | Hasura admin secret | Required |

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests  
cd squid
npm run test

# E2E tests
npm run test:e2e
```

## 📈 Performance

### Optimization Features
- **Efficient data indexing** with 1000 block limit
- **Real-time subscriptions** without polling
- **Optimistic UI updates** for instant feedback
- **Connection pooling** for database access
- **Caching strategies** for frequently accessed data

### Monitoring
- Real-time performance metrics
- Error tracking and logging
- Health check endpoints
- Resource usage monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **QF TestNet**: [Official Documentation](https://qfnetwork.xyz)
- **Squid SDK**: [Documentation](https://docs.subsquid.io)
- **Hasura**: [GraphQL Engine](https://hasura.io)
- **Feature-Sliced Design**: [Methodology](https://feature-sliced.design)

## 🙏 Acknowledgments

- QF Network team for providing TestNet access
- Subsquid team for the excellent indexing SDK
- Hasura team for the GraphQL engine
- Next.js team for the amazing React framework

---

**Built with ❤️ using modern web technologies**