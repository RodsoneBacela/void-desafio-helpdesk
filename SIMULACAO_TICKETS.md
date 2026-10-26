# 📋 Desafio Técnico: Simulação de Tickets de Suporte & Atendimento N1 / N2

> **Instruções para o Candidato:**
> Este documento contém **12 chamados reais** simulando ocorrências reportadas por clientes, lojistas parceiros, desenvolvedores e sistemas automatizados da nossa plataforma transacional.
> 
> Você deve executar o ambiente local do monorepo (`npm install && npm start`) e utilizar o painel interativo em `http://localhost:3000` para reproduzir as requisições, inspecionar os erros HTTP, ler os logs do servidor e entender a causa raiz de cada problema.
>
> Para cada chamado abaixo, preencha os 3 campos obrigatórios:
> 1. **Resposta ao Cliente:** Texto que será enviado diretamente ao cliente/parceiro (empático, profissional, claro e sem jargões indecifráveis).
> 2. **Diagnóstico Técnico N1:** Explicação técnica da causa raiz com base nos códigos HTTP, logs do backend e payloads inspecionados.
> 3. **Ação / Roteamento:** O que você mesmo resolve no N1 vs O que você escala (para quem, com quais evidências e nível de severidade).

---

## 📌 PARTE 1: TRANSAÇÕES & PAGAMENTOS

---

### [TICKET-01] Falha ao processar acúmulo de pontos no caixa (Erro 500)
- **ID Cenário:** `SCN-01`
- **Canal de Entrada:** WhatsApp Suporte Lojistas
- **Prioridade:** Alta
- **Remetente:** Sr. Arlindo Machava (Supermercado Aliança - Loja Central)
- **Mensagem do Cliente:**
> *"Olá Suporte Fidli, estamos com uma fila enorme aqui no caixa 3. Quando o operador tenta lançar a transação TX-99821 de acumulação de pontos do cliente, a máquina trava e a API devolve um erro 500 dizendo 'duplicate key error'. O cliente jura que ainda não recebeu os pontos. Podem resolver com urgência?"*

#### 1. Resposta ao Cliente:
```Bom dia, identificámos um erro ao processar a transação TX-99821. Estamos a verificar o histórico para confirmar se os pontos já foram registados. Caso a transação já tenha sido concluída, não será necessário repeti-la.
```

#### 2. Diagnóstico Técnico N1:
```
TICKET: SCN-01
HTTP: 500 Internal Server Error
A referenceId ja foi processada no sistema.
[4:18:04 PM] ERROR MongoServerError: E11000 duplicate key error collection: fidli_db.transactions index: referenceId_1 dup key: { referenceId: "TX-99821" }
{
  "referenceId": "TX-99821",
  "stack": "MongoServerError: E11000 duplicate key error collection: fidli_db.transactions index: referenceId_1 dup key: { referenceId: \"TX-99821\" }\n    at Function.create (/app/node_modules/mongodb/lib/error.js:48:12)\n    at emitTransactionError (/app/services/transactionService.js:142:15)"
}
[4:18:04 PM] ERROR POST /api/transactions/process -> 500 (0ms)
{
  "ip": "::1",
  "body": {
    "referenceId": "TX-99821",
    "amount": 1500,
    "customerPhone": "+258841122334",
    "cashierId": "CX-03"
  },
  "headers": {}
}
```

#### 3. Ação / Roteamento:
```
Consultar o histórico de pontos da transação.
Se os pontos já tiverem sido creditados, não repetir a operação;
orientar o operador a usar uma nova referência
Se o erro persistir, escalar para N2.
```

---

### [TICKET-02] Pagamentos via M-Pesa com Timeout e clientes debitados
- **ID Cenário:** `SCN-02`
- **Canal de Entrada:** E-mail Comercial Urgente
- **Prioridade:** Crítica
- **Remetente:** Dra. Isabel Cossa (Gerente Financeira - Moda Maputo)
- **Mensagem do Cliente:**
> *"Bom dia equipa técnica. Desde as 08h da manhã que 8 clientes tentaram pagar faturas no nosso e-commerce via M-Pesa. O site fica a carregar mais de 5 segundos e devolve 'Gateway Timeout'. O dinheiro sai da conta M-Pesa de alguns clientes mas a encomenda continua Pendente no sistema! Precisamos de intervenção imediata!"*

#### 1. Resposta ao Cliente:
```text
Bom dia Dra. Isabel, entendemos a gravidade da situacao, ja entramos em contacto com a equipa de operações financeiras, pedia que enviassem as referencias mpesa dos 8 clientes que foram debitados, e no caso de acontecer mais uma vez, recomendo a informar os clientes a nao voltarem a efectuar o pagamento. o problema ja foi registrado , e em 30 minutos volto a entrar em contacto para a actualizar.
```

#### 2. Diagnóstico Técnico N1:
```text

ID SCN-02
HTTP 504 Gateway Timeout
[2:45:39 PM] ERROR FetchError: connect ETIMEDOUT 196.28.232.10:443 after 5000ms upstream to M-PESA-API
{
  "orderId": "ORD-5541",
  "amount": 3200,
  "provider": "M-PESA-API",
  "timeoutMs": 5000,
  "upstreamUrl": "https://api.m-pesa.vodacom.mz/v1/ipg/pay"
}
[2:45:39 PM] ERROR POST /api/transactions/payment-gateway -> 504 (0ms)
{
  "ip": "::1",
  "body": {
    "orderId": "ORD-5541",
    "amount": 3200,
    "provider": "M-PESA-API",
    "timeoutMs": 5000,
    "simulateTimeout": true
  },
  "headers": {}
}
}
```

#### 3. Ação / Roteamento:
```
Escalar para equipa financeira para reconciliar os pagamentos com a equipe do mpesa

```

---

### [TICKET-03] Rejeição de estorno com ValidationError (Status 422)
- **ID Cenário:** `SCN-03`
- **Canal de Entrada:** Portal de Chamados (Jira Service Desk)
- **Prioridade:** Média
- **Remetente:** Helder Guambe (Operador de Integração - Farmácias Boa Vida)
- **Mensagem do Cliente:**
> *"Olá pessoal do L1. Estamos a enviar uma requisição para a rota /validate para fazer um ajuste de saldo do cliente CUST-1001 e a vossa API está a rejeitar com status 422 Unprocessable Entity. O nosso programador passou o valor -250 pois é um débito/estorno de pontos. Porque a API não aceita valor negativo se é um débito?"*

#### 1. Resposta ao Cliente:
```text
[ESCREVA AQUI A RESPOSTA AO CLIENTE]
```

#### 2. Diagnóstico Técnico N1:
```text
[DESCREVA A CAUSA RAIZ TÉCNICA E EVIDÊNCIAS DOS LOGS/HTTP]
```

#### 3. Ação / Roteamento:
```text
[INDIQUE AS AÇÕES IMEDIATAS E SE HÁ NECESSIDADE DE ESCALONAMENTO]
```

---

### [TICKET-04] SMS com OTP de resgate não chega (RabbitMQ 503)
- **ID Cenário:** `SCN-04`
- **Canal de Entrada:** Canal Slack #alertas-lojas
- **Prioridade:** Alta
- **Remetente:** Sistema Automático / Operador Loja Matola Express
- **Mensagem do Cliente:**
> *"Alerta: Múltiplas queixas de clientes na Loja Matola Express. Ao tentarem resgatar vouchers no checkout, o SMS com o código OTP nunca chega ao telemóvel. No log de checkout aparece HTTP 503 com erro de fila AmqpConnectionError. Os clientes estão a abandonar as compras no balcão!"*

#### 1. Resposta ao Cliente:
```text
Bom dia, recebemos recebeste o alerta, actualmente o serviço de SMS está em baixo e que a equipa já foi acionada. Pedimos que informe os clientes que o resgate agora não está disponível e assim que for restabelecido serao informados.
```

#### 2. Diagnóstico Técnico N1:
```
TICKET: SCN-04
HTTP: 503 Service Unavailable
- Fila de mensageria RabbitMQ inacessível ou canal fechado na fila `notifications.sms.critical`. Falha de infraestrutura no cluster de mensagens.
[3:27:03 PM] ERROR AmqpConnectionError: Channel closed by server: 404 NOT_FOUND - no queue "notifications.sms.critical" in vhost "/fidli"
{
  "recipient": "+25884990011",
  "template": "OTP_REDEMPTION_CODE",
  "queue": "notifications.sms.critical",
  "host": "rabbitmq-cluster.internal.fidli.net:5672"
}
[3:27:03 PM] ERROR POST /api/notifications/queue-dispatch -> 503 (1ms)
{
  "ip": "::1",
  "body": {
    "recipient": "+25884990011",
    "template": "OTP_REDEMPTION_CODE",
    "points": 150,
    "forceQueueDown": true
  },
  "headers": {}
}
```

#### 3. Ação / Roteamento:
```
ESCALAR: Equipe devops
restabelecer a ligacao da fila de mensageria RabbitMQ
```

---

## 📌 PARTE 2: INTEGRAÇÕES & APIS DE PARCEIROS

---

### [TICKET-05] Chave de API inválida após rotação de credenciais (401)
- **ID Cenário:** `SCN-05`
- **Canal de Entrada:** E-mail Suporte a Desenvolvedores
- **Prioridade:** Alta
- **Remetente:** Eng. Mauro Banze (Lead Developer - ERP Pro Retail)
- **Mensagem do Cliente:**
> *"Prezados, hoje cedo a nossa equipa de DevOps efetuou uma rotação de chaves. Atualizamos o header x-api-key no nosso backend para 'fidli_sec_test_invalid_99', mas todas as chamadas para obter o catálogo de prémios estão a falhar com 401 Unauthorized 'AUTH_INVALID_KEY'. O nosso serviço está parado! Podem revalidar a nossa chave no vosso gateway?"*

#### 1. Resposta ao Cliente:
```
Boa tarde. Verificamos que os pedidos estão a ser rejeitados durante a autenticação da API. Pedimos que confirme se está a utilizar a chave de API correta para o ambiente de produção e se o cabeçalho x-api-key está configurado corretamente. Por motivos de segurança, não envie a chave por canais de suporte. Se o problema persistir após a verificação volte a entrar em contacto
```

#### 2. Diagnóstico Técnico N1:
```
TICKET SCN-05
HTTP 401 Unauthorized
[3:55:17 PM] WARN Authentication failed: Invalid or missing X-API-KEY: "fidli_sec_test_invalid_99"
{
  "path": "/api/partner/v1/catalog",
  "headers": {
    "host": "localhost:3000",
    "connection": "keep-alive",
    "sec-ch-ua-platform": "\"Windows\"",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36",
    "sec-ch-ua": "\"Google Chrome\";v=\"155\", \"Chromium\";v=\"155\", \"Not(A:Brand\";v=\"24\"",
    "content-type": "application/json",
    "x-api-key": "fidli_sec_test_invalid_99",
    "sec-ch-ua-mobile": "?0",
    "accept": "*/*",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    "referer": "http://localhost:3000/",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.9,pt;q=0.8"
  }
}
[3:55:17 PM] WARN GET /api/partner/v1/catalog -> 401 (1ms)
{
  "ip": "::1",
  "headers": {
    "x-api-key": "fidli_sec_test_invalid_99"
  }
}
```

#### 3. Ação / Roteamento:
```
Confirmar a identidade e o ambiente utilizado no painel administrativo.
Orientar a configurar a chave de produção correta no cabeçalho x-api-key.
Repetir o teste após a correção.
```

---

### [TICKET-06] Sincronização em lote interrompida por Rate Limit (429)
- **ID Cenário:** `SCN-06`
- **Canal de Entrada:** Chamada Telefônica / WhatsApp
- **Prioridade:** Média
- **Remetente:** Sónia Mondlane (Analista de TI - Supermercado VIP)
- **Mensagem do Cliente:**
> *"Olá suporte, o nosso script de sincronização de vendas noturnas começou a rodar às 23h e após 10 segundos parou com código HTTP 429 'RateLimitExceeded'. Não sabíamos que havia limite de requisições por minuto. Precisamos sincronizar 500 transações acumuladas de uma só vez hoje!"*

#### 1. Resposta ao Cliente:
```text
[ESCREVA AQUI A RESPOSTA AO CLIENTE]
```

#### 2. Diagnóstico Técnico N1:
```

```

#### 3. Ação / Roteamento:
```text
[INDIQUE AS AÇÕES IMEDIATAS E SE HÁ NECESSIDADE DE ESCALONAMENTO]
```

---

### [TICKET-07] Bloqueio de cadastro por NUIT duplicado (Status 409)
- **ID Cenário:** `SCN-07`
- **Canal de Entrada:** Balcão de Atendimento Presencial
- **Prioridade:** Alta
- **Remetente:** Fátima Tembe (Operadora de Atendimento - Polana Shopping)
- **Mensagem do Cliente:**
> *"Boa tarde. A cliente Amélia Mondlane está aqui no balcão e quer aderir ao programa. Ao submeter o formulário de cadastro, o sistema bloqueia e diz 'O NUIT 400123987 já se encontra associado à cliente Amélia Mondlane ID CUST-1001'. A cliente disse que perdeu o telemóvel antigo e quer um cadastro totalmente novo agora. O que devemos fazer?"*

#### 1. Resposta ao Cliente:
```text
Boa tarde, o NUIT informado já foi registrado no sistema. Recomendamos que localize o cadastro original e confirme os dados do cliente antes de efetuar qualquer alteração. Se precisar de recuperar ou atualizar o cadastro, podemos orientar o procedimento autorizado.

#### 2. Diagnóstico Técnico N1:
```
TICKET: SCN-06
HTTP: 409 Conflict
O NUIT ja existe no banco de dados, sendo ele numero unico, nao tem como atribuido a outra pessoa
[4:03:18 PM] WARN Registration conflict: NUIT 400123987 is already registered to customer CUST-1001 (Amélia Mondlane)
[4:03:18 PM] WARN POST /api/customers/register -> 409 (2ms)
{
  "ip": "::1",
  "body": {
    "name": "Amélia Mondlane Nova Adesão",
    "nuit": "400123987",
    "phone": "+258870001122",
    "storeId": "STORE-POLANA"
  },
  "headers": {}
}
```

#### 3. Ação / Roteamento:
```
Procurar o registo original utilizando o NUIT.
Confirmar a identidade do cliente.
Orientar a actualização do cadastro existente, em vez de criar um novo.
Se existir divergência de identidade, suspeita de utilização indevida do NUIT, escalar para N2 ou para a equipa responsável.
```

---

### [TICKET-08] Queda de comunicação bancária (ENOTFOUND / 502)
- **ID Cenário:** `SCN-08`
- **Canal de Entrada:** Slack #incidentes-producao
- **Prioridade:** Crítica
- **Remetente:** Equipa de Monitoramento N1 (Turno da Noite)
- **Mensagem do Cliente:**
> *"Atenção equipa: Os resgates de cashback para contas bancárias e cartões estão a falhar em 100% dos pedidos. No log do backend aparece a mensagem: 'FetchError: getaddrinfo ENOTFOUND api.partner-bank.co.mz'. Parece que o túnel VPN ou o DNS interno do banco caiu!"*

#### 1. Resposta ao Cliente / Comunicado Interno:
```text
Boa noite, foi accionado a equipe e a causa está identificada e eles ja a resolver o problema com maior urgencia, os resgates para conta/cartão de momento encontram-se suspensos, não haverá perda de dados e vai receber actualização as 22:30
```

#### 2. Diagnóstico Técnico N1:
```text
Ticket SCN-08
falha de DNS ou queda da VPN IPsec
HTTP 502 Bad Gateway (FetchError: getaddrinfo ENOTFOUND api.partner-bank.co.mz)
[3:05:18 PM] ERROR FetchError: request to https://api.partner-bank.co.mz/v1/health failed, reason: getaddrinfo ENOTFOUND api.partner-bank.co.mz
{
  "hostname": "api.partner-bank.co.mz",
  "syscall": "getaddrinfo",
  "code": "ENOTFOUND",
  "tunnelStatus": "IPSEC_TUNNEL_DOWN"
}
[3:05:18 PM] ERROR GET /api/partner/banking/healthcheck -> 502 (2ms)
{
  "ip": "::1",
  "headers": {}
}
```

#### 3. Ação / Roteamento:
```
Escalar a equipe DevOps
verificar o túnel IPsec e a resolução DNS do banco
```

---

## 📌 PARTE 3: EQUIPAMENTOS, TERMINAIS POS & MOBILE

---

### [TICKET-09] Terminal POS deslogado com erro "jwt expired" (401)
- **ID Cenário:** `SCN-09`
- **Canal de Entrada:** WhatsApp Lojistas
- **Prioridade:** Média
- **Remetente:** Jorge Manjate (Supervisor de Caixa - Pastelaria Triunfo)
- **Mensagem do Cliente:**
> *"Olá rapazes, abrimos a pastelaria agora às 06:30 e o terminal POS móvel está com a mensagem 'TokenExpiredError: jwt expired'. O caixa não consegue validar transações nem acumular pontos dos clientes. Já desligámos e ligámos a máquina na tomada mas continua exatamente com o mesmo erro na tela."*

#### 1. Resposta ao Cliente:
```text
[ESCREVA AQUI A RESPOSTA AO CLIENTE]
```

#### 2. Diagnóstico Técnico N1:
```text
[DESCREVA A CAUSA RAIZ TÉCNICA E EVIDÊNCIAS DOS LOGS/HTTP]
```

#### 3. Ação / Roteamento:
```text
[INDIQUE AS AÇÕES IMEDIATAS E SE HÁ NECESSIDADE DE ESCALONAMENTO]
```

---

### [TICKET-10] App de Comerciante bloqueado por versão obsoleta (426)
- **ID Cenário:** `SCN-10`
- **Canal de Entrada:** Portal de Suporte Web #4091
- **Prioridade:** Alta
- **Remetente:** Tânia Langa (Gerente de Loja - Beira Mall)
- **Mensagem do Cliente:**
> *"Boa tarde. Fomos abrir o aplicativo dos comerciantes no tablet do balcão e recebemos a mensagem: 'A versão 1.2.0 foi descontinuada. Minimum required 2.1.0 (HTTP 426 Upgrade Required)'. O tablet não nos deixa clicar em nada para avançar. Temos clientes no balcão aguardando leitura do QR Code!"*

#### 1. Resposta ao Cliente:
```text
[ESCREVA AQUI A RESPOSTA AO CLIENTE]
```

#### 2. Diagnóstico Técnico N1:
```text
[DESCREVA A CAUSA RAIZ TÉCNICA E EVIDÊNCIAS DOS LOGS/HTTP]
```

#### 3. Ação / Roteamento:
```text
[INDIQUE AS AÇÕES IMEDIATAS E SE HÁ NECESSIDADE DE ESCALONAMENTO]
```

---

### [TICKET-11] Falha de provisionamento em novo terminal Sunmi (400)
- **ID Cenário:** `SCN-11`
- **Canal de Entrada:** E-mail Operações de Campo
- **Prioridade:** Média
- **Remetente:** Nelson Chissano (Técnico de Instalação POS)
- **Mensagem do Cliente:**
> *"Saudações suporte. Estou a fazer a instalação de um novo terminal POS Sunmi na Loja Xai-Xai 02. Quando envio o payload de inicialização do terminal para o endpoint de registro, o servidor devolve 400 Bad Request dizendo que faltam campos obrigatórios. Segue o payload que enviei: { terminalModel: 'Sunmi V2 PRO', serialNumber: 'SN-9988221' }. Podem me dizer o que está a faltar?"*

#### 1. Resposta ao Cliente:
```text
[ESCREVA AQUI A RESPOSTA AO CLIENTE]
```

#### 2. Diagnóstico Técnico N1:
```text
[DESCREVA A CAUSA RAIZ TÉCNICA E EVIDÊNCIAS DOS LOGS/HTTP]
```

#### 3. Ação / Roteamento:
```text
[INDIQUE AS AÇÕES IMEDIATAS E SE HÁ NECESSIDADE DE ESCALONAMENTO]
```

---

### [TICKET-12] Conflito de hardware: Endereço MAC já ativo noutra loja (409)
- **ID Cenário:** `SCN-12`
- **Canal de Entrada:** Telefone Emergência Lojistas
- **Prioridade:** Alta
- **Remetente:** Armando Cuna (Gerente de Operações - Bombas Zimpeto)
- **Mensagem do Cliente:**
> *"Olá suporte, o nosso terminal antigo queimou e recebemos um equipamento usado de substituição da loja da Matola. Ao tentar parear com a nossa loja do Zimpeto, o sistema dá erro: 'DeviceConflictError: O endereço físico 00:1A:2B:3C:4D:5E já está vinculado ao terminal POS-LOJA-01'. O que podemos fazer para liberar este aparelho para o Zimpeto?"*

#### 1. Resposta ao Cliente:
```text
[ESCREVA AQUI A RESPOSTA AO CLIENTE]
```

#### 2. Diagnóstico Técnico N1:
```text
[DESCREVA A CAUSA RAIZ TÉCNICA E EVIDÊNCIAS DOS LOGS/HTTP]
```

#### 3. Ação / Roteamento:
```text
[INDIQUE AS AÇÕES IMEDIATAS E SE HÁ NECESSIDADE DE ESCALONAMENTO]
```

---
*Fim do Caderno de Testes. Salve este arquivo preenchido e envie para a equipa avaliadora.*
