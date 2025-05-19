# GraphQL Schema (public, Hasura)

## Основные queries

```
account(
  distinct_on: [account_select_column!]
  limit: Int
  offset: Int
  order_by: [account_order_by!]
  where: account_bool_exp
): [account!]!
# fetch data from the table: "account"

account_aggregate(
  distinct_on: [account_select_column!]
  limit: Int
  offset: Int
  order_by: [account_order_by!]
  where: account_bool_exp
): account_aggregate!
# fetch aggregated fields from the table: "account"

account_by_pk(id: String!): account
# fetch data from the table: "account" using primary key columns

block(
  distinct_on: [block_select_column!]
  limit: Int
  offset: Int
  order_by: [block_order_by!]
  where: block_bool_exp
): [block!]!
# fetch data from the table: "block"

block_aggregate(
  distinct_on: [block_select_column!]
  limit: Int
  offset: Int
  order_by: [block_order_by!]
  where: block_bool_exp
): block_aggregate!
# fetch aggregated fields from the table: "block"

block_by_pk(id: String!): block
# fetch data from the table: "block" using primary key columns

event(
  distinct_on: [event_select_column!]
  limit: Int
  offset: Int
  order_by: [event_order_by!]
  where: event_bool_exp
): [event!]!
# fetch data from the table: "event"

event_aggregate(
  distinct_on: [event_select_column!]
  limit: Int
  offset: Int
  order_by: [event_order_by!]
  where: event_bool_exp
): event_aggregate!
# fetch aggregated fields from the table: "event"

event_by_pk(id: String!): event
# fetch data from the table: "event" using primary key columns

migrations(
  distinct_on: [migrations_select_column!]
  limit: Int
  offset: Int
  order_by: [migrations_order_by!]
  where: migrations_bool_exp
): [migrations!]!
# fetch data from the table: "migrations"

migrations_aggregate(
  distinct_on: [migrations_select_column!]
  limit: Int
  offset: Int
  order_by: [migrations_order_by!]
  where: migrations_bool_exp
): migrations_aggregate!
# fetch aggregated fields from the table: "migrations"

migrations_by_pk(id: Int!): migrations
# fetch data from the table: "migrations" using primary key columns

statistics(
  distinct_on: [statistics_select_column!]
  limit: Int
  offset: Int
  order_by: [statistics_order_by!]
  where: statistics_bool_exp
): [statistics!]!
# fetch data from the table: "statistics"

statistics_aggregate(
  distinct_on: [statistics_select_column!]
  limit: Int
  offset: Int
  order_by: [statistics_order_by!]
  where: statistics_bool_exp
): statistics_aggregate!
# fetch aggregated fields from the table: "statistics"

statistics_by_pk(id: String!): statistics
# fetch data from the table: "statistics" using primary key columns

transaction(
  distinct_on: [transaction_select_column!]
  limit: Int
  offset: Int
  order_by: [transaction_order_by!]
  where: transaction_bool_exp
): [transaction!]!
# fetch data from the table: "transaction"

transaction_aggregate(
  distinct_on: [transaction_select_column!]
  limit: Int
  offset: Int
  order_by: [transaction_order_by!]
  where: transaction_bool_exp
): transaction_aggregate!
# fetch aggregated fields from the table: "transaction"

transaction_by_pk(id: String!): transaction
# fetch data from the table: "transaction" using primary key columns
``` 