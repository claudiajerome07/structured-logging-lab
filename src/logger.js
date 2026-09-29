const emit = (level, args, baseContext = {}) => {
  let message = 'log event';
  let context = {};

  if (args.length === 1) {
    if (typeof args[0] === 'string') {
      message = args[0];
    } else if (typeof args[0] === 'object' && args[0] !== null) {
      context = args[0];
    }
  } else if (args.length >= 2) {
    if (typeof args[0] === 'object' && args[0] !== null) {
      context = args[0];
    }
    if (typeof args[1] === 'string') {
      message = args[1];
    }
  }

  const entry = {
    ts: new Date().toISOString(),
    level,
    service: 'orders-api',
    msg: message,
    ...baseContext,
    ...context,
  };

  console.log(JSON.stringify(entry));
};

const createLogger = (baseContext = {}) => ({
  child: (extraContext = {}) => createLogger({ ...baseContext, ...extraContext }),
  debug: (...args) => emit('debug', args, baseContext),
  info: (...args) => emit('info', args, baseContext),
  warn: (...args) => emit('warn', args, baseContext),
  error: (...args) => emit('error', args, baseContext),
});

module.exports = createLogger();
