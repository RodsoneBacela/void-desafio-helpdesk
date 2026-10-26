const db = require('../data/mockDb');
const logger = require('../utils/logger');
const { RATE_LIMIT } = require('../config');

class PartnerController {
  // SCN-05: Unauthorized Invalid API Key (401)
  getCatalog(req, res) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    const simulateFix = req.query.simulateFix === 'true';

    const partner = simulateFix ? db.validApiKeys['fidli_live_9a8b7c6d5e4f3a2b1c'] : db.validApiKeys[apiKey];

    if (!partner) {
      logger.warn(`Authentication failed: Invalid or missing X-API-KEY: "${apiKey || 'EMPTY'}"`, {
        path: req.originalUrl,
        headers: req.headers
      });

      return res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_INVALID_KEY',
        message: `The provided API Key '${apiKey || ''}' is invalid or has been revoked. Ensure you send a valid key in the 'x-api-key' header.`,
        documentation: 'https://docs.fidli.cloud/security/api-keys'
      });
    }

    logger.info(`Partner catalog accessed by: ${partner.name} (${partner.partnerId})`);
    return res.status(200).json({
      partnerId: partner.partnerId,
      merchantName: partner.name,
      itemsCount: 3,
      items: [
        { id: 'ITM-01', name: 'Voucher Desconto 200 MZN', pointsRequired: 500 },
        { id: 'ITM-02', name: 'Vale Combustível 500 MZN', pointsRequired: 1200 },
        { id: 'ITM-03', name: 'Cabaz Alimentar Familiar', pointsRequired: 3500 }
      ]
    });
  }

  // SCN-06: Rate Limit Exceeded (429)
  syncData(req, res) {
    const apiKey = req.headers['x-api-key'] || 'fidli_live_9a8b7c6d5e4f3a2b1c';
    const { batchSize = 10, triggerRateLimit = true } = req.body || {};
    const simulateFix = req.query.simulateFix === 'true' || triggerRateLimit === false;

    const now = Date.now();
    if (!db.rateLimitTracker[apiKey]) {
      db.rateLimitTracker[apiKey] = [];
    }

    // Filter last 60 seconds
    db.rateLimitTracker[apiKey] = db.rateLimitTracker[apiKey].filter(t => now - t < RATE_LIMIT.WINDOW_MS);

    if (!simulateFix) {
      // Force limit breach
      db.rateLimitTracker[apiKey].push(now, now, now, now, now, now);
      logger.warn(`RateLimitExceeded for API key ${apiKey}: Limit of ${RATE_LIMIT.MAX_REQUESTS} requests/min reached.`, {
        currentCount: db.rateLimitTracker[apiKey].length,
        limit: RATE_LIMIT.MAX_REQUESTS,
        partner: 'Farmácia Vida Central'
      });

      res.set('Retry-After', '45');
      return res.status(429).json({
        error: 'RateLimitExceeded',
        code: 'TOO_MANY_REQUESTS',
        limit: RATE_LIMIT.MAX_REQUESTS,
        windowSeconds: 60,
        retryAfterSeconds: 45,
        message: 'API rate limit of 5 requests per minute exceeded for Merchant Farmácia Vida Central.',
        guidance: 'Implemente retentativa com Exponential Backoff ou envie lotes agregados.'
      });
    }

    db.rateLimitTracker[apiKey] = [];
    logger.info(`Batch sync processed successfully: ${batchSize} records processed.`);
    return res.status(200).json({
      synced: true,
      recordsProcessed: batchSize,
      partnerKey: apiKey,
      timestamp: new Date().toISOString()
    });
  }

  // SCN-08: Partner Banking DNS ENOTFOUND / VPN Down (502)
  bankingHealthcheck(req, res) {
    const simulateFix = req.query.simulateFix === 'true';

    if (!simulateFix) {
      logger.error('FetchError: request to https://api.partner-bank.co.mz/v1/health failed, reason: getaddrinfo ENOTFOUND api.partner-bank.co.mz', {
        hostname: 'api.partner-bank.co.mz',
        syscall: 'getaddrinfo',
        code: 'ENOTFOUND',
        tunnelStatus: 'IPSEC_TUNNEL_DOWN'
      });

      return res.status(502).json({
        error: 'BadGateway',
        code: 'ENOTFOUND',
        syscall: 'getaddrinfo',
        hostname: 'api.partner-bank.co.mz',
        message: 'FetchError: getaddrinfo ENOTFOUND api.partner-bank.co.mz. O servidor não conseguiu resolver o endereço do parceiro bancário.',
        diagnostic: 'Falha na resolução de nomes do parceiro bancário ou túnel de VPN/IPsec indisponível.',
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Banking partner healthcheck OK: 200 OK via VPN Gateway (latency: 34ms)');
    return res.status(200).json({
      service: 'PARTNER_BANKING_CORE',
      status: 'UP',
      latencyMs: 34,
      vpnTunnel: 'ESTABLISHED',
      targetHost: 'api.partner-bank.co.mz',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new PartnerController();
