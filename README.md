# Avaliação Prática de Operações & Suporte Técnico (N1/N2)

Bem-vindo ao repositório de avaliação técnica para as funções de **Suporte Técnico e Operações de Plataforma (N1 / N2)** da plataforma transacional Fidli.

Este ambiente reproduz ocorrências reais encontradas em produção (processamento de pagamentos, gateways móveis, reconciliação bancária, broker de mensagens, terminais POS e contratos de API de parceiros).

---

## 🎯 Objetivo da Avaliação

Avaliar as competências essenciais para a atuação no suporte de nível 1 e 2:
1. **Atendimento & Comunicação com o Cliente:** Capacidade de transmitir orientações claras, humanizadas e assertivas a lojistas, clientes finais e equipas técnicas externas, sem expor jargões de infraestrutura desnecessários.
2. **Diagnóstico Técnico & Análise de Logs:** Habilidade para correlacionar códigos de status HTTP, payloads de requisição/resposta e stack traces do servidor para determinar a causa raiz.
3. **Triagem, Procedimento & Roteamento:** Discernimento entre ocorrências resolvíveis diretamente no primeiro nível e falhas estruturais que exigem escalonamento qualificado para N2, DevOps ou Engenharia.

---

## 🚀 Como Iniciar o Projeto

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **NPM** (gerenciador de pacotes incluso no Node.js)
- Navegador web moderno

### Passo a Passo
1. Na raiz do repositório, instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o serviço de diagnóstico e o painel:
   ```bash
   npm start
   ```
3. Acesse o painel operacional no seu navegador:  
   👉 **`http://localhost:3000`**

---

## 🖥️ Como Operar o Painel de Diagnóstico

Ao acessar `http://localhost:3000`, utilize as duas abas principais de trabalho:
- **1. Interface do Dispositivo (Visão do Lojista/Cliente):** Permite reproduzir a ação exatamente na interface do equipamento afetado (Terminal POS de caixa, tela de checkout M-Pesa, telemóvel com SMS OTP, etc.).
- **2. Bancada Técnica N1 (API & Payloads):** Permite inspecionar a rota REST, headers, payload JSON enviado e recebido, além do código cURL equivalente.
- **Console do Servidor (Logs ao Vivo):** Espelha em tempo real o terminal do backend Node.js, com timestamps, níveis de log (`ERROR`, `WARN`, `INFO`) e detalhes técnicos para embasar o diagnóstico.

### Validação Automatizada de Rotas
Para verificar a integridade de todos os 12 endpoints da plataforma:
```bash
npm test
```

---

## 📁 Estrutura do Repositório

```text
desafio-helpdesk-monorepo/
├── package.json                 # Configuração do repositório e scripts de execução
├── README.md                    # Visão geral e instruções de inicialização
├── GUIA_DO_CANDIDATO.md         # 📘 Manual detalhado de operações e roteiro de preenchimento
├── SIMULACAO_TICKETS.md         # 📝 Caderno oficial com os 12 chamados a serem respondidos
├── GUIA_AVALIADOR.md            # Critérios de correção e matriz de competências da banca
├── server/
│   ├── package.json
│   └── src/
│       ├── server.js            # Entrypoint do serviço HTTP
│       ├── app.js               # Pipeline Express, rotas e tratamento de erros
│       ├── config/              # Variáveis de ambiente, SLAs e versões
│       ├── data/                # Metadados dos 12 incidentes e base em memória
│       ├── controllers/         # Controladores por domínio (pagamentos, POS, parceiros...)
│       ├── routes/              # Definições de rotas modulares (/api/...)
│       ├── middlewares/         # Profiler de latência e tratamento de erros
│       ├── utils/               # Logger operacional com cores e buffer
│       └── test-scenarios.js    # Suite de validação automatizada (npm test)
└── client/
    ├── index.html               # Painel web operacional
    ├── css/styles.css           # Estilização do console e simuladores de dispositivos
    └── js/app.js                # Lógica de interação, loaders e espelhamento de logs
```

---

## 📝 Instruções de Entrega

1. Consulte o [**`GUIA_DO_CANDIDATO.md`**](file:///home/java/Documentos/Cluster/desafio-helpdesk-monorepo/GUIA_DO_CANDIDATO.md) para conhecer a fundo a matriz de severidade e as boas práticas exigidas.
2. Abra o arquivo [**`SIMULACAO_TICKETS.md`**](file:///home/java/Documentos/Cluster/desafio-helpdesk-monorepo/SIMULACAO_TICKETS.md).
3. Preencha os 3 blocos obrigatórios de cada chamado:
   - **1. Resposta ao Cliente:** Comunicação direta com o solicitante.
   - **2. Diagnóstico Técnico N1:** Causa raiz sustentada por códigos e logs.
   - **3. Ação / Roteamento:** Ação de resolução no N1 ou protocolo de escalonamento.
4. Salve o arquivo preenchido e envie o repositório ou o arquivo conforme as orientações recebidas da equipa de recrutamento.
