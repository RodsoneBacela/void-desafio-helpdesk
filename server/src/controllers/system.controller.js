const scenariosData = require('../data/scenarios.data');
const db = require('../data/mockDb');
const logger = require('../utils/logger');

class SystemController {
  getScenarios(req, res) {
    res.json({
      total: scenariosData.length,
      scenarios: scenariosData
    });
  }

  getLogs(req, res) {
    const limit = parseInt(req.query.limit, 10) || 50;
    res.json({
      logs: logger.getLogs(limit)
    });
  }

  clearLogs(req, res) {
    logger.clear();
    res.json({ success: true, message: 'Logs buffer cleared.' });
  }

  resetState(req, res) {
    db.reset();
    logger.info('Mock state and rate limits have been reset to default values.');
    res.json({ success: true, message: 'State and rate limits reset to initial values.' });
  }
}

module.exports = new SystemController();
