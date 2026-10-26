// Suite de validação de conformidade dos endpoints de suporte da plataforma Fidli
const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 3000;
let activeBaseUrl = `http://localhost:${PORT}`;
let embeddedServer = null;

function ensureServer() {
  return new Promise((resolve) => {
    const testReq = http.get(`${activeBaseUrl}/api/scenarios`, (res) => {
      resolve();
    });
    testReq.on('error', () => {
      embeddedServer = app.listen(0, () => {
        const assignedPort = embeddedServer.address().port;
        activeBaseUrl = `http://localhost:${assignedPort}`;
        resolve();
      });
    });
  });
}

async function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, activeBaseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  await ensureServer();
  console.log(`\n[TEST SUITE] Validando rotas e cenários de suporte contra ${activeBaseUrl}...\n`);

  const tests = [
    {
      id: 'SCN-01',
      name: 'Duplicate Key E11000',
      run: async () => {
        const res = await request('POST', '/api/transactions/process', {
          referenceId: 'TX-99821',
          amount: 1500
        });
        if (res.status === 500 && res.data.code === 11000) return true;
        throw new Error(`Esperado 500 Duplicate Key, recebido ${res.status}`);
      }
    },
    {
      id: 'SCN-02',
      name: 'Payment Gateway Timeout (504)',
      run: async () => {
        const res = await request('POST', '/api/transactions/payment-gateway', {
          orderId: 'ORD-5541',
          simulateTimeout: true
        });
        if (res.status === 504 && res.data.code === 'ETIMEDOUT') return true;
        throw new Error(`Esperado 504 Gateway Timeout, recebido ${res.status}`);
      }
    },
    {
      id: 'SCN-03',
      name: 'Amount Validation Error (422)',
      run: async () => {
        const res = await request('POST', '/api/transactions/validate', {
          customerId: 'CUST-1001',
          amount: -250
        });
        if (res.status === 422 && res.data.error === 'ValidationError') return true;
        throw new Error(`Esperado 422 ValidationError, recebido ${res.status}`);
      }
    },
    {
      id: 'SCN-04',
      name: 'Queue Dispatch RabbitMQ Offline (503)',
      run: async () => {
        const res = await request('POST', '/api/notifications/queue-dispatch', {
          recipient: '+25884990011',
          forceQueueDown: true
        });
        if (res.status === 503 && res.data.code === 'CHANNEL_CLOSED') return true;
        throw new Error(`Esperado 503 Service Unavailable, recebido ${res.status}`);
      }
    },
    {
      id: 'SCN-05',
      name: 'Partner Invalid API Key (401)',
      run: async () => {
        const res = await request('GET', '/api/partner/v1/catalog', null, {
          'x-api-key': 'chave_invalida_123'
        });
        if (res.status === 401 && res.data.code === 'AUTH_INVALID_KEY') return true;
        throw new Error(`Esperado 401 Unauthorized, recebido ${res.status}`);
      }
    },
    {
      id: 'SCN-06',
      name: 'Partner Rate Limit Exceeded (429)',
      run: async () => {
        const res = await request('POST', '/api/partner/v1/sync', { triggerRateLimit: true });
        if (res.status === 429 && res.data.error === 'RateLimitExceeded') return true;
        throw new Error(`Esperado 429 RateLimitExceeded, recebido ${res.status}`);
      }
    },
    {
      id: 'SCN-07',
      name: 'Customer NUIT Already Registered (409)',
      run: async () => {
        const res = await request('POST', '/api/customers/register', {
          name: 'Amélia Mondlane Duplicada',
          nuit: '400123987'
        });
        if (res.status === 409 && res.data.code === 'CUSTOMER_NUIT_EXISTS') return true;
        throw new Error(`Esperado 409 Conflict, recebido ${res.status}`);
      }
    },
    {
      id: 'SCN-08',
      name: 'Partner Banking ENOTFOUND / DNS (502)',
      run: async () => {
        const res = await request('GET', '/api/partner/banking/healthcheck');
        if (res.status === 502 && res.data.code === 'ENOTFOUND') return true;
        throw new Error(`Esperado 502 Bad Gateway, recebido ${res.status}`);
      }
    },
    {
      id: 'SCN-09',
      name: 'POS Token Expired JWT (401)',
      run: async () => {
        const res = await request('POST', '/api/pos/session/validate', {
          token: 'expired_jwt_sample'
        });
        if (res.status === 401 && res.data.name === 'TokenExpiredError') return true;
        throw new Error(`Esperado 401 TokenExpiredError, recebido ${res.status}`);
      }
    },
    {
      id: 'SCN-10',
      name: 'App Version Deprecated Upgrade Required (426)',
      run: async () => {
        const res = await request('GET', '/api/app/config', null, {
          'x-app-version': '1.2.0'
        });
        if (res.status === 426 && res.data.error === 'UpgradeRequired') return true;
        throw new Error(`Esperado 426 Upgrade Required, recebido ${res.status}`);
      }
    },
    {
      id: 'SCN-11',
      name: 'POS Terminal Provisioning Missing Fields (400)',
      run: async () => {
        const res = await request('POST', '/api/pos/terminals/register', {
          terminalModel: 'Sunmi V2 PRO'
        });
        if (res.status === 400 && res.data.missingFields) return true;
        throw new Error(`Esperado 400 Bad Request, recebido ${res.status}`);
      }
    },
    {
      id: 'SCN-12',
      name: 'Hardware MAC Already Paired (409)',
      run: async () => {
        const res = await request('POST', '/api/pos/terminals/pair', {
          terminalId: 'POS-ZIMPETO-01',
          macAddress: '00:1A:2B:3C:4D:5E'
        });
        if (res.status === 409 && res.data.code === 'MAC_ALREADY_PAIRED') return true;
        throw new Error(`Esperado 409 DeviceConflictError, recebido ${res.status}`);
      }
    }
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      await t.run();
      console.log(`  \x1b[32mPASS\x1b[0m ${t.id} - ${t.name}`);
      passed++;
    } catch (err) {
      console.error(`  \x1b[31mFAIL\x1b[0m ${t.id} - ${t.name}: ${err.message}`);
    }
  }

  const failed = tests.length - passed;
  console.log(`\nTests: ${passed} passed, ${failed} failed, ${tests.length} total\n`);

  if (embeddedServer) {
    embeddedServer.close();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Connection error or test failure:', err.message);
  if (embeddedServer) embeddedServer.close();
  process.exit(1);
});
