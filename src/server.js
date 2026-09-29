const express = require('express');
const crypto = require('crypto');
const { connectDb } = require('./db');
const ordersRouter = require('./routes/orders');
const { processPayment } = require('./payment');
const logger = require('./logger');

const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
  const reqId = crypto.randomUUID();
  req.id = reqId;
  req.log = logger.child({ reqId });

  req.log.info({ method: req.method, url: req.originalUrl }, 'request.received');
  res.on('finish', () => {
    req.log.info({ method: req.method, url: req.originalUrl, statusCode: res.statusCode }, 'request.completed');
  });

  next();
});

connectDb();

app.get('/', (req, res) => {
  req.log.info({ route: '/' }, 'healthcheck.ok');
  res.send('Orders API is running');
});

app.use('/orders', ordersRouter);

app.post('/payments', (req, res) => {
  const orderId = req.body?.orderId || 'unknown';
  req.log.info({ orderId }, 'payment.started');
  processPayment(req.log, { orderId });
  res.send('Payment processed');
});

app.get('/simulate-error', (req, res) => {
  req.log.error({ reason: 'simulated dependency failure' }, 'payment.failed');
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  logger.info({ port }, 'server.started');
});

module.exports = app;
