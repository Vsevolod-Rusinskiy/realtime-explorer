'use client'
import { ApolloClient, InMemoryCache, ApolloProvider as ApolloProviderBase, HttpLink, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { ReactNode } from 'react'

const HASURA_GRAPHQL_HTTP = 'http://localhost:3003/v1/graphql'
const HASURA_GRAPHQL_WS = 'ws://localhost:3003/v1/graphql'

console.log('[ApolloProvider] httpLink:', HASURA_GRAPHQL_HTTP)

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

console.log('[ApolloProvider] wsLink:', wsLink)

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

console.log('[ApolloProvider] splitLink:', splitLink)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <ApolloProviderBase client={client}>{children}</ApolloProviderBase>
} 