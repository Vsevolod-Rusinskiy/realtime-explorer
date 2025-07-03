export { ApolloProvider } from './apollo_provider'
export * from './config/apollo'
export * from './model/blocks'
export * from './model/transactions'
export * from './model/stats'

export { apolloClient } from './config/apollo'
export { ApolloProvider as CustomApolloProvider } from './apollo_provider'

export { 
  RECENT_BLOCKS_SUBSCRIPTION, 
  STATISTICS_SUBSCRIPTION,
  LATEST_BLOCKS_SUBSCRIPTION
} from './model/stats'
export { BLOCKS_SUBSCRIPTION } from './model/blocks'
export { TRANSACTIONS_SUBSCRIPTION } from './model/transactions'

export { useBlockSpeed } from './hooks/use_block_speed' 