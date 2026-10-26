const { Router } = require('express');
const partnerController = require('../controllers/partner.controller');

const router = Router();

// SCN-05: Unauthorized Invalid API Key (401)
router.get('/v1/catalog', partnerController.getCatalog);

// SCN-06: Rate Limit Exceeded (429)
router.post('/v1/sync', partnerController.syncData);

// SCN-08: Partner Banking DNS ENOTFOUND / VPN Down (502)
router.get('/banking/healthcheck', partnerController.bankingHealthcheck);

module.exports = router;
