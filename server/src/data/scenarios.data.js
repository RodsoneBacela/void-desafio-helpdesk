// Catálogo de incidentes transacionais e tickets de suporte da plataforma Fidli
module.exports = [
  {
    id: 'SCN-01',
    category: 'Transações & Pagamentos',
    priority: 'Alta',
    channel: 'WhatsApp Suporte',
    reporter: 'Sr. Arlindo Machava (Supermercado Aliança)',
    ticketTitle: 'Cliente tentando pagar pontos e sistema dá erro interno 500',
    complaintText: `Olá Suporte Fidli, estamos com uma fila enorme aqui no caixa 3. Quando o operador tenta lançar a transação TX-99821 de acumulação de pontos do cliente, a máquina trava e a API devolve um erro 500 dizendo "duplicate key error". O cliente jura que ainda não recebeu os pontos. Podem resolver com urgência?`,
    method: 'POST',
    endpoint: '/api/transactions/process',
    headers: { 'Content-Type': 'application/json' },
    defaultPayload: {
      referenceId: 'TX-99821',
      amount: 1500,
      customerPhone: '+258841122334',
      cashierId: 'CX-03'
    },
    fixedPayload: {
      referenceId: 'TX-99822',
      amount: 1500,
      customerPhone: '+258841122334',
      cashierId: 'CX-03'
    },
    errorExpected: '500 Internal Server Error (E11000 duplicate key error)',
    hint: 'Verifique a chave de idempotência `referenceId`. A referência TX-99821 já foi processada no banco de dados anteriormente.'
  },
  {
    id: 'SCN-02',
    category: 'Transações & Pagamentos',
    priority: 'Crítica',
    channel: 'E-mail Comercial',
    reporter: 'Dra. Isabel Cossa (Gerente Financeira - Moda Maputo)',
    ticketTitle: 'Pagamentos via M-Pesa caindo por Timeout e clientes sendo debitados',
    complaintText: `Bom dia equipa técnica. Desde as 08h da manhã que 8 clientes tentaram pagar faturas no nosso e-commerce via M-Pesa. O site fica a carregar mais de 5 segundos e devolve "Gateway Timeout". O dinheiro sai da conta M-Pesa de alguns clientes mas a encomenda continua Pendente no Fidli! Precisamos de intervenção imediata!`,
    method: 'POST',
    endpoint: '/api/transactions/payment-gateway',
    headers: { 'Content-Type': 'application/json' },
    defaultPayload: {
      orderId: 'ORD-5541',
      amount: 3200,
      provider: 'M-PESA-API',
      timeoutMs: 5000,
      simulateTimeout: true
    },
    fixedPayload: {
      orderId: 'ORD-5541',
      amount: 3200,
      provider: 'M-PESA-API',
      timeoutMs: 5000,
      simulateTimeout: false
    },
    errorExpected: '504 Gateway Timeout (ETIMEDOUT 196.28.232.10:443)',
    hint: 'O gateway externo de pagamentos (upstream M-Pesa) não respondeu dentro do SLA de 5000ms. Investigar status do provedor e conciliação pendente.'
  },
  {
    id: 'SCN-03',
    category: 'Transações & Pagamentos',
    priority: 'Média',
    channel: 'Portal de Suporte (Jira)',
    reporter: 'Helder Guambe (Operador de Integração - Farmácias Boa Vida)',
    ticketTitle: 'API rejeita estorno de compra dizendo "ValidationError"',
    complaintText: `Olá pessoal do L1. Estamos a enviar uma requisição para a rota /validate para fazer um ajuste de saldo do cliente CUST-1001 e a vossa API está a rejeitar com status 422 Unprocessable Entity. O nosso programador passou o valor -250 pois é um débito/estorno de pontos. Porque não aceita?`,
    method: 'POST',
    endpoint: '/api/transactions/validate',
    headers: { 'Content-Type': 'application/json' },
    defaultPayload: {
      customerId: 'CUST-1001',
      amount: -250,
      currency: 'MZN',
      operationType: 'POINTS_ADJUSTMENT'
    },
    fixedPayload: {
      customerId: 'CUST-1001',
      amount: 250,
      currency: 'MZN',
      operationType: 'POINTS_ADJUSTMENT'
    },
    errorExpected: '422 Unprocessable Entity (ValidationError: amount must be positive)',
    hint: 'Regra de negócio da API: o campo `amount` deve ser sempre um inteiro positivo (> 0). O sentido (crédito vs débito) é controlado pelo campo `operationType` e não pelo sinal negativo.'
  },
  {
    id: 'SCN-04',
    category: 'Transações & Pagamentos',
    priority: 'Alta',
    channel: 'Slack Canal Alertas',
    reporter: 'Sistema Automático / Loja Matola Express',
    ticketTitle: 'SMS com código de validação não chega aos clientes (RabbitMQ Offline)',
    complaintText: `Alerta: Múltiplas queixas de clientes na Loja Matola Express. Ao tentarem resgatar vouchers no checkout, o SMS com o código OTP nunca chega ao telemóvel. O servidor retorna HTTP 503 com erro de fila AmqpConnectionError. Os clientes estão a abandonar as compras no balcão!`,
    method: 'POST',
    endpoint: '/api/notifications/queue-dispatch',
    headers: { 'Content-Type': 'application/json' },
    defaultPayload: {
      recipient: '+25884990011',
      template: 'OTP_REDEMPTION_CODE',
      points: 150,
      forceQueueDown: true
    },
    fixedPayload: {
      recipient: '+25884990011',
      template: 'OTP_REDEMPTION_CODE',
      points: 150,
      forceQueueDown: false
    },
    errorExpected: '503 Service Unavailable (AmqpConnectionError: channel closed)',
    hint: 'Fila de mensageria RabbitMQ inacessível ou canal fechado na fila `notifications.sms.critical`. Falha de infraestrutura no cluster de mensagens.'
  },
  {
    id: 'SCN-05',
    category: 'Integrações & Parceiros',
    priority: 'Alta',
    channel: 'E-mail Suporte Desenvolvedores',
    reporter: 'Eng. Mauro Banze (Lead Developer - ERP Pro Retail)',
    ticketTitle: 'Chave de API inválida após rotação de credenciais de produção',
    complaintText: `Prezados, hoje cedo a nossa equipa de DevOps efetuou uma rotação de chaves. Atualizamos o header x-api-key no nosso backend para "fidli_sec_test_invalid_99", mas todas as chamadas para obter o catálogo de prémios estão a falhar com 401 Unauthorized "AUTH_INVALID_KEY". O nosso serviço está parado! Podem revalidar a nossa chave?`,
    method: 'GET',
    endpoint: '/api/partner/v1/catalog',
    headers: { 'x-api-key': 'fidli_sec_test_invalid_99' },
    defaultPayload: {},
    fixedHeaders: { 'x-api-key': 'fidli_live_9a8b7c6d5e4f3a2b1c' },
    fixedPayload: {},
    errorExpected: '401 Unauthorized (AUTH_INVALID_KEY: The provided API Key is invalid or revoked)',
    hint: 'A chave enviada no cabeçalho x-api-key não existe no cadastro de parceiros autorizados ou expirou. Deve-se instruir o parceiro a utilizar a chave ativa correta.'
  },
  {
    id: 'SCN-06',
    category: 'Integrações & Parceiros',
    priority: 'Média',
    channel: 'Telefone / WhatsApp',
    reporter: 'Sónia Mondlane (Analista de TI - Supermercado VIP)',
    ticketTitle: 'Sincronização em lote devolve 429 Too Many Requests',
    complaintText: `Olá suporte, o nosso script de sincronização de vendas noturnas começou a rodar às 23h e após 10 segundos parou com código HTTP 429 "RateLimitExceeded". Não sabíamos que havia limite de requisições por minuto. Precisamos sincronizar 500 transações de uma só vez!`,
    method: 'POST',
    endpoint: '/api/partner/v1/sync',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'fidli_live_9a8b7c6d5e4f3a2b1c'
    },
    defaultPayload: {
      batchSize: 50,
      syncItems: ['TX-1', 'TX-2', 'TX-3'],
      triggerRateLimit: true
    },
    fixedPayload: {
      batchSize: 5,
      syncItems: ['TX-1'],
      triggerRateLimit: false
    },
    errorExpected: '429 Too Many Requests (Rate limit of 5 req/min exceeded)',
    hint: 'Parceiro atingiu a política de Rate Limit da API. Orientar a implementação de retentativas com Exponential Backoff ou envio em lotes agregados.'
  },
  {
    id: 'SCN-07',
    category: 'Integrações & Parceiros',
    priority: 'Alta',
    channel: 'Balcão de Atendimento / Webhook',
    reporter: 'Fátima Tembe (Operadora de Fidelização - Polana Shopping)',
    ticketTitle: 'Não consigo cadastrar nova cliente: diz que NUIT já existe com outro ID',
    complaintText: `Boa tarde. A cliente Amélia Mondlane está aqui no balcão e quer aderir ao programa. Ao submeter o formulário de cadastro, o sistema bloqueia e diz "O NUIT 400123987 já se encontra associado à cliente Amélia Mondlane ID CUST-1001". A cliente disse que perdeu o cartão antigo e quer um cadastro novo. O que faço?`,
    method: 'POST',
    endpoint: '/api/customers/register',
    headers: { 'Content-Type': 'application/json' },
    defaultPayload: {
      name: 'Amélia Mondlane Nova Adesão',
      nuit: '400123987',
      phone: '+258870001122',
      storeId: 'STORE-POLANA'
    },
    fixedPayload: {
      name: 'Amélia Mondlane Nova Adesão',
      nuit: '400554433',
      phone: '+258870001122',
      storeId: 'STORE-POLANA'
    },
    errorExpected: '409 Conflict (CUSTOMER_NUIT_EXISTS: NUIT já registado)',
    hint: 'NUIT é um identificador fiscal único por lei e chave primária lógica. O procedimento correto de N1 não é criar novo cadastro, mas sim recuperar a conta existente CUST-1001 e reemitir cartão/atualizar dados.'
  },
  {
    id: 'SCN-08',
    category: 'Integrações & Parceiros',
    priority: 'Crítica',
    channel: 'Slack #incidentes-prod',
    reporter: 'Equipa de Suporte N1 (Turno da Noite)',
    ticketTitle: 'Comunicação com banco parceiro falhando: ENOTFOUND api.partner-bank.co.mz',
    complaintText: `Caros, os resgates de cashback para contas bancárias e cartões estão a falhar em 100% dos casos. No log do backend aparece a mensagem: "FetchError: getaddrinfo ENOTFOUND api.partner-bank.co.mz". Parece que o túnel VPN ou o DNS interno do banco caiu!`,
    method: 'GET',
    endpoint: '/api/partner/banking/healthcheck',
    headers: {},
    defaultPayload: {},
    fixedPayload: { simulateVpnHealthy: true },
    errorExpected: '502 Bad Gateway (FetchError: getaddrinfo ENOTFOUND api.partner-bank.co.mz)',
    hint: 'Falha de resolução DNS externa ou queda do túnel IPsec/VPN que interliga o cluster ao parceiro bancário. Exige escalonamento para N2/DevOps com verificação de túnel e rotas.'
  },
  {
    id: 'SCN-09',
    category: 'Equipamentos, POS & Mobile',
    priority: 'Média',
    channel: 'WhatsApp Lojistas',
    reporter: 'Jorge Manjate (Supervisor de Caixa - Pastelaria Triunfo)',
    ticketTitle: 'POS deslogou sozinho e dá erro "jwt expired" ao tentar passar compras',
    complaintText: `Olá rapazes, abrimos a pastelaria agora às 06:30 e o terminal POS móvel está com a mensagem "TokenExpiredError: jwt expired". O caixa não consegue validar transações. Já desligámos e ligámos a máquina mas continua com o mesmo erro na tela.`,
    method: 'POST',
    endpoint: '/api/pos/session/validate',
    headers: { 'Content-Type': 'application/json' },
    defaultPayload: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwb3NfdXNlcl84OCIsImV4cCI6MTY3MjUzMTEwMH0.signature',
      terminalId: 'POS-PASTELARIA-01'
    },
    fixedPayload: {
      token: 'VALID_JWT_TOKEN_' + Date.now(),
      terminalId: 'POS-PASTELARIA-01',
      renewSession: true
    },
    errorExpected: '401 Unauthorized (TokenExpiredError: jwt expired)',
    hint: 'O token JWT da sessão do operador de caixa expirou após 24h. Solução N1: Orientar o operador a fazer Logout completo no app do POS e Login novamente com as credenciais (PIN do operador).'
  },
  {
    id: 'SCN-10',
    category: 'Equipamentos, POS & Mobile',
    priority: 'Alta',
    channel: 'Portal de Suporte Ticket #4091',
    reporter: 'Tânia Langa (Gerente de Loja - Beira Mall)',
    ticketTitle: 'App Fidli Merchant mostra "Versão Descontinuada" e bloqueia acesso',
    complaintText: `Boa tarde. Fomos abrir o aplicativo dos comerciantes no tablet do balcão e recebemos a mensagem "A versão 1.2.0 foi descontinuada. Minimum required 2.1.0 (HTTP 426 Upgrade Required)". O tablet não nos deixa clicar em nada. Temos clientes à espera para ler o QR Code de fidelidade!`,
    method: 'GET',
    endpoint: '/api/app/config',
    headers: { 'x-app-version': '1.2.0' },
    defaultPayload: {},
    fixedHeaders: { 'x-app-version': '2.4.2' },
    fixedPayload: {},
    errorExpected: '426 Upgrade Required (Client version 1.2.0 is deprecated)',
    hint: 'O aplicativo do lojista está desatualizado. A política do backend rejeita versões abaixo de 2.1.0 por razões de segurança. Instruir o lojista a atualizar o app na Google Play Store ou via APK corporativo.'
  },
  {
    id: 'SCN-11',
    category: 'Equipamentos, POS & Mobile',
    priority: 'Média',
    channel: 'E-mail Operações de Campo',
    reporter: 'Nelson Chissano (Técnico de Instalação POS)',
    ticketTitle: 'Erro 400 Bad Request ao provisionar novo terminal Sunmi V2',
    complaintText: `Saudações suporte. Estou a fazer a instalação de um novo terminal POS Sunmi na Loja Xai-Xai 02. Quando envio o payload de inicialização do terminal para o endpoint de registro, o servidor devolve 400 Bad Request dizendo que faltam campos obrigatórios. Segue o payload que o instalador enviou. Podem me dizer o que está a faltar?`,
    method: 'POST',
    endpoint: '/api/pos/terminals/register',
    headers: { 'Content-Type': 'application/json' },
    defaultPayload: {
      terminalModel: 'Sunmi V2 PRO',
      serialNumber: 'SN-9988221'
    },
    fixedPayload: {
      terminalModel: 'Sunmi V2 PRO',
      serialNumber: 'SN-9988221',
      terminalId: 'POS-XAIXAI-02',
      storeLocation: 'Xai-Xai Centro',
      merchantId: 'MERCHANT-XAIXAI'
    },
    errorExpected: '400 Bad Request (Missing required fields: terminalId, storeLocation, merchantId)',
    hint: 'Erro de payload no provisionamento. O instalador omitiu os campos obrigatórios terminalId, storeLocation e merchantId exigidos pelo schema de validação.'
  },
  {
    id: 'SCN-12',
    category: 'Equipamentos, POS & Mobile',
    priority: 'Alta',
    channel: 'Telefone Emergência Lojistas',
    reporter: 'Armando Cuna (Gerente de Operações - Bombas Zimpeto)',
    ticketTitle: 'Equipamento substituído não conecta: MAC Address já vinculado a outra loja',
    complaintText: `Olá suporte, o nosso terminal antigo queimou e recebemos um equipamento usado de substituição da loja da Matola. Ao tentar parear com a nossa loja do Zimpeto, o sistema diz: "DeviceConflictError: O endereço físico 00:1A:2B:3C:4D:5E já está vinculado ao terminal POS-LOJA-01". O que podemos fazer para liberar este aparelho para o Zimpeto?`,
    method: 'POST',
    endpoint: '/api/pos/terminals/pair',
    headers: { 'Content-Type': 'application/json' },
    defaultPayload: {
      terminalId: 'POS-ZIMPETO-01',
      macAddress: '00:1A:2B:3C:4D:5E',
      forceUnpairPrevious: false
    },
    fixedPayload: {
      terminalId: 'POS-ZIMPETO-01',
      macAddress: '00:1A:2B:3C:4D:5E',
      forceUnpairPrevious: true
    },
    errorExpected: '409 Conflict (MAC_ALREADY_PAIRED: Endereço MAC já ativo noutro terminal)',
    hint: 'Regra de segurança anti-fraude: um endereço MAC de hardware só pode estar ativo em um único terminal. O N1 deve executar o procedimento de desassociação do POS-LOJA-01 anterior ou solicitar ao supervisor a liberação.'
  }
];
