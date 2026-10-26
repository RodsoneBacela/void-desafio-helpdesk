const logger = require('../utils/logger');

function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'NotFound',
    message: `Endpoint ${req.method} ${req.originalUrl} not recognized by Helpdesk Simulator.`
  });
}

function globalErrorHandler(err, req, res, next) {
  logger.fatal(`Unhandled internal server error: ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
