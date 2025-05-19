import { ApolloClient, InMemoryCache, ApolloProvider as ApolloProviderBase } from '@apollo/client'
import { ReactNode } from 'react'

const HASURA_GRAPHQL_URL = 'http://localhost:8080/v1/graphql'

const client = new ApolloClient({
  uri: HASURA_GRAPHQL_URL,
  cache: new InMemoryCache(),
})

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <ApolloProviderBase client={client}>{children}</ApolloProviderBase>
} 