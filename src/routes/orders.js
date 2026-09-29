const express = require('express');
const router = express.Router();
const { queryDb } = require('../db');

router.get('/', async (req, res) => {
  req.log.info({ route: '/orders' }, 'orders.list.requested');
  try {
    const result = await queryDb('SELECT * FROM orders', []);
    req.log.info({ count: result.rows.length }, 'orders.list.success');
    res.json(result.rows);
  } catch (err) {
    req.log.error({ err: err.message }, 'orders.list.failed');
    res.status(500).send('Error fetching orders');
  }
});

router.post('/', async (req, res) => {
  const { product_id, quantity, customer_id } = req.body;
  req.log.info({ product_id, quantity, customer_id }, 'orders.create.requested');

  if (!product_id || !quantity || !customer_id) {
    req.log.warn({ missingFields: { product_id: !product_id, quantity: !quantity, customer_id: !customer_id } }, 'orders.create.validation.failed');
    return res.status(400).send('Missing fields');
  }

  try {
    const result = await queryDb(
      'INSERT INTO orders (product_id, quantity, customer_id) VALUES ($1, $2, $3) RETURNING *',
      [product_id, quantity, customer_id]
    );
    req.log.info({ orderId: result.rows[0].id }, 'orders.create.success');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    req.log.error({ err: err.message }, 'orders.create.failed');
    res.status(500).send('Error creating order');
  }
});

module.exports = router;
