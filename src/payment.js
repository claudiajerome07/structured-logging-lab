const processPayment = (log, context = {}) => {
  log.info({ ...context }, 'payment.processing');

  setTimeout(() => {
    log.warn({ ...context, waitMs: 500 }, 'payment.retrying');
    log.error({ ...context, waitMs: 500, reason: 'gateway.timeout' }, 'payment.failed');
  }, 500);
};

module.exports = { processPayment };
