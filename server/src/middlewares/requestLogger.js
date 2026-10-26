const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';

    logger.addLog(level, `${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`, {
      ip: req.ip,
      body: req.method !== 'GET' ? req.body : undefined,
      query: Object.keys(req.query).length ? req.query : undefined,
      headers: {
        'x-api-key': req.headers['x-api-key'] || undefined,
        'x-app-version': req.headers['x-app-version'] || undefined,
        authorization: req.headers['authorization'] ? 'Bearer [HIDDEN]' : undefined
      }
    });
  });

  next();
}

module.exports = requestLogger;
