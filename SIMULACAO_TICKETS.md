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

### [TICKET-02] Pagamentos via M-Pesa com Timeout e clientes debitados
- **ID Cenário:** `SCN-02`
- **Canal de Entrada:** E-mail Comercial Urgente
- **Prioridade:** Crítica
- **Remetente:** Dra. Isabel Cossa (Gerente Financeira - Moda Maputo)
- **Mensagem do Cliente:**
> *"Bom dia equipa técnica. Desde as 08h da manhã que 8 clientes tentaram pagar faturas no nosso e-commerce via M-Pesa. O site fica a carregar mais de 5 segundos e devolve 'Gateway Timeout'. O dinheiro sai da conta M-Pesa de alguns clientes mas a encomenda continua Pendente no sistema! Precisamos de intervenção imediata!"*

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
```text
[DESCREVA A CAUSA RAIZ TÉCNICA E EVIDÊNCIAS DOS LOGS/HTTP]
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

### [TICKET-08] Queda de comunicação bancária (ENOTFOUND / 502)
- **ID Cenário:** `SCN-08`
- **Canal de Entrada:** Slack #incidentes-producao
- **Prioridade:** Crítica
- **Remetente:** Equipa de Monitoramento N1 (Turno da Noite)
- **Mensagem do Cliente:**
> *"Atenção equipa: Os resgates de cashback para contas bancárias e cartões estão a falhar em 100% dos pedidos. No log do backend aparece a mensagem: 'FetchError: getaddrinfo ENOTFOUND api.partner-bank.co.mz'. Parece que o túnel VPN ou o DNS interno do banco caiu!"*

#### 1. Resposta ao Cliente / Comunicado Interno:
```text
[ESCREVA AQUI O COMUNICADO AOS STAKEHOLDERS OU RESPOSTA AO PARCEIRO]
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
