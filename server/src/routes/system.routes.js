const { Router } = require('express');
const systemController = require('../controllers/system.controller');

const router = Router();

router.get('/scenarios', systemController.getScenarios);
router.get('/logs', systemController.getLogs);
router.post('/logs/clear', systemController.clearLogs);
router.post('/reset-state', systemController.resetState);

module.exports = router;
