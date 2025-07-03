import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

// Environment variables are required - no fallbacks to localhost
const HASURA_GRAPHQL_HTTP = process.env.NEXT_PUBLIC_HASURA_GRAPHQL_HTTP
const HASURA_GRAPHQL_WS = process.env.NEXT_PUBLIC_HASURA_GRAPHQL_WS
const HASURA_ADMIN_SECRET = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET

// Validate required environment variables
if (!HASURA_GRAPHQL_HTTP) {
  throw new Error('NEXT_PUBLIC_HASURA_GRAPHQL_HTTP environment variable is required')
}
if (!HASURA_GRAPHQL_WS) {
  throw new Error('NEXT_PUBLIC_HASURA_GRAPHQL_WS environment variable is required')
}
if (!HASURA_ADMIN_SECRET) {
  console.warn('WARNING: NEXT_PUBLIC_HASURA_ADMIN_SECRET is not set. GraphQL subscriptions may not work.')
}

const httpLink = new HttpLink({ uri: HASURA_GRAPHQL_HTTP })

const wsLink = typeof window !== 'undefined'
  ? new GraphQLWsLink(createClient({
      url: HASURA_GRAPHQL_WS,
      connectionParams: {
        headers: {
          'x-hasura-admin-secret': HASURA_ADMIN_SECRET
        }
      },
      on: {
        closed: (event) => {
          console.error('[ApolloProvider] WebSocket closed:', event)
        },
        error: (err) => {
          console.error('[ApolloProvider] WebSocket error:', err)
        }
      }
    }))
  : null

const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const def = getMainDefinition(query)
        return def.kind === 'OperationDefinition' && def.operation === 'subscription'
      },
      wsLink,
      httpLink
    )
  : httpLink

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
}) 