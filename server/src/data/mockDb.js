// Base de dados em memória para simulação de estados e concorrência
class MockDatabase {
  constructor() {
    this.init();
  }

  init() {
    this.existingTransactions = new Set([
      'TX-99821',
      'TX-88214',
      'TX-77109'
    ]);

    this.validApiKeys = {
      'fidli_live_9a8b7c6d5e4f3a2b1c': {
        partnerId: 'MERCHANT-FARMACIA-VIDA',
        name: 'Farmácia Vida Central',
        active: true,
        rateLimitPerMin: 5
      },
      'fidli_live_supermercado_vip': {
        partnerId: 'MERCHANT-SUPER-VIP',
        name: 'Supermercado VIP Maputo',
        active: true,
        rateLimitPerMin: 10
      }
    };

    this.existingCustomers = [
      { customerId: 'CUST-1001', name: 'Amélia Mondlane', nuit: '400123987', phone: '+258841122334' },
      { customerId: 'CUST-1002', name: 'Carlos Sitoe', nuit: '400987654', phone: '+258825566778' }
    ];

    this.pairedTerminals = {
      'POS-LOJA-01': { macAddress: '00:1A:2B:3C:4D:5E', location: 'Balcão Central', activeSession: 'sess_live_992' },
      'POS-LOJA-02': { macAddress: 'AA:BB:CC:DD:EE:FF', location: 'Caixa Rápido 2', activeSession: 'sess_live_331' }
    };

    this.rateLimitTracker = {};
  }

  reset() {
    this.init();
  }
}

module.exports = new MockDatabase();
