import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

    // const HASURA_GRAPHQL_HTTP = 'http://localhost:3003/v1/graphql'
    // const HASURA_GRAPHQL_WS = 'ws://localhost:3003/v1/graphql'

const HASURA_GRAPHQL_HTTP = 'http://193.108.113.149:3003/v1/graphql'
const HASURA_GRAPHQL_WS = 'ws://193.108.113.149:3003/v1/graphql'

const httpLink = new HttpLink({ uri: HASURA_GRAPHQL_HTTP })

const wsLink = typeof window !== 'undefined'
  ? new GraphQLWsLink(createClient({
      url: HASURA_GRAPHQL_WS,
      connectionParams: {
        headers: {
          'x-hasura-admin-secret': 'myadminsecretkey'
        }
      },
      on: {
        closed: (event) => {
          console.error('[ApolloProvider] WebSocket закрыт:', event)
        },
        error: (err) => {
          console.error('[ApolloProvider] WebSocket ошибка:', err)
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