const { LOGS_BUFFER_LIMIT } = require('../config');

const logsBuffer = [];

const ANSI_COLORS = {
  INFO: '\x1b[36m',   // Cyan
  WARN: '\x1b[33m',   // Yellow
  ERROR: '\x1b[31m',  // Red
  FATAL: '\x1b[35m',  // Magenta
  RESET: '\x1b[0m',
  GRAY: '\x1b[90m'
};

function addLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const entry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp,
    level,
    message,
    meta
  };

  logsBuffer.unshift(entry);
  if (logsBuffer.length > LOGS_BUFFER_LIMIT) {
    logsBuffer.pop();
  }

  const color = ANSI_COLORS[level] || ANSI_COLORS.INFO;
  console.log(`${ANSI_COLORS.GRAY}[${timestamp}]${ANSI_COLORS.RESET} ${color}[${level}]${ANSI_COLORS.RESET} ${message}`);
  
  if (meta && Object.keys(meta).length > 0) {
    console.log(`${ANSI_COLORS.GRAY}  Payload/Meta:${ANSI_COLORS.RESET}`, JSON.stringify(meta, null, 2));
  }

  return entry;
}

const logger = {
  info: (msg, meta) => addLog('INFO', msg, meta),
  warn: (msg, meta) => addLog('WARN', msg, meta),
  error: (msg, meta) => addLog('ERROR', msg, meta),
  fatal: (msg, meta) => addLog('FATAL', msg, meta),
  addLog,
  getLogs: (limit = 50) => logsBuffer.slice(0, limit),
  clear: () => {
    logsBuffer.length = 0;
    addLog('INFO', 'Logs buffer cleared.');
  },
  buffer: logsBuffer
};

module.exports = logger;
