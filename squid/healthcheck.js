const http = require('http')
const process = require('process')
const fs = require('fs')

try {
  const stateExists = fs.existsSync('/app/.squid/processor_state.json')
  
  if (stateExists) {
    console.log('Processor state file exists. Squid is healthy.')
    process.exit(0)
  } else {
    console.error('Processor state file does not exist. Squid is not healthy.')
    process.exit(1)
  }
} catch (error) {
  console.error('Health check failed:', error)
  process.exit(1)
} 