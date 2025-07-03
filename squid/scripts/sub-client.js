const WebSocket = require('ws')
const { createClient } = require('graphql-ws');

// Environment variables are required for connection
const port = process.env.GQL_PORT
const host = process.env.GQL_HOST  
const proto = process.env.GQL_PROTO

// Validate required environment variables
if (!port) {
  throw new Error('GQL_PORT environment variable is required')
}
if (!host) {
  throw new Error('GQL_HOST environment variable is required')
}
if (!proto) {
  throw new Error('GQL_PROTO environment variable is required')
}


const client = createClient({
  webSocketImpl: WebSocket,
  url: `${proto}://${host}:${port}/graphql`,
});

client.subscribe(
  {
    query: `
    subscription {
        transfers(limit: 5, orderBy: timestamp_DESC) {
            amount
            blockNumber
            from {
              id
            }
            to {
              id
            }
        }
    }  
    `,
  },
  {
    next: (data) => {
      console.log(`New transfers: ${JSON.stringify(data)}`);
    },
    error: (error) => {
      console.error('error', error);
    },
    complete: () => {
      console.log('done!');
    },
  }
);