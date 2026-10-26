let allScenarios = [];
let currentScenario = null;
let currentMode = 'break';
let activeFilter = 'all';
let searchQuery = '';
const testedScenarios = new Set();
let errorCount = 0;
let currentLogLevelFilter = 'ALL';
let logPollingInterval = null;
let activeMainView = 'client';
let lastExecutionResult = null;

function showToast(msg) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'app-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2200);
}

const scenarioListContainer = document.getElementById('scenarioListContainer');
const scenarioSearch = document.getElementById('scenarioSearch');
const categoryTabs = document.getElementById('categoryTabs');
const totalScenariosCount = document.getElementById('totalScenariosCount');
const testedScenariosCount = document.getElementById('testedScenariosCount');
const errorsLoggedCount = document.getElementById('errorsLoggedCount');
const serverStatusBadge = document.getElementById('serverStatusBadge');

const tabBtnClientView = document.getElementById('tabBtnClientView');
const tabBtnTechView = document.getElementById('tabBtnTechView');
const clientSimView = document.getElementById('clientSimView');
const techTesterView = document.getElementById('techTesterView');

const globalProgressBar = document.getElementById('globalProgressBar');
const progressBarFill = document.getElementById('progressBarFill');
const deviceLoadingOverlay = document.getElementById('deviceLoadingOverlay');
const deviceLoadingTitle = document.getElementById('deviceLoadingTitle');
const deviceLoadingSub = document.getElementById('deviceLoadingSub');
const deviceLoadingTimer = document.getElementById('deviceLoadingTimer');
let deviceTimerInterval = null;

function showGlobalProgress() {
  if (globalProgressBar) globalProgressBar.classList.add('loading');
}

function hideGlobalProgress() {
  if (globalProgressBar) globalProgressBar.classList.remove('loading');
  if (progressBarFill) progressBarFill.style.width = '0%';
}

function showDeviceLoading(title, sub, countdownSec = null) {
  if (!deviceLoadingOverlay) return;
  deviceLoadingOverlay.classList.remove('hidden');
  deviceLoadingTitle.textContent = title || 'Processando operação no dispositivo...';
  deviceLoadingSub.textContent = sub || 'Aguardando resposta do servidor...';

  if (deviceTimerInterval) clearInterval(deviceTimerInterval);

  if (countdownSec) {
    let remaining = countdownSec;
    deviceLoadingTimer.textContent = `${remaining.toFixed(1)}s restantes (Timeout)`;
    deviceTimerInterval = setInterval(() => {
      remaining -= 0.1;
      if (remaining <= 0) {
        remaining = 0;
        deviceLoadingTimer.textContent = 'Tempo Limite (5000ms Esgotado!)';
        clearInterval(deviceTimerInterval);
      } else {
        deviceLoadingTimer.textContent = `${remaining.toFixed(1)}s restantes (Aguardando Gateway)`;
      }
    }, 100);
  } else {
    const start = Date.now();
    deviceLoadingTimer.textContent = '0.0s';
    deviceTimerInterval = setInterval(() => {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      deviceLoadingTimer.textContent = `${elapsed}s`;
    }, 100);
  }
}

function hideDeviceLoading() {
  if (deviceTimerInterval) {
    clearInterval(deviceTimerInterval);
    deviceTimerInterval = null;
  }
  if (deviceLoadingOverlay) {
    deviceLoadingOverlay.classList.add('hidden');
  }
}

const clientSimDevice = document.getElementById('clientSimDevice');
const clientSimHeadline = document.getElementById('clientSimHeadline');
const clientDeviceFrame = document.getElementById('clientDeviceFrame');
const btnClientSimTriggerError = document.getElementById('btnClientSimTriggerError');
const btnClientSimTriggerFix = document.getElementById('btnClientSimTriggerFix');
const btnGoToTechView = document.getElementById('btnGoToTechView');

const incId = document.getElementById('incId');
const incPriority = document.getElementById('incPriority');
const incCategory = document.getElementById('incCategory');
const incChannel = document.getElementById('incChannel');
const incTitle = document.getElementById('incTitle');
const incReporter = document.getElementById('incReporter');
const incComplaint = document.getElementById('incComplaint');

const currentMethod = document.getElementById('currentMethod');
const currentEndpoint = document.getElementById('currentEndpoint');
const btnModeBreak = document.getElementById('btnModeBreak');
const btnModeFix = document.getElementById('btnModeFix');
const payloadEditor = document.getElementById('payloadEditor');
const headersEditor = document.getElementById('headersEditor');
const headerCount = document.getElementById('headerCount');
const curlPreview = document.getElementById('curlPreview');
const btnCopyCurl = document.getElementById('btnCopyCurl');
const btnExecuteRequest = document.getElementById('btnExecuteRequest');
const respStatusPill = document.getElementById('respStatusPill');
const respTimePill = document.getElementById('respTimePill');
const responseBodyViewer = document.getElementById('responseBodyViewer');
const btnCopyResponse = document.getElementById('btnCopyResponse');
const hintContent = document.getElementById('hintContent');

const terminalLogsContainer = document.getElementById('terminalLogsContainer');
const btnClearLogs = document.getElementById('btnClearLogs');
const btnCopyLogs = document.getElementById('btnCopyLogs');
const chkAutoScroll = document.getElementById('chkAutoScroll');
const logCountLabel = document.getElementById('logCountLabel');

const ticketsModal = document.getElementById('ticketsModal');
const btnGuideDoc = document.getElementById('btnGuideDoc');
const btnTicketsDoc = document.getElementById('btnTicketsDoc');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnGotItModal = document.getElementById('btnGotItModal');
const modalTabBtnGuide = document.getElementById('modalTabBtnGuide');
const modalTabBtnTickets = document.getElementById('modalTabBtnTickets');
const modalContentGuide = document.getElementById('modalContentGuide');
const modalContentTickets = document.getElementById('modalContentTickets');

function switchModalTab(tab) {
  if (tab === 'guide') {
    modalTabBtnGuide.classList.add('active');
    modalTabBtnTickets.classList.remove('active');
    modalContentGuide.classList.remove('hidden');
    modalContentTickets.classList.add('hidden');
  } else {
    modalTabBtnGuide.classList.remove('active');
    modalTabBtnTickets.classList.add('active');
    modalContentGuide.classList.add('hidden');
    modalContentTickets.classList.remove('hidden');
  }
}

async function initApp() {
  setupEventListeners();
  await loadScenarios();
  startLogPolling();
}
async function loadScenarios() {
  try {
    const res = await fetch('/api/scenarios');
    if (!res.ok) throw new Error('Falha ao obter lista de cenários');
    const data = await res.json();
    allScenarios = data.scenarios || [];
    totalScenariosCount.textContent = allScenarios.length;
    renderScenarioList();
    if (allScenarios.length > 0) {
      selectScenario(allScenarios[0]);
    }
    setServerStatus(true);
  } catch (err) {
    console.error('Erro de conexão:', err);
    setServerStatus(false);
  }
}

function setServerStatus(online) {
  if (online) {
    serverStatusBadge.className = 'status-indicator';
    serverStatusBadge.innerHTML = `<span class="status-dot"></span><span class="status-text">Server Online</span>`;
  } else {
    serverStatusBadge.className = 'status-indicator status-offline';
    serverStatusBadge.innerHTML = `<span class="status-dot dot-red"></span><span class="status-text" style="color: #fca5a5;">Server Offline</span>`;
  }
}

function renderScenarioList() {
  scenarioListContainer.innerHTML = '';

  const filtered = allScenarios.filter(scn => {
    const matchesCat = activeFilter === 'all' || scn.category === activeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      scn.id.toLowerCase().includes(q) ||
      scn.ticketTitle.toLowerCase().includes(q) ||
      scn.reporter.toLowerCase().includes(q) ||
      scn.errorExpected.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    scenarioListContainer.innerHTML = `<div style="padding:20px; text-align:center; color:#64748b; font-size:12px;">Nenhum ticket encontrado para o filtro.</div>`;
    return;
  }

  filtered.forEach(scn => {
    const item = document.createElement('div');
    const isActive = currentScenario && currentScenario.id === scn.id;
    const isTested = testedScenarios.has(scn.id);

    item.className = `scenario-item ${isActive ? 'active' : ''}`;
    item.dataset.id = scn.id;

    const priorityClass = scn.priority === 'Crítica' ? 'priority-critica' : scn.priority === 'Alta' ? 'priority-alta' : 'priority-media';

    item.innerHTML = `
      <div class="scenario-top-line">
        <span class="scenario-id-badge">${scn.id}</span>
        <span class="badge badge-priority ${priorityClass}">${scn.priority}</span>
      </div>
      <h4>${escapeHtml(scn.ticketTitle)}</h4>
      <div class="scenario-meta">
        <span>${escapeHtml(scn.channel)}</span>
        <span class="scenario-status-pill ${isTested ? 'status-tested' : 'status-untested'}">
          ${isTested ? '✔ Testado' : 'Pendente'}
        </span>
      </div>
    `;

    item.addEventListener('click', () => selectScenario(scn));
    scenarioListContainer.appendChild(item);
  });
}

function selectScenario(scn) {
  currentScenario = scn;
  currentMode = 'break';
  lastExecutionResult = null;
  updateModeButtons();

  document.querySelectorAll('.scenario-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === scn.id);
  });

  incId.textContent = scn.id;
  incPriority.textContent = scn.priority;
  incPriority.className = `badge badge-priority priority-${scn.priority.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`;
  incCategory.textContent = scn.category;
  incChannel.textContent = scn.channel;
  incTitle.textContent = scn.ticketTitle;
  incReporter.textContent = scn.reporter;
  incComplaint.textContent = scn.complaintText;

  currentMethod.textContent = scn.method;
  currentMethod.className = `method-tag method-${scn.method.toLowerCase()}`;
  currentEndpoint.value = scn.endpoint;

  loadPayloadForCurrentMode();
  updateHeadersCount();
  updateCurlPreview();

  respStatusPill.className = 'status-pill status-idle';
  respStatusPill.textContent = 'Aguardando teste...';
  respTimePill.classList.add('hidden');
  responseBodyViewer.textContent = `// Clique em "Executar Requisição" ou na tela do cliente para observar a resposta.`;

  hintContent.innerHTML = `<strong>Diagnóstico Esperado:</strong> ${escapeHtml(scn.errorExpected)}<br><br><strong>Explicação / Causa Raiz:</strong> ${escapeHtml(scn.hint)}`;

  renderClientSimulator(scn, null);
}

function switchMainView(view) {
  activeMainView = view;
  if (view === 'client') {
    tabBtnClientView.classList.add('active');
    tabBtnTechView.classList.remove('active');
    clientSimView.classList.remove('hidden');
    techTesterView.classList.add('hidden');
  } else {
    tabBtnClientView.classList.remove('active');
    tabBtnTechView.classList.add('active');
    clientSimView.classList.add('hidden');
    techTesterView.classList.remove('hidden');
  }
}

function renderClientSimulator(scn, result) {
  if (!scn) return;

  const devicesMap = {
    'SCN-01': 'Terminal Touch POS Supermercado',
    'SCN-02': 'E-commerce Checkout M-Pesa',
    'SCN-03': 'Portal ERP Ajustes do Parceiro',
    'SCN-04': 'Smartphone do Cliente (SMS OTP)',
    'SCN-05': 'Portal Desenvolvedor API',
    'SCN-06': 'Ferramenta de Sincronização Batch',
    'SCN-07': 'Tablet Atendimento Loja (Novo Cadastro)',
    'SCN-08': 'Dashboard Resgate Bancário',
    'SCN-09': 'Terminal Móvel POS (Bloqueio de Turno)',
    'SCN-10': 'Tablet Merchant Fidli App (v1.2.0)',
    'SCN-11': 'Assistente de Provisionamento Sunmi',
    'SCN-12': 'Painel de Pareamento de Hardware POS'
  };

  clientSimDevice.textContent = devicesMap[scn.id] || 'Dispositivo do Cliente';
  clientSimHeadline.textContent = `Interface Operacional: ${scn.reporter}`;

  let screenHtml = '';

  switch (scn.id) {
    case 'SCN-01': // Duplicate Key POS
      screenHtml = `
        <div class="device-top-bar">
          <span class="device-name">🏪 Supermercado Aliança • Caixa 03 (Operador: João)</span>
          <span class="device-icons">WiFi: ON | DB: CONNECTED</span>
        </div>
        <div class="device-screen-content">
          <div class="pos-screen-grid">
            <div class="pos-cart-panel">
              <div class="pos-cart-header"><span>CARRINHO ATUAL</span><span>VALOR</span></div>
              <div class="pos-cart-item"><span>Arroz 5kg Tipo 1</span><span>450 MZN</span></div>
              <div class="pos-cart-item"><span>Óleo de Girassol 2L</span><span>350 MZN</span></div>
              <div class="pos-cart-item"><span>Cabaz de Carnes VIP</span><span>700 MZN</span></div>
              <div class="pos-cart-total"><span>TOTAL:</span><span>1.500 MZN</span></div>
            </div>
            <div class="pos-action-panel">
              <div class="pos-input-group">
                <label>Cartão / Celular Cliente:</label>
                <input class="pos-input" value="+258 84 112 2334" readonly>
              </div>
              <div class="pos-input-group">
                <label>Referência da Transação:</label>
                <input class="pos-input" id="simPosRefInput" value="${currentMode === 'fix' ? 'TX-99822' : 'TX-99821'}">
              </div>
              <button class="btn-pos-touch" id="btnSimTriggerInternal">
                ⚡ Lançar Pontos de Fidelidade
              </button>
            </div>
          </div>
          ${renderResultBanner(result)}
        </div>
      `;
      break;

    case 'SCN-02': // Payment Gateway Timeout
      screenHtml = `
        <div class="device-top-bar">
          <span class="device-name">🛍️ Moda Maputo • Checkout Online Seguro</span>
          <span class="device-icons">HTTPS | Gateway: M-Pesa</span>
        </div>
        <div class="device-screen-content">
          <div class="checkout-modal-card">
            <div class="checkout-brand">
              <strong>Fatura #ORD-5541</strong>
              <span class="mpesa-badge">VODACOM M-PESA</span>
            </div>
            <div class="order-amount-row">
              <span>Valor da Encomenda:</span>
              <strong>3.200 MZN</strong>
            </div>
            <div class="pos-input-group">
              <label>Número M-Pesa para Cobrança:</label>
              <input class="pos-input" value="84 991 2233">
            </div>
            <button class="btn-mpesa-pay" id="btnSimTriggerInternal">
              💳 Confirmar Pagamento no M-Pesa
            </button>
          </div>
          ${renderResultBanner(result)}
        </div>
      `;
      break;

    case 'SCN-03': // ValidationError negative amount
      screenHtml = `
        <div class="device-top-bar">
          <span class="device-name">💊 ERP Farmácias Boa Vida • Ajuste de Saldos</span>
          <span class="device-icons">API v2</span>
        </div>
        <div class="device-screen-content">
          <div style="background:#0d1422; padding:14px; border-radius:6px; border:1px solid #1e293b; max-width:480px; margin:0 auto;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
              <strong>Ajuste de Pontos / Estorno de Saldo</strong>
              <span style="color:#94a3b8; font-size:11px;">Cliente: CUST-1001</span>
            </div>
            <div class="pos-input-group" style="margin-bottom:8px;">
              <label>Valor do Ajuste:</label>
              <input class="pos-input" id="simValInput" style="${result && result.status === 422 ? 'border-color:#ef4444; background:#200b0e;' : ''}" value="${currentMode === 'fix' ? '250' : '-250'}">
              <span style="font-size:10px; color:#94a3b8;">Dica: Operador inseriu valor negativo para indicar débito</span>
            </div>
            <button class="btn btn-primary" id="btnSimTriggerInternal" style="width:100%; margin-top:6px;">
              Salvar Ajuste de Saldo
            </button>
          </div>
          ${renderResultBanner(result)}
        </div>
      `;
      break;

    case 'SCN-04': // SMS Queue Offline (RabbitMQ)
      screenHtml = `
        <div class="device-top-bar">
          <span class="device-name">📱 Celular do Cliente • Balcão Matola Express</span>
          <span class="device-icons">Rede: 4G | 08:42</span>
        </div>
        <div class="device-screen-content">
          <div class="phone-mockup-wrapper">
            <div class="phone-notch"></div>
            <div class="phone-screen-inner">
              <div style="text-align:center;">
                <h4 style="color:#f8fafc; font-size:14px; margin-bottom:4px;">Validação de Voucher</h4>
                <p style="font-size:11px; color:#94a3b8;">Insira o código enviado por SMS para +258 84 990 011</p>
              </div>
              <div class="otp-box-display">
                <div class="otp-digit">-</div>
                <div class="otp-digit">-</div>
                <div class="otp-digit">-</div>
                <div class="otp-digit">-</div>
                <div class="otp-digit">-</div>
                <div class="otp-digit">-</div>
              </div>
              <div class="otp-timer">Reenviar SMS em: 00:00 (Expirado)</div>
              <button class="btn btn-outline" id="btnSimTriggerInternal" style="font-size:11px; width:100%;">
                📩 Pressionar 'Reenviar SMS com Código'
              </button>
            </div>
          </div>
          ${renderResultBanner(result)}
        </div>
      `;
      break;

    case 'SCN-05': // 401 Invalid API Key
      screenHtml = `
        <div class="device-top-bar">
          <span class="device-name">⚙️ ERP Pro Retail • Configuração de Integração de Fidelidade</span>
          <span class="device-icons">Ambiente: PRODUÇÃO</span>
        </div>
        <div class="device-screen-content">
          <div style="background:#0d1422; padding:14px; border-radius:6px; border:1px solid #1e293b; max-width:500px; margin:0 auto;">
            <div class="pos-input-group" style="margin-bottom:10px;">
              <label>Chave de API (x-api-key) Configurada:</label>
              <input class="pos-input" value="${currentMode === 'fix' ? 'fidli_live_9a8b7c6d5e4f3a2b1c' : 'fidli_sec_test_invalid_99'}" readonly>
            </div>
            <div class="pos-input-group" style="margin-bottom:12px;">
              <label>Endpoint Testado:</label>
              <input class="pos-input" value="GET /api/partner/v1/catalog" readonly>
            </div>
            <button class="btn btn-primary" id="btnSimTriggerInternal" style="width:100%;">
              🔍 Testar Conexão com Catálogo de Prémios
            </button>
          </div>
          ${renderResultBanner(result)}
        </div>
      `;
      break;

    case 'SCN-06': // 429 Rate Limit
      screenHtml = `
        <div class="device-top-bar">
          <span class="device-name">🖥️ Supermercado VIP • Rotina de Fechamento Noturno</span>
          <span class="device-icons">Job: cron_sync_23h.sh</span>
        </div>
        <div class="device-screen-content">
          <div style="background:#090d15; border:1px solid #1e293b; padding:14px; border-radius:6px; font-family:var(--font-mono); font-size:12px; color:#a5f3fc;">
            <div>$ ./sync-transactions.sh --batch-size 50 --all</div>
            <div style="margin-top:6px; color:#cbd5e1;">Iniciando sincronização de 50 transações acumuladas...</div>
            <div style="background:#1e293b; height:10px; border-radius:4px; margin:10px 0; overflow:hidden;">
              <div style="background:#3b82f6; width:${result && result.status === 429 ? '12%' : result ? '100%' : '0%'}; height:100%; transition:width 0.4s;"></div>
            </div>
            <button class="btn btn-primary" id="btnSimTriggerInternal" style="font-family:var(--font-sans); margin-top:6px;">
              ▶ Executar Disparo de Sincronização
            </button>
          </div>
          ${renderResultBanner(result)}
        </div>
      `;
      break;

    case 'SCN-07': // NUIT Conflict 409
      screenHtml = `
        <div class="device-top-bar">
          <span class="device-name">📋 Balcão Polana Shopping • Tablet de Novas Adesões</span>
          <span class="device-icons">Atendente: Fátima</span>
        </div>
        <div class="device-screen-content">
          <div style="background:#0d1422; padding:14px; border-radius:6px; border:1px solid #1e293b; max-width:480px; margin:0 auto; display:flex; flex-direction:column; gap:8px;">
            <div class="pos-input-group">
              <label>Nome Completo do Cliente:</label>
              <input class="pos-input" value="Amélia Mondlane Nova Adesão">
            </div>
            <div class="pos-input-group">
              <label>NUIT (Documento Fiscal Único):</label>
              <input class="pos-input" value="${currentMode === 'fix' ? '400554433' : '400123987'}">
            </div>
            <div class="pos-input-group">
              <label>Novo Telemóvel:</label>
              <input class="pos-input" value="+258 87 000 1122">
            </div>
            <button class="btn btn-primary" id="btnSimTriggerInternal" style="margin-top:6px;">
              ➕ Submeter Novo Cadastro
            </button>
          </div>
          ${renderResultBanner(result)}
        </div>
      `;
      break;

    case 'SCN-08': // ENOTFOUND Banking VPN
      screenHtml = `
        <div class="device-top-bar">
          <span class="device-name">🏦 Central Financeira • Módulo de Liquidação Bancária</span>
          <span class="device-icons">Alvo: api.partner-bank.co.mz</span>
        </div>
        <div class="device-screen-content">
          <div style="background:#0d1422; padding:14px; border-radius:6px; border:1px solid #1e293b; max-width:480px; margin:0 auto;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
              <strong>Resgates Pendentes para Contas Bancárias:</strong>
              <span class="badge badge-priority priority-alta">14 Pedidos</span>
            </div>
            <p style="font-size:12px; color:#94a3b8; margin-bottom:10px;">Testar link de interconexão com o banco parceiro antes de processar a folha de resgates.</p>
            <button class="btn btn-primary" id="btnSimTriggerInternal" style="width:100%;">
              📡 Checar Conexão com Gateway Bancário
            </button>
          </div>
          ${renderResultBanner(result)}
        </div>
      `;
      break;

    case 'SCN-09': // POS Token Expired 401
      screenHtml = `
        <div class="device-top-bar">
          <span class="device-name">🥖 Pastelaria Triunfo • Terminal POS Caixa Balcão</span>
          <span class="device-icons">06:30 AM | Bateria: 95%</span>
        </div>
        <div class="device-screen-content">
          <div style="background:#090d15; border:1px solid #334155; border-radius:8px; padding:16px; max-width:380px; margin:0 auto; text-align:center;">
            <div style="font-size:32px; margin-bottom:6px;">🔒</div>
            <h4 style="color:#f8fafc; font-size:14px; margin-bottom:4px;">Terminal Bloqueado</h4>
            <p style="font-size:12px; color:#cbd5e1; margin-bottom:12px;">Sessão expirada. Insira o cartão ou tente passar venda para verificar.</p>
            <button class="btn-pos-touch" id="btnSimTriggerInternal" style="width:100%;">
              💳 Tentar Passar Venda / Validar Turno
            </button>
          </div>
          ${renderResultBanner(result)}
        </div>
      `;
      break;

    case 'SCN-10': // App Version Deprecated 426
      screenHtml = `
        <div class="device-top-bar">
          <span class="device-name">📱 Tablet Lojista Beira Mall • App Fidli Merchant</span>
          <span class="device-icons">Versão: ${currentMode === 'fix' ? '2.4.2' : '1.2.0'}</span>
        </div>
        <div class="device-screen-content">
          <div style="background:#0d1422; border:1px solid #1e293b; border-radius:8px; padding:16px; max-width:440px; margin:0 auto; text-align:center;">
            <div style="font-size:36px; margin-bottom:6px;">🏪</div>
            <h4 style="color:#f8fafc; font-size:15px; margin-bottom:4px;">Fidli Merchant App</h4>
            <p style="font-size:12px; color:#94a3b8; margin-bottom:12px;">Acessando configuração do catálogo de produtos e pontos...</p>
            <button class="btn btn-primary" id="btnSimTriggerInternal" style="width:100%;">
              🚀 Abrir Painel de Vendas do Comerciante
            </button>
          </div>
          ${renderResultBanner(result)}
        </div>
      `;
      break;

    case 'SCN-11': // Sunmi Provisioning 400
      screenHtml = `
        <div class="device-top-bar">
          <span class="device-name">🔧 Assistente Técnico de Campo • Instalação Loja Xai-Xai</span>
          <span class="device-icons">Hardware: Sunmi V2 PRO</span>
        </div>
        <div class="device-screen-content">
          <div style="background:#0d1422; border:1px solid #1e293b; border-radius:6px; padding:14px; max-width:480px; margin:0 auto; display:flex; flex-direction:column; gap:8px;">
            <div class="pos-input-group">
              <label>Modelo do Aparelho:</label>
              <input class="pos-input" value="Sunmi V2 PRO" readonly>
            </div>
            <div class="pos-input-group">
              <label>Número de Série (SN):</label>
              <input class="pos-input" value="SN-9988221" readonly>
            </div>
            <div class="pos-input-group">
              <label>Terminal ID e Loja:</label>
              <input class="pos-input" value="${currentMode === 'fix' ? 'POS-XAIXAI-02 (Xai-Xai Centro)' : '[CAMPO OMITIDO NO PAYLOAD]'}" readonly style="${currentMode !== 'fix' ? 'color:#f87171;' : ''}">
            </div>
            <button class="btn btn-primary" id="btnSimTriggerInternal" style="margin-top:6px;">
              💾 Provisionar Terminal no Backend
            </button>
          </div>
          ${renderResultBanner(result)}
        </div>
      `;
      break;

    case 'SCN-12': // MAC Address conflict 409
      screenHtml = `
        <div class="device-top-bar">
          <span class="device-name">⛽ Bombas Zimpeto • Pareamento de Equipamento Substituído</span>
          <span class="device-icons">Hardware ID Detectado</span>
        </div>
        <div class="device-screen-content">
          <div style="background:#0d1422; border:1px solid #1e293b; border-radius:6px; padding:14px; max-width:480px; margin:0 auto;">
            <div class="pos-input-group" style="margin-bottom:8px;">
              <label>Endereço Físico (MAC Address) do Aparelho:</label>
              <input class="pos-input" value="00:1A:2B:3C:4D:5E" readonly>
            </div>
            <div class="pos-input-group" style="margin-bottom:12px;">
              <label>Loja Destino a Vincular:</label>
              <input class="pos-input" value="Bombas Zimpeto (POS-ZIMPETO-01)" readonly>
            </div>
            <button class="btn btn-primary" id="btnSimTriggerInternal" style="width:100%;">
              🔗 Parear Equipamento com Loja do Zimpeto
            </button>
          </div>
          ${renderResultBanner(result)}
        </div>
      `;
      break;
  }

  clientDeviceFrame.innerHTML = screenHtml;

  // Bind internal button trigger
  const internalBtn = clientDeviceFrame.querySelector('#btnSimTriggerInternal');
  if (internalBtn) {
    internalBtn.addEventListener('click', () => {
      executeCurrentRequest();
    });
  }
}

function renderResultBanner(result) {
  if (!result) {
    return `<div style="text-align:center; padding:10px; font-size:11px; color:#64748b;">Aguardando interação no dispositivo acima...</div>`;
  }

  if (result.status >= 400) {
    return `
      <div class="sim-alert-overlay sim-alert-error">
        <h4>⚠️ Ocorreu um Erro no Dispositivo do Cliente (HTTP ${result.status})</h4>
        <p><strong>Mensagem na Tela do Cliente:</strong> "${escapeHtml(result.data?.message || result.data?.error || 'Erro inesperado')}"</p>
        <div style="font-size:11px; color:#fda4af; display:flex; justify-content:space-between; margin-top:4px;">
          <span>Causa Técnica: <code>${escapeHtml(result.data?.code || result.data?.name || result.statusText)}</code></span>
          <span style="text-decoration:underline; cursor:pointer;" onclick="switchMainView('tech')">Ver Logs & Payload Completo ➔</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="sim-alert-overlay sim-alert-success">
      <h4>✔ Operação Concluída com Sucesso no Dispositivo (HTTP ${result.status})</h4>
      <p>A transação/operação foi aceita normalmente pelo servidor sem erros.</p>
      <div style="font-size:11px; color:#6ee7b7; margin-top:2px;">
        Status: <code>${escapeHtml(result.data?.status || 'OK')}</code> • Código: <code>${escapeHtml(result.data?.authorizationCode || result.data?.transactionId || 'SUCESSO')}</code>
      </div>
    </div>
  `;
}

function loadPayloadForCurrentMode() {
  if (!currentScenario) return;

  const isFix = currentMode === 'fix';
  const payload = isFix ? (currentScenario.fixedPayload || {}) : (currentScenario.defaultPayload || {});
  const headers = isFix ? (currentScenario.fixedHeaders || currentScenario.headers || {}) : (currentScenario.headers || {});

  payloadEditor.value = Object.keys(payload).length > 0 ? JSON.stringify(payload, null, 2) : '{}';
  headersEditor.value = Object.keys(headers).length > 0 ? JSON.stringify(headers, null, 2) : '{}';
  updateHeadersCount();
  updateCurlPreview();
}

function updateModeButtons() {
  btnModeBreak.classList.toggle('active', currentMode === 'break');
  btnModeFix.classList.toggle('active', currentMode === 'fix');
}

function updateHeadersCount() {
  try {
    const parsed = JSON.parse(headersEditor.value || '{}');
    headerCount.textContent = Object.keys(parsed).length;
  } catch (e) {
    headerCount.textContent = '!';
  }
}

function updateCurlPreview() {
  if (!currentScenario) return;

  const method = currentScenario.method;
  let endpoint = currentScenario.endpoint;
  if (currentMode === 'fix') {
    endpoint += (endpoint.includes('?') ? '&' : '?') + 'simulateFix=true';
  }

  let headersObj = {};
  try {
    headersObj = JSON.parse(headersEditor.value || '{}');
  } catch (e) {}

  let headerFlags = Object.entries(headersObj)
    .map(([k, v]) => `-H "${k}: ${v}"`)
    .join(' ');

  let bodyFlag = '';
  if (method !== 'GET') {
    let cleanJson = payloadEditor.value.trim().replace(/\n/g, '');
    bodyFlag = `-d '${cleanJson}'`;
  }

  curlPreview.textContent = `curl -X ${method} "http://localhost:3000${endpoint}" ${headerFlags} ${bodyFlag}`.trim();
}

async function executeCurrentRequest() {
  if (!currentScenario) return;

  btnExecuteRequest.disabled = true;
  btnExecuteRequest.innerHTML = `<span class="spinner-inline"></span> Enviando...`;
  if (btnClientSimTriggerError) btnClientSimTriggerError.innerHTML = `<span class="spinner-inline"></span> Executando...`;
  if (btnClientSimTriggerFix) btnClientSimTriggerFix.innerHTML = `<span class="spinner-inline"></span> Executando...`;

  respStatusPill.className = 'status-pill status-idle';
  respStatusPill.textContent = 'Aguardando resposta do servidor...';
  respTimePill.classList.add('hidden');
  responseBodyViewer.textContent = `// ⏳ Enviando requisição para ${currentScenario.method} ${currentScenario.endpoint}...\n// Aguardando retorno da API e logs do servidor...`;

  const scenarioLoadingTextMap = {
    'SCN-01': { title: 'Gravando Transação no Cluster MongoDB...', sub: 'Tentando inserir documento de acúmulo de pontos com chave única referenceId.' },
    'SCN-02': { title: 'Aguardando Resposta do Gateway Vodacom M-Pesa...', sub: 'Chamada externa com SLA de 5000ms. Aguardando callback bancário...' },
    'SCN-03': { title: 'Validando Schema do Ajuste de Saldo...', sub: 'Checando regras de validação de valores monetários estritamente positivos.' },
    'SCN-04': { title: 'Conectando ao Broker RabbitMQ...', sub: 'Tentando enfileirar mensagem de SMS na fila notifications.sms.critical.' },
    'SCN-05': { title: 'Autenticando Chave de API no Gateway...', sub: 'Validando cabeçalho x-api-key contra a base de parceiros autorizados.' },
    'SCN-06': { title: 'Executando Lote de Sincronização...', sub: 'Avaliando limite de cota de requisições por minuto (Rate Limit 5 req/min).' },
    'SCN-07': { title: 'Verificando Unicidade do Documento Fiscal...', sub: 'Consultando se o NUIT informado já possui cadastro ativo no sistema.' },
    'SCN-08': { title: 'Estabelecendo Túnel de Conectividade Bancária...', sub: 'Efetuando resolução DNS externa getaddrinfo api.partner-bank.co.mz.' },
    'SCN-09': { title: 'Validando Assinatura do Token JWT...', sub: 'Verificando tempo de expiração da sessão do operador de caixa.' },
    'SCN-10': { title: 'Consultando Política de Versões da API...', sub: 'Checando compatibilidade mínima da versão do aplicativo móvel.' },
    'SCN-11': { title: 'Validando Schema de Inicialização do Terminal...', sub: 'Conferindo campos obrigatórios: terminalId, storeLocation, merchantId.' },
    'SCN-12': { title: 'Checando Conflitos de Hardware (MAC Address)...', sub: 'Verificando vínculos de equipamento físico ativo em outras lojas.' }
  };

  const loaderInfo = scenarioLoadingTextMap[currentScenario.id] || { title: 'Processando requisição...', sub: 'Aguardando backend...' };
  showGlobalProgress();
  showDeviceLoading(loaderInfo.title, loaderInfo.sub, currentScenario.id === 'SCN-02' ? 5 : null);

  const startTime = Date.now();
  let endpoint = currentScenario.endpoint;
  if (currentMode === 'fix') {
    endpoint += (endpoint.includes('?') ? '&' : '?') + 'simulateFix=true';
  }

  let headers = { 'Content-Type': 'application/json' };
  try {
    const customHeaders = JSON.parse(headersEditor.value || '{}');
    headers = { ...headers, ...customHeaders };
  } catch (e) {
    showToast('Erro de sintaxe no JSON dos Headers');
    btnExecuteRequest.disabled = false;
    btnExecuteRequest.innerHTML = `Executar Requisição`;
    hideGlobalProgress();
    hideDeviceLoading();
    return;
  }

  let body = undefined;
  if (currentScenario.method !== 'GET') {
    try {
      const parsedBody = JSON.parse(payloadEditor.value || '{}');
      if (currentMode === 'fix') {
        parsedBody.simulateFix = true;
      }
      body = JSON.stringify(parsedBody);
    } catch (e) {
      showToast('Erro de sintaxe no JSON do Request Body');
      btnExecuteRequest.disabled = false;
      btnExecuteRequest.innerHTML = `Executar Requisição`;
      hideGlobalProgress();
      hideDeviceLoading();
      return;
    }
  }

  try {
    const res = await fetch(endpoint, {
      method: currentScenario.method,
      headers,
      body
    });

    const duration = Date.now() - startTime;
    respTimePill.textContent = `${duration} ms`;
    respTimePill.classList.remove('hidden');

    let responseData;
    const text = await res.text();
    try {
      responseData = JSON.parse(text);
      responseBodyViewer.textContent = JSON.stringify(responseData, null, 2);
    } catch (e) {
      responseBodyViewer.textContent = text;
    }

    // Status pill
    const status = res.status;
    let statusClass = 'status-2xx';
    if (status >= 500) {
      statusClass = 'status-5xx';
      errorCount++;
    } else if (status >= 400) {
      statusClass = 'status-4xx';
      errorCount++;
    }

    respStatusPill.className = `status-pill ${statusClass}`;
    respStatusPill.textContent = `${status} ${res.statusText || getStatusText(status)}`;

    // Store last result and update client simulator view
    lastExecutionResult = {
      status,
      statusText: res.statusText || getStatusText(status),
      data: responseData,
      duration
    };
    renderClientSimulator(currentScenario, lastExecutionResult);

    // Mark scenario as tested
    testedScenarios.add(currentScenario.id);
    testedScenariosCount.textContent = testedScenarios.size;
    errorsLoggedCount.textContent = errorCount;
    renderScenarioList();

    // Trigger immediate log refresh
    await fetchLogs();

  } catch (err) {
    const duration = Date.now() - startTime;
    respTimePill.textContent = `${duration} ms`;
    respTimePill.classList.remove('hidden');
    respStatusPill.className = 'status-pill status-5xx';
    respStatusPill.textContent = 'Erro de Conexão com Servidor';
    responseBodyViewer.textContent = `// Falha de rede: ${err.message}\nVerifique se o backend está ativo na porta 3000.`;

    lastExecutionResult = {
      status: 500,
      statusText: 'Network Failure',
      data: { message: err.message, error: 'ConnectionRefused' },
      duration
    };
    renderClientSimulator(currentScenario, lastExecutionResult);
  } finally {
    hideGlobalProgress();
    hideDeviceLoading();

    btnExecuteRequest.disabled = false;
    btnExecuteRequest.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Executar Requisição
    `;
    if (btnClientSimTriggerError) btnClientSimTriggerError.innerHTML = `🔴 Simular Ação do Cliente (Causar Erro)`;
    if (btnClientSimTriggerFix) btnClientSimTriggerFix.innerHTML = `🟢 Simular com Correção (Sucesso)`;
  }
}

function getStatusText(status) {
  const map = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    400: 'Bad Request',
    401: 'Unauthorized',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    426: 'Upgrade Required',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  };
  return map[status] || '';
}

function startLogPolling() {
  fetchLogs();
  logPollingInterval = setInterval(fetchLogs, 1500);
}

async function fetchLogs() {
  try {
    const res = await fetch('/api/logs?limit=40');
    if (!res.ok) return;
    const data = await res.json();
    renderLogs(data.logs || []);
  } catch (e) {
    // silently ignore network blips
  }
}

function renderLogs(logs) {
  logCountLabel.textContent = `${logs.length} entradas`;

  const filtered = logs.filter(log => {
    if (currentLogLevelFilter === 'ALL') return true;
    return log.level === currentLogLevelFilter;
  });

  if (filtered.length === 0) {
    terminalLogsContainer.innerHTML = `<div class="terminal-empty">Nenhum log com nível '${currentLogLevelFilter}'.</div>`;
    return;
  }

  // Reverse so newest at bottom
  const entriesHtml = filtered.slice().reverse().map(log => {
    const timeFormatted = new Date(log.timestamp).toLocaleTimeString();
    const hasMeta = log.meta && Object.keys(log.meta).length > 0;

    let metaHtml = '';
    if (hasMeta) {
      metaHtml = `<div class="log-meta-tree">${escapeHtml(JSON.stringify(log.meta, null, 2))}</div>`;
    }

    return `
      <div class="log-entry level-${log.level}">
        <span class="log-time">[${timeFormatted}]</span>
        <span class="log-level-badge">${log.level}</span>
        <span class="log-msg">${escapeHtml(log.message)}</span>
        ${metaHtml}
      </div>
    `;
  }).join('');

  terminalLogsContainer.innerHTML = entriesHtml;

  if (chkAutoScroll.checked) {
    terminalLogsContainer.scrollTop = terminalLogsContainer.scrollHeight;
  }
}

function setupEventListeners() {
  tabBtnClientView.addEventListener('click', () => switchMainView('client'));
  tabBtnTechView.addEventListener('click', () => switchMainView('tech'));
  btnGoToTechView.addEventListener('click', () => switchMainView('tech'));

  btnClientSimTriggerError.addEventListener('click', () => {
    currentMode = 'break';
    updateModeButtons();
    loadPayloadForCurrentMode();
    executeCurrentRequest();
  });

  btnClientSimTriggerFix.addEventListener('click', () => {
    currentMode = 'fix';
    updateModeButtons();
    loadPayloadForCurrentMode();
    executeCurrentRequest();
  });

  // Search
  scenarioSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderScenarioList();
  });

  // Category filter tabs
  categoryTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('cat-tab')) {
      document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.dataset.cat;
      renderScenarioList();
    }
  });

  // Mode buttons in Tech Tester
  btnModeBreak.addEventListener('click', () => {
    currentMode = 'break';
    updateModeButtons();
    loadPayloadForCurrentMode();
  });

  btnModeFix.addEventListener('click', () => {
    currentMode = 'fix';
    updateModeButtons();
    loadPayloadForCurrentMode();
  });

  // Editor tabs
  document.querySelectorAll('.ed-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ed-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById('tabContentBody').classList.toggle('hidden', target !== 'body');
      document.getElementById('tabContentHeaders').classList.toggle('hidden', target !== 'headers');
      document.getElementById('tabContentCurl').classList.toggle('hidden', target !== 'curl');
      if (target === 'curl') updateCurlPreview();
    });
  });

  payloadEditor.addEventListener('input', () => updateCurlPreview());
  headersEditor.addEventListener('input', () => {
    updateHeadersCount();
    updateCurlPreview();
  });

  // Buttons
  btnExecuteRequest.addEventListener('click', executeCurrentRequest);

  btnCopyCurl.addEventListener('click', () => {
    navigator.clipboard.writeText(curlPreview.textContent);
    btnCopyCurl.textContent = 'Copiado!';
    setTimeout(() => { btnCopyCurl.textContent = 'Copiar cURL'; }, 1500);
  });

  btnCopyResponse.addEventListener('click', () => {
    navigator.clipboard.writeText(responseBodyViewer.textContent);
    btnCopyResponse.textContent = 'Copiado!';
    setTimeout(() => { btnCopyResponse.textContent = 'Copiar JSON'; }, 1500);
  });

  btnClearLogs.addEventListener('click', async () => {
    await fetch('/api/logs/clear', { method: 'POST' });
    await fetchLogs();
  });

  btnCopyLogs.addEventListener('click', () => {
    const text = Array.from(terminalLogsContainer.querySelectorAll('.log-entry'))
      .map(el => el.innerText)
      .join('\n');
    navigator.clipboard.writeText(text);
    showToast('Logs copiados para a área de transferência');
  });

  document.querySelectorAll('.log-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.log-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLogLevelFilter = btn.dataset.filter;
      fetchLogs();
    });
  });

  document.getElementById('btnResetState').addEventListener('click', async () => {
    if (confirm('Deseja resetar o estado das transações e limites de taxa para os padrões iniciais?')) {
      await fetch('/api/reset-state', { method: 'POST' });
      testedScenarios.clear();
      testedScenariosCount.textContent = '0';
      errorCount = 0;
      errorsLoggedCount.textContent = '0';
      renderScenarioList();
      lastExecutionResult = null;
      if (currentScenario) renderClientSimulator(currentScenario, null);
      await fetchLogs();
      showToast('Estado restaurado para os valores padrão');
    }
  });

  if (btnGuideDoc) {
    btnGuideDoc.addEventListener('click', () => {
      switchModalTab('guide');
      ticketsModal.classList.remove('hidden');
    });
  }

  if (btnTicketsDoc) {
    btnTicketsDoc.addEventListener('click', () => {
      switchModalTab('tickets');
      ticketsModal.classList.remove('hidden');
    });
  }

  if (modalTabBtnGuide) modalTabBtnGuide.addEventListener('click', () => switchModalTab('guide'));
  if (modalTabBtnTickets) modalTabBtnTickets.addEventListener('click', () => switchModalTab('tickets'));

  btnCloseModal.addEventListener('click', () => ticketsModal.classList.add('hidden'));
  btnGotItModal.addEventListener('click', () => ticketsModal.classList.add('hidden'));
  ticketsModal.addEventListener('click', (e) => {
    if (e.target === ticketsModal) ticketsModal.classList.add('hidden');
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', initApp);
