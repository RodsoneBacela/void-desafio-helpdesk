const { Router } = require('express');
const customersController = require('../controllers/customers.controller');

const router = Router();

// SCN-07: Customer NUIT Conflict (409)
router.post('/register', customersController.registerCustomer);

module.exports = router;
