const app = require('./app');
const { PORT } = require('./config');
const logger = require('./utils/logger');

const server = app.listen(PORT, () => {
  logger.info(`Fidli Support Diagnostics Service initialized on port ${PORT}`);
  logger.info(`Local Dashboard: http://localhost:${PORT}`);
  logger.info(`Healthcheck & Scenarios: http://localhost:${PORT}/api/scenarios`);
  logger.info(`Worksheet: SIMULACAO_TICKETS.md`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully.');
  server.close(() => process.exit(0));
});
