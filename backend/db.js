// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'estudiapp',
  port: process.env.DB_PORT || 5432, // Puerto de PostgreSQL
});

module.exports = pool;
