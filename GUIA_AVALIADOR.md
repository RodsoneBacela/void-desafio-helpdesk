# Guia do Avaliador & Gabarito Técnico de Suporte (N1 / N2)

> **Documento Interno e Confidencial**  
> **Destinatários:** Banca Avaliadora, Coordenação de Suporte & Liderança Técnica  
> **Objetivo:** Critérios de pontuação, gabarito técnico dos 12 incidentes e matriz de competências para correção do `SIMULACAO_TICKETS.md`.

---

## 📊 Matriz de Avaliação e Pesos

| Dimensão | Peso | Critérios de Pontuação |
| :--- | :---: | :--- |
| **1. Atendimento & Comunicação com o Cliente** | **35%** | Clareza, cordialidade, postura profissional, empatia com o impacto do lojista; ausência de jargões internos crus (ex: não repassar termos de stack trace ao cliente); instruções passo-a-passo acionáveis. |
| **2. Diagnóstico Técnico & Interpretação de Logs** | **40%** | Precisão na identificação da causa raiz com base nos códigos HTTP (4xx vs 5xx), exceções do servidor, parâmetros de requisição e evidências do console. |
| **3. Procedimentos Operacionais & Roteamento (SLA)** | **25%** | Discernimento correto entre resolução local no N1 e abertura de chamado qualificado para N2/DevOps/Engenharia (com IDs, timestamps e evidências). |

---

## 🏆 Gabarito Detalhado dos 12 Cenários

---

### SCN-01: Duplicate Key Error (E11000)
- **Causa Raiz Técnica:** Tentativa de inserção no MongoDB com uma chave única duplicada (`referenceId_1 dup key: { referenceId: "TX-99821" }`). Acontece quando o operador clica duas vezes rapidamente no botão "Submeter" ou o POS reenvia a mesma referência que já havia sido gravada com sucesso.
- **Resposta Esperada ao Cliente:**
  - Informar cordialidade e acalmar o lojista quanto à fila.
  - Explicar que a transação `TX-99821` **já foi gravada anteriormente** no sistema e que os pontos do cliente já foram computados.
  - Solicitar que o operador consulte o extrato do cliente no terminal ou, caso seja uma nova venda real, gere um novo comprovante/referência diferente.
- **Ação / Roteamento N1:**
  - N1 consulta a transação no painel de gestão para confirmar a data/hora e o saldo do cliente.
  - Não requer escalonamento se a transação já constar no banco. Se for bug de interface do POS clicando em duplicidade, documentar para a equipa de produto/frontend.
- **Desvio / Erro Típico de Análise:** O candidato dizer ao cliente "deu erro no banco MongoDB código 11000" ou sugerir recriar o banco de dados.

---

### SCN-02: Payment Gateway Timeout (ETIMEDOUT / 504)
- **Causa Raiz Técnica:** O gateway de pagamentos externo da operadora (M-Pesa IPG `196.28.232.10:443`) não respondeu à chamada HTTP dentro do timeout de 5 segundos (`connect ETIMEDOUT`). Como o M-Pesa debitou a carteira do cliente antes de confirmar o callback para o Fidli, a transação ficou em estado assíncrono pendente.
- **Resposta Esperada ao Cliente:**
  - Acolhimento imediato com senso de urgência devido ao dinheiro do cliente.
  - Tranquilizar a gerente informando que o valor não se perdeu e está retido na operadora aguardando reconciliação.
  - Solicitar a lista de IDs de transação / números de telemóvel dos 8 clientes afetados para verificação imediata.
- **Ação / Roteamento N1:**
  - Prioridade: **Crítica (P1)**.
  - N1 aciona procedimento de reconciliação de pagamentos ou abre chamado urgente para N2 / Operações Financeiras com o log `ETIMEDOUT` e as referências dos pedidos.
  - Alerta no canal de incidentes sobre instabilidade no gateway da Vodacom/M-Pesa.
- **Desvio / Erro Típico de Análise:** Mandar o cliente passar a compra de novo no cartão ou mandar o cliente ligar para a Vodacom sem verificar o log interno.

---

### SCN-03: ValidationError: amount must be positive (422)
- **Causa Raiz Técnica:** A API possui validação de schema que exige que o campo `amount` seja um número positivo estrito (`amount > 0`). O programador do parceiro enviou `-250` acreditando que valores negativos representavam estornos, violando a especificação do contrato REST.
- **Resposta Esperada ao Cliente:**
  - Explicar com clareza ao desenvolvedor que o campo `amount` deve conter sempre o valor absoluto positivo (ex: `250`).
  - O sentido da operação (se é débito ou estorno) deve ser definido pelo parâmetro `operationType` (ex: `POINTS_ADJUSTMENT` ou `DEBIT`) e não com sinal negativo.
  - Enviar link da documentação da API.
- **Ação / Roteamento N1:**
  - Resolvido diretamente no N1 (Suporte a Desenvolvedores). Nenhuma necessidade de escalar para engenharia.
- **Desvio / Erro Típico de Análise:** O candidato achar que a API está com bug e abrir bug no Jira para o time de backend aceitar números negativos.

---

### SCN-04: Queue Dispatch Unavailable (RabbitMQ 503)
- **Causa Raiz Técnica:** O serviço de mensageria não conseguiu conectar ao cluster RabbitMQ (`notifications.sms.critical` no vhost `/fidli`). Canal fechado ou fila inexistente no broker, impedindo o enfileiramento de SMS transacionais de OTP.
- **Resposta Esperada ao Cliente:**
  - Reconhecer a indisponibilidade do envio de SMS com empatia.
  - Oferecer alternativa de contingência imediata (ex: validação por e-mail ou código gerado no app do comerciante, caso disponível).
  - Informar que a equipa de infraestrutura já foi mobilizada para restabelecer o serviço.
- **Ação / Roteamento N1:**
  - Prioridade: **Alta (P2)**.
  - Escalonamento imediato para **DevOps / Engenharia de Infraestrutura** com cópia do log `AmqpConnectionError: channel closed` e host afetado.
- **Desvio / Erro Típico de Análise:** Mandar o cliente trocar o chip do telemóvel ou reiniciar o smartphone, sem perceber que a falha é do RabbitMQ interno.

---

### SCN-05: Unauthorized Invalid API Key (401)
- **Causa Raiz Técnica:** A rotação de chaves do parceiro utilizou uma chave inválida (`fidli_sec_test_invalid_99`) que não consta na base de dados de autorização de parceiros ativos do gateway.
- **Resposta Esperada ao Cliente:**
  - Informar cordialmente ao engenheiro que a chave enviada no cabeçalho `x-api-key` não foi reconhecida pelo ambiente de produção.
  - Orientar o desenvolvedor a conferir se ele utilizou a chave gerada para o ambiente Staging/Sandbox em vez de Produção, ou indicar o portal de parceiros onde o administrador da empresa dele pode consultar a chave ativa.
- **Ação / Roteamento N1:**
  - N1 verifica no portal de administração se a empresa tem uma chave gerada recente. Se a chave foi revogada por engano, N1 gera nova chave mediante validação cadastral.
- **Desvio / Erro Típico de Análise:** Enviar chaves de segurança por e-mail em texto puro sem protocolo de validação de identidade.

---

### SCN-06: Rate Limit Exceeded (429)
- **Causa Raiz Técnica:** A política de proteção da API limita as requisições a 5 req/minuto por parceiro. O script disparou 50 transações por segundo em loop síncrono, acionando o status HTTP 429 com cabeçalho `Retry-After: 45`.
- **Resposta Esperada ao Cliente:**
  - Explicar o conceito de Rate Limit como mecanismo de estabilidade do ecossistema.
  - Sugerir boas práticas de engenharia:
    1. Implementar retentativas com Exponential Backoff (esperar o tempo do `Retry-After`).
    2. Utilizar o endpoint de sincronização em lote (`batch`) em vez de disparar 500 requisições unitárias em milissegundos.
- **Ação / Roteamento N1:**
  - Resolvido no N1. Se o parceiro realmente necessita de um limite maior permanente, N1 pode abrir ticket de solicitação comercial para a equipa de produto/infra.
- **Desvio / Erro Típico de Análise:** Culpar o parceiro de "tentar hackear" ou tentar desativar o rate limit no código da API.

---

### SCN-07: Customer NUIT Already Registered (409)
- **Causa Raiz Técnica:** O NUIT (Número Único de Identificação Tributária) é um documento único e obrigatório por cliente. O NUIT `400123987` já pertence ao cadastro `CUST-1001` (Amélia Mondlane).
- **Resposta Esperada ao Cliente:**
  - Orientar a atendente da loja a **não criar um novo cadastro**, pois duplicar NUIT viola a integridade dos dados e a legislação fiscal.
  - O procedimento correto é acessar a opção "Recuperar Conta / Associar Novo Cartão" e vincular o novo telefone ou emitir nova via para o cadastro já existente `CUST-1001`.
- **Ação / Roteamento N1:**
  - Resolvido diretamente no N1 através do painel de Helpdesk (busca de cliente por NUIT e atualização do telefone/cartão).
- **Desvio / Erro Típico de Análise:** Sugerir alterar o NUIT para um número falso para conseguir salvar o formulário.

---

### SCN-08: Partner Banking DNS ENOTFOUND / VPN Down (502)
- **Causa Raiz Técnica:** O resolvedor DNS ou o túnel IPsec de interconexão direta com o banco parceiro caiu (`getaddrinfo ENOTFOUND api.partner-bank.co.mz`). O microserviço do Fidli não consegue encontrar a rota de rede para o host bancário.
- **Resposta Esperada ao Cliente / Stakeholders:**
  - Comunicado de incidente de severidade alta: "Informamos que as operações de resgate bancário estão temporariamente indisponíveis devido a uma instabilidade de comunicação no link com a rede bancária parceira. Nossa equipa de conectividade já está a tratar o caso com a maior brevidade."
- **Ação / Roteamento N1:**
  - Severidade: **Crítica (P1)**.
  - Escalonamento imediato para **DevOps / SysAdmin / Rede (VPN & Cloud)** com cópia do log `getaddrinfo ENOTFOUND` e teste de ping/traceroute/strongSwan.
- **Desvio / Erro Típico de Análise:** Tratar como erro de código Javascript em vez de falha de infraestrutura de rede/VPN.

---

### SCN-09: POS Token Expired JWT (401)
- **Causa Raiz Técnica:** O token JWT de autenticação do operador no terminal expirou após o período de validade (`TokenExpiredError: jwt expired`). Reiniciar o aparelho não resolve porque o token expirado continua gravado no cache local do aplicativo.
- **Resposta Esperada ao Cliente:**
  - Explicar gentilmente que o reinício físico não renova a segurança da sessão.
  - Fornecer o passo a passo claro:
    1. Clicar no menu lateral do aplicativo do POS.
    2. Selecionar **"Encerrar Sessão / Sair" (Logout)**.
    3. Digitar novamente o código de operador e PIN de acesso para gerar um novo token ativo.
- **Ação / Roteamento N1:**
  - Resolvido em linha pelo N1. Se o operador esqueceu o PIN, N1 pode realizar o reset de senha após conferência de segurança.
- **Desvio / Erro Típico de Análise:** Mandar formatar o POS de fábrica ou substituir o aparelho físico por correio.

---

### SCN-10: App Version Deprecated Upgrade Required (426)
- **Causa Raiz Técnica:** O tablet está executando a versão legada `1.2.0`. A API de backend bloqueia ativamente versões inferiores a `2.1.0` com código HTTP `426 Upgrade Required` devido à descontinuação de contratos antigos de segurança.
- **Resposta Esperada ao Cliente:**
  - Tranquilizar a gerente explicando que o bloqueio é uma proteção de segurança do aplicativo.
  - Instruir a acessar a Google Play Store (ou loja de apps do POS) no tablet e clicar em "Atualizar aplicativo Fidli Merchant".
  - Após a atualização para a versão mais recente (2.4.x), o acesso será liberado de imediato.
- **Ação / Roteamento N1:**
  - Resolvido no N1. Nenhuma alteração no backend é necessária.
- **Desvio / Erro Típico de Análise:** Tentar reverter a regra de versão mínima no servidor para acomodar o app velho.

---

### SCN-11: POS Terminal Provisioning Missing Fields (400)
- **Causa Raiz Técnica:** O instalador enviou apenas `terminalModel` e `serialNumber`. O validador da rota `/register` exige estritamente `terminalId`, `storeLocation` e `merchantId`.
- **Resposta Esperada ao Técnico de Campo:**
  - Apontar exatamente os 3 campos ausentes: `terminalId`, `storeLocation` e `merchantId`.
  - Fornecer o exemplo de payload correto para ele colar na requisição.
- **Ação / Roteamento N1:**
  - Resolvido no N1 (Suporte a Operações de Campo).
- **Desvio / Erro Típico de Análise:** Dizer genericamente "deu erro 400" sem listar quais campos estão em falta.

---

### SCN-12: Conflict MAC Address already paired (409)
- **Causa Raiz Técnica:** Política de integridade de segurança física: o endereço MAC `00:1A:2B:3C:4D:5E` já se encontra registrado e associado ativamente ao terminal `POS-LOJA-01` (Matola). O sistema bloqueia a vinculação simultânea a outra filial para prevenir fraudes.
- **Resposta Esperada ao Cliente:**
  - Explicar ao gerente que cada aparelho físico possui um identificador único de segurança (MAC Address) que ainda está ativo na loja anterior.
  - Solicitar confirmação formal da transferência do equipamento.
  - Efetuar ou solicitar o despareamento do terminal antigo no sistema administrativo para que a loja do Zimpeto possa concluir o pareamento.
- **Ação / Roteamento N1:**
  - N1 acessa a consola de gestão de equipamentos, localiza o terminal `POS-LOJA-01`, desassocia o MAC address mediante procedimento de remanejamento de ativo patrimonial, permitindo novo pareamento.
- **Desvio / Erro Típico de Análise:** Não entender o que é endereço MAC e achar que é erro de cabo de rede ou IP.

---

## 💡 Perguntas Sugeridas para a Entrevista Técnica Verbal

1. *"Como você decide se um chamado deve ser resolvido imediatamente no N1 ou escalado para N2/DevOps?"*
2. *"Em um erro 504 Gateway Timeout em pagamentos com cartão/M-Pesa, o que você nunca deve instruir o cliente a fazer antes de checar a conciliação?"* (Resposta esperada: Nunca mandar passar de novo antes de verificar se o dinheiro saiu, para evitar cobrança em dobro).
3. *"Se um desenvolvedor parceiro diz que a nossa API está fora do ar, mas outros 100 parceiros estão operando normalmente, como você isola se o problema é na rede dele, na chave dele ou no nosso servidor?"*
4. *"Qual a diferença prática entre um erro HTTP 401 Unauthorized e um 403 Forbidden?"*
