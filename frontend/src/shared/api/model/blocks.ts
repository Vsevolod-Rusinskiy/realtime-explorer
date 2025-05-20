import { gql } from '@apollo/client'

export const BLOCKS_SUBSCRIPTION = gql`
  subscription Blocks {
    block(order_by: {timestamp: desc}, limit: 30) {
      id
      hash
      timestamp
    }
  }
` 