import { gql } from '@apollo/client'

export const RECENT_BLOCKS_SUBSCRIPTION = gql`
  subscription RecentBlocks {
    block(order_by: {timestamp: desc}, limit: 10) {
      timestamp
    }
  }
`

export const STATISTICS_SUBSCRIPTION = gql`
  subscription Statistics {
    statistics(where: {id: {_eq: "1"}}) {
      id
      total_blocks
      total_transactions
      total_transfers
      total_events
      total_extrinsics
      total_accounts
      last_updated
    }
  }
` 