import { gql } from '@apollo/client'

export const TRANSACTIONS_SUBSCRIPTION = gql`
  subscription Transactions {
    transaction(order_by: {timestamp: desc}, limit: 30) {
      id
      from_id
      to_id
      amount
      status
      timestamp
      block_id
    }
  }
` 