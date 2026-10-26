const db = require('../data/mockDb');
const logger = require('../utils/logger');

class CustomersController {
  // SCN-07: Customer NUIT Conflict (409)
  registerCustomer(req, res) {
    const { name, nuit, phone, storeId } = req.body || {};
    const simulateFix = req.query.simulateFix === 'true';

    const existing = !simulateFix ? db.existingCustomers.find(c => c.nuit === nuit) : null;

    if (existing) {
      logger.warn(`Registration conflict: NUIT ${nuit} is already registered to customer ${existing.customerId} (${existing.name})`);
      return res.status(409).json({
        error: 'ConflictError',
        code: 'CUSTOMER_NUIT_EXISTS',
        field: 'nuit',
        nuitValue: nuit,
        existingRecord: {
          customerId: existing.customerId,
          name: existing.name,
          maskedPhone: existing.phone.replace(/(\d{4})\d+(\d{2})/, '$1****$2')
        },
        message: `O NUIT ${nuit} já se encontra associado à cliente '${existing.name}' (ID ${existing.customerId}). Não é permitido criar novo cadastro com mesmo documento fiscal.`,
        recommendedAction: 'Efetuar reativação ou atualização dos dados da conta existente em vez de criar um novo cadastro.'
      });
    }

    const newId = 'CUST-' + Math.floor(1000 + Math.random() * 9000);
    logger.info(`Customer registered successfully: ${name} (${newId}) with NUIT ${nuit}`);
    return res.status(201).json({
      status: 'CREATED',
      customerId: newId,
      name,
      nuit,
      phone,
      storeId: storeId || 'STORE-DEFAULT',
      createdAt: new Date().toISOString()
    });
  }
}

module.exports = new CustomersController();
