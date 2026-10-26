const db = require('../data/mockDb');
const logger = require('../utils/logger');

class TransactionsController {
  // SCN-01: Duplicate Key Error (E11000)
  processTransaction(req, res) {
    const { referenceId, amount, customerPhone } = req.body || {};
    const simulateFix = req.query.simulateFix === 'true' || req.body?.simulateFix === true;

    if (!referenceId) {
      return res.status(400).json({ error: 'BadRequest', message: 'Missing referenceId' });
    }

    if (!simulateFix && db.existingTransactions.has(referenceId)) {
      logger.error(`MongoServerError: E11000 duplicate key error collection: fidli_db.transactions index: referenceId_1 dup key: { referenceId: "${referenceId}" }`, {
        referenceId,
        stack: `MongoServerError: E11000 duplicate key error collection: fidli_db.transactions index: referenceId_1 dup key: { referenceId: "${referenceId}" }\n    at Function.create (/app/node_modules/mongodb/lib/error.js:48:12)\n    at emitTransactionError (/app/services/transactionService.js:142:15)`
      });

      return res.status(500).json({
        name: 'MongoServerError',
        code: 11000,
        codeName: 'DuplicateKey',
        keyPattern: { referenceId: 1 },
        keyValue: { referenceId },
        message: `E11000 duplicate key error collection: fidli_db.transactions index: referenceId_1 dup key: { referenceId: "${referenceId}" }`,
        suggestion: 'A transação com esta referência já foi persistida anteriormente. Verifique se o operador clicou duas vezes ou se houve reenvio automático.'
      });
    }

    db.existingTransactions.add(referenceId);
    logger.info(`Transaction successfully processed: ${referenceId} for ${amount} MZN`);

    return res.status(201).json({
      status: 'SUCCESS',
      transactionId: referenceId,
      amount,
      customerPhone,
      pointsAwarded: Math.floor((amount || 100) / 10),
      timestamp: new Date().toISOString()
    });
  }

  // SCN-02: Payment Gateway Timeout (ETIMEDOUT / 504)
  gatewayPayment(req, res) {
    const { orderId, amount, provider, simulateTimeout = true } = req.body || {};
    const simulateFix = req.query.simulateFix === 'true' || !simulateTimeout;

    if (!simulateFix) {
      logger.error(`FetchError: connect ETIMEDOUT 196.28.232.10:443 after 5000ms upstream to ${provider}`, {
        orderId,
        amount,
        provider,
        timeoutMs: 5000,
        upstreamUrl: 'https://api.m-pesa.vodacom.mz/v1/ipg/pay'
      });

      return res.status(504).json({
        error: 'GatewayTimeout',
        code: 'ETIMEDOUT',
        provider: provider || 'M-PESA-API',
        message: 'FetchError: request to https://api.m-pesa.vodacom.mz/v1/ipg/pay failed, reason: connect ETIMEDOUT 196.28.232.10:443 after 5000ms',
        orderId,
        pendingReconciliation: true,
        hint: 'O gateway externo do parceiro de pagamentos não respondeu dentro do limite de tempo tolerado.'
      });
    }

    logger.info(`Payment successfully authorized by ${provider} for order ${orderId}`);
    return res.status(200).json({
      status: 'APPROVED',
      orderId,
      amount,
      provider,
      authorizationCode: 'MPESA_' + Math.floor(100000 + Math.random() * 900000),
      authorizedAt: new Date().toISOString()
    });
  }

  // SCN-03: ValidationError: amount must be positive (422)
  validateTransaction(req, res) {
    const { customerId, amount, currency, operationType } = req.body || {};
    const simulateFix = req.query.simulateFix === 'true' || req.body?.simulateFix === true;

    const effectiveAmount = simulateFix && amount < 0 ? Math.abs(amount) : amount;

    if (effectiveAmount === undefined || typeof effectiveAmount !== 'number' || effectiveAmount <= 0) {
      logger.warn(`ValidationError in /validate: amount must be greater than 0, received: ${effectiveAmount}`, {
        customerId,
        amount: effectiveAmount,
        operationType
      });

      return res.status(422).json({
        error: 'ValidationError',
        message: 'Validation failed for transaction adjustment parameters',
        details: [
          {
            field: 'amount',
            value: effectiveAmount,
            constraint: 'isPositiveInteger',
            message: `Amount must be a positive number greater than 0, received ${effectiveAmount}. Débitos e créditos são controlados por 'operationType' ('DEBIT' ou 'CREDIT').`
          }
        ]
      });
    }

    logger.info(`Transaction validation passed for customer ${customerId}, amount: ${effectiveAmount} ${currency || 'MZN'}`);
    return res.status(200).json({
      validated: true,
      customerId,
      amount: effectiveAmount,
      currency: currency || 'MZN',
      operationType: operationType || 'POINTS_ADJUSTMENT'
    });
  }
}

module.exports = new TransactionsController();
