'use client'
import { ApolloProvider as ApolloProviderBase } from '@apollo/client'
import { ReactNode } from 'react'
import { apolloClient } from './config/apollo'

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <ApolloProviderBase client={apolloClient}>{children}</ApolloProviderBase>
} 