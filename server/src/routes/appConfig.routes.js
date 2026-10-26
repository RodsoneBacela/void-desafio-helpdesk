const { Router } = require('express');
const posController = require('../controllers/pos.controller');

const router = Router();

// SCN-10: Upgrade Required 426 (App Version Deprecated)
router.get('/config', posController.getAppConfig);

module.exports = router;
