import { gql } from '@apollo/client'

export const RECENT_BLOCKS_SUBSCRIPTION = gql`
  subscription RecentBlocks {
    block(order_by: {timestamp: desc}, limit: 10) {
      timestamp
    }
  }
` 