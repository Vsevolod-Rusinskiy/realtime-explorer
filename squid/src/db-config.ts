// Конфигурация подключения к базе данных
export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres'
}

// Для отладки
console.log('Database configuration:')
console.log(`- Host: ${DB_CONFIG.host}`)
console.log(`- Port: ${DB_CONFIG.port}`)
console.log(`- Database: ${DB_CONFIG.database}`)
console.log(`- Username: ${DB_CONFIG.username}`) 