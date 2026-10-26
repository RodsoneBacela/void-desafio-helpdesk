const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_DIR: path.resolve(__dirname, '../../../client'),
  LOGS_BUFFER_LIMIT: 100,
  APP_VERSIONS: {
    minVersion: '2.1.0',
    currentVersion: '2.4.2'
  },
  DEFAULT_UPSTREAM_TIMEOUT: 5000,
  RATE_LIMIT: {
    WINDOW_MS: 60000,
    MAX_REQUESTS: 5
  }
};
