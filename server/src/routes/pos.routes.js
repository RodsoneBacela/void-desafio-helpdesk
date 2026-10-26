const { Router } = require('express');
const posController = require('../controllers/pos.controller');

const router = Router();

// SCN-09: POS Token Expired JWT (401)
router.post('/session/validate', posController.validateSession);

// SCN-11: Bad Request Missing Required Fields (400)
router.post('/terminals/register', posController.registerTerminal);

// SCN-12: Conflict MAC Address already paired (409)
router.post('/terminals/pair', posController.pairTerminal);

module.exports = router;
