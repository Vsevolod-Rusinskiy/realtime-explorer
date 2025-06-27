# General Structure

The `squid` folder contains the following main files and folders:

- `src/` — indexer source code (processing blocks, events, extrinsics)
- `schema.graphql` — description of the data structure to be stored in the database (PostgreSQL)
- `db/` — database migrations
- `package.json` — dependencies and scripts
- `squid.yaml` — main config for the squid project
- `docker-compose.yml` — infrastructure launch (Postgres, GraphQL server, etc.)
- `README.md` — detailed project instructions

# How it works (data flow)

```
+-------------------+
|                   |
|   Substrate net   |
|   (QF TestNet)    |
+-------------------+
          |
          v
+-------------------+
|                   |
|   Indexer         |
|   (src/,          |
|   @subsquid/      |
|   substrate-      |
|   processor)      |
+-------------------+
          |
          v
+-------------------+
|                   |
|   PostgreSQL      |
|   (db/,           |
|   schema.graphql) |
+-------------------+
          |
          v
+-------------------+
|                   |
|   GraphQL API     |
|   (@subsquid/     |
|   graphql-server) |
+-------------------+
          |
          v
+-------------------+
|                   |
|   Frontend        |
|   (Hasura/        |
|   Next.js)        |
+-------------------+
```

# Description of stages

1. **Indexer (`src/`):**
   - Uses the `@subsquid/substrate-processor` package to subscribe to blocks and events of the Substrate network (e.g., QF TestNet).
   - In handlers, you describe which events/extrinsics to process and how to save them to the database.
   - All data is written to PostgreSQL via TypeORM.

2. **Data schema (`schema.graphql`):**
   - Describes which entities and fields will be in the database (e.g., Block, Transaction, Event, Account).
   - Based on this schema, TypeORM models and migrations are automatically generated.

3. **Migrations (`db/`):**
   - After changing the schema, you need to generate migrations (`sqd migration:generate`) and apply them (`sqd migration:apply`).
   - This creates/updates tables in the database.

4. **GraphQL server:**
   - After starting the indexer, the GraphQL API (`@subsquid/graphql-server`) is automatically launched, allowing you to query the data in the database (e.g., get the latest blocks, transactions, etc.).
   - Playground is available at http://localhost:4350/graphql

5. **Infrastructure (`docker-compose.yml`):**
   - You can launch the entire infrastructure with one command (`sqd up`): Postgres, GraphQL server, the indexer itself.

# Main commands

- `npm install` — install dependencies
- `sqd up` — start Postgres and services
- `sqd build` — build TypeScript code
- `sqd run .` — run the indexer and GraphQL API
- `sqd migration:generate` — generate migrations after changing the schema
- `sqd migration:apply` — apply migrations

# How data processing works

- The indexer subscribes to new blocks and events in the Substrate network.
- For each block, your handlers are called, which parse events, extrinsics, and save the necessary data to the database.
- The GraphQL server automatically exposes this data via the API.

# How this fits our plan

Everything matches the architecture from the plan:

QF TestNet → Squid SDK (indexer) → PostgreSQL → Hasura/GraphQL → Frontend 