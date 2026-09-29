const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'mypassword',
  database: process.env.DB_NAME || 'ordersdb',
  port: process.env.DB_PORT || 5432,
});

const connectDb = async () => {
  logger.info('database.connecting');
  try {
    await pool.query('SELECT NOW()');
    logger.info('database.connected');
  } catch (err) {
    logger.error({ err: err.message }, 'database.connection.failed');
    logger.warn('database.reconnect.retrying');
  }
};

const queryDb = async (text, params) => {
  logger.debug({ queryText: text }, 'database.query.started');
  const res = await pool.query(text, params);
  logger.debug({ rowCount: res.rowCount }, 'database.query.finished');
  return res;
};

module.exports = { connectDb, queryDb, pool };
