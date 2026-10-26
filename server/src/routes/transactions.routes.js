const { Router } = require('express');
const transactionsController = require('../controllers/transactions.controller');

const router = Router();

// SCN-01: Duplicate Key Error (E11000)
router.post('/process', transactionsController.processTransaction);

// SCN-02: Payment Gateway Timeout (504)
router.post('/payment-gateway', transactionsController.gatewayPayment);

// SCN-03: ValidationError: amount must be positive (422)
router.post('/validate', transactionsController.validateTransaction);

module.exports = router;
