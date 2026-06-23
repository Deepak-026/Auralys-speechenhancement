const { NODE_ENV } = require('../config/env.config');

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[ErrorHandler] ${status} ${req.method} ${req.path}: ${message}`);
  if (NODE_ENV === 'development' && err.stack) {
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    error: message,
    error_type: err.name || 'ServerError',
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
