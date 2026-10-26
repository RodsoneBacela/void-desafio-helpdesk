const db = require('../data/mockDb');
const logger = require('../utils/logger');
const { APP_VERSIONS } = require('../config');

class PosController {
  // SCN-09: POS Token Expired JWT (401)
  validateSession(req, res) {
    const { token, terminalId } = req.body || {};
    const simulateFix = req.query.simulateFix === 'true' || req.body?.renewSession === true;

    if (!simulateFix) {
      logger.warn(`JWT validation failed for terminal ${terminalId || 'UNKNOWN'}: TokenExpiredError (jwt expired)`, {
        terminalId,
        expiredAt: '2024-01-01T00:00:00.000Z'
      });

      return res.status(401).json({
        name: 'TokenExpiredError',
        message: 'jwt expired',
        expiredAt: '2024-01-01T00:00:00.000Z',
        terminalId,
        actionRequired: 'OPERATOR_LOGIN_REQUIRED',
        guidance: 'A sessão de segurança do POS expirou. O operador deve fazer Logout e Login com seu código PIN.'
      });
    }

    logger.info(`POS session valid for terminal ${terminalId || 'POS-PASTELARIA-01'}`);
    return res.status(200).json({
      valid: true,
      terminalId: terminalId || 'POS-PASTELARIA-01',
      user: 'operador_caixa_triunfo',
      expiresIn: '8 hours',
      sessionRefreshedAt: new Date().toISOString()
    });
  }

  // SCN-10: Upgrade Required 426 (App Version Deprecated)
  getAppConfig(req, res) {
    const version = req.headers['x-app-version'] || req.query.appVersion || '1.0.0';
    const simulateFix = req.query.simulateFix === 'true';

    const effectiveVersion = simulateFix ? APP_VERSIONS.currentVersion : version;
    const minRequired = APP_VERSIONS.minVersion; // '2.1.0'

    if (effectiveVersion < minRequired) {
      logger.warn(`App version rejected: ${effectiveVersion} < required ${minRequired}. Upgrade Required 426.`);
      return res.status(426).json({
        error: 'UpgradeRequired',
        status: 426,
        currentVersion: effectiveVersion,
        minRequiredVersion: minRequired,
        latestVersion: APP_VERSIONS.currentVersion,
        message: `A versão ${effectiveVersion} foi descontinuada devido à migração dos serviços de autenticação e criptografia. É obrigatório atualizar para a versão ${minRequired} ou superior.`,
        storeUrl: 'https://play.google.com/store/apps/details?id=com.fidli.merchant'
      });
    }

    logger.info(`App config served for version ${effectiveVersion}`);
    return res.status(200).json({
      status: 'ACTIVE',
      version: effectiveVersion,
      features: {
        qrScanning: true,
        offlineBuffering: true,
        biometricAuth: true
      },
      motd: 'Sistema operacional normalmente.'
    });
  }

  // SCN-11: Bad Request Missing Required Fields (400)
  registerTerminal(req, res) {
    const { terminalModel, serialNumber, terminalId, storeLocation, merchantId } = req.body || {};
    const simulateFix = req.query.simulateFix === 'true';

    const requiredFields = ['terminalId', 'storeLocation', 'merchantId'];
    const missing = [];

    if (!simulateFix) {
      if (!terminalId) missing.push('terminalId');
      if (!storeLocation) missing.push('storeLocation');
      if (!merchantId) missing.push('merchantId');
    }

    if (missing.length > 0) {
      logger.warn(`Terminal registration rejected: missing mandatory fields [${missing.join(', ')}]`, {
        received: req.body,
        missing
      });

      return res.status(400).json({
        error: 'BadRequest',
        code: 'MISSING_MANDATORY_PARAMETERS',
        missingFields: missing,
        message: `Parâmetros obrigatórios ausentes para registro do terminal: ${missing.join(', ')}.`,
        expectedPayloadSchema: {
          terminalModel: 'string',
          serialNumber: 'string',
          terminalId: 'string (ex: POS-LOJA-01)',
          storeLocation: 'string (ex: Maputo Shopping)',
          merchantId: 'string (ex: MERCHANT-XYZ)'
        }
      });
    }

    logger.info(`Terminal registered successfully: ${terminalId || 'POS-XAIXAI-02'} (${terminalModel})`);
    return res.status(201).json({
      status: 'REGISTERED',
      terminalId: terminalId || 'POS-XAIXAI-02',
      serialNumber: serialNumber || 'SN-9988221',
      registeredAt: new Date().toISOString()
    });
  }

  // SCN-12: Conflict MAC Address already paired (409)
  pairTerminal(req, res) {
    const { terminalId, macAddress, forceUnpairPrevious } = req.body || {};
    const simulateFix = req.query.simulateFix === 'true' || forceUnpairPrevious === true;

    const existingPairing = Object.entries(db.pairedTerminals).find(
      ([id, term]) => term.macAddress === macAddress
    );

    if (!simulateFix && existingPairing) {
      const [previousTerminalId, details] = existingPairing;
      logger.warn(`Hardware collision: MAC address ${macAddress} is already assigned to active terminal '${previousTerminalId}'`, {
        targetTerminalId: terminalId,
        assignedTerminalId: previousTerminalId,
        macAddress
      });

      return res.status(409).json({
        error: 'DeviceConflictError',
        code: 'MAC_ALREADY_PAIRED',
        macAddress,
        assignedTo: {
          terminalId: previousTerminalId,
          location: details.location,
          activeSession: details.activeSession
        },
        message: `O endereço físico (MAC) ${macAddress} já se encontra vinculado ao terminal '${previousTerminalId}'. Por segurança, cada equipamento físico só pode estar pareado a uma única loja.`,
        resolutionProcedure: 'Solicitar despareamento prévio do terminal anterior ou enviar flag forceUnpairPrevious com autorização de supervisor.'
      });
    }

    // Success pairing
    db.pairedTerminals[terminalId] = {
      macAddress,
      location: 'Zimpeto Store',
      activeSession: 'sess_live_' + Date.now().toString(36)
    };

    logger.info(`Terminal ${terminalId} successfully paired with MAC ${macAddress}`);
    return res.status(200).json({
      paired: true,
      terminalId,
      macAddress,
      sessionKey: 'sec_pos_' + Math.random().toString(36).substr(2, 8),
      pairedAt: new Date().toISOString()
    });
  }
}

module.exports = new PosController();
