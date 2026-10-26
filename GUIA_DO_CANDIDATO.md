# 📘 Manual de Operações & Roteiro Prático de Avaliação (N1 / N2)

> **Documento Oficial de Orientação ao Candidato**  
> **Área:** Suporte Técnico, Operações de Plataforma & Helpdesk  
> **Ecossistema:** Plataforma Transacional Fidli (Fidli Enterprise Solutions)

---

## 1. Visão Geral da Plataforma & Contexto Operacional

A **Fidli** opera uma plataforma transacional de alta disponibilidade voltada para a gestão de fidelidade, meios de pagamento integrados e concessão de vouchers em tempo real. O sistema conecta comerciantes de diversos setores (redes de supermercados, farmácias, postos de combustíveis, comércio eletrónico e retalho) a clientes finais e provedores financeiros.

### Componentes Principais da Arquitetura:
1. **Terminais POS (Point of Sale):** Aparelhos dedicados baseados em Android (ex: Sunmi V2 PRO) instalados nos caixas das lojas para registrar compras, acumular e abater pontos de fidelidade.
2. **Gateways de Carteiras Móveis & Pagamentos:** Conexões com provedores de pagamento (ex: Vodacom M-Pesa IPG) para processamento de cobranças em checkout com SLA rígido de tempo de resposta.
3. **Serviço de Mensageria Transacional:** Filas em RabbitMQ encarregadas da entrega de códigos OTP (*One-Time Password*) por SMS para validação no checkout e resgate de prémios.
4. **Banco de Dados Central:** Cluster MongoDB com índices de chave única (`unique index`) para garantir idempotência transacional e auditoria fiscal.
5. **APIs B2B de Parceiros:** Endpoints RESTful protegidos por cabeçalho `x-api-key` com políticas de limitação de requisições por minuto (*Rate Limiting*).
6. **Interconexão Bancária Dedicada:** Túneis virtuais criptografados (VPN IPsec) para liquidação de resgates com bancos comerciais parceiros.

### O Papel do Analista de Suporte Técnico (N1 / N2):
No dia a dia da operação, o analista é o ponto central entre os parceiros comerciais e a engenharia de software:
- Atende chamados com cordialidade, empatia e clareza, orientando lojistas leigos de forma humana e rápida.
- Investiga incidentes técnicos utilizando logs de aplicação, status codes HTTP e payloads JSON para diagnosticar a causa raiz.
- Resolve diretamente no primeiro nível ocorrências de operação de terminal, cadastros divergentes e parâmetros incorretos de integração.
- Escala de forma qualificada ocorrências críticas de infraestrutura, redes ou inconsistência financeira, municiando a Engenharia e DevOps com evidências incontestáveis.

---

## 2. Configuração do Ambiente de Trabalho

### Pré-requisitos
- **Node.js:** Versão 18.x ou superior instalada.
- **NPM:** Gerenciador de pacotes incluso com o Node.js.
- **Navegador Web:** Google Chrome, Mozilla Firefox, Safari ou Microsoft Edge.

### Inicialização Passo a Passo
1. No terminal, acesse a pasta raiz do projeto (`desafio-helpdesk-monorepo`) e instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor da aplicação:
   ```bash
   npm start
   ```
3. O console exibirá as rotas ativas. Acesse no navegador o endereço:
   👉 **`http://localhost:3000`**

### Teste Automatizado de Integridade
A qualquer momento, valide se todos os endpoints de simulação estão respondendo corretamente executando:
```bash
npm test
```
*Resultado esperado: 12 cenários validados com sucesso.*

---

## 3. Guia de Uso do Painel de Diagnóstico (`http://localhost:3000`)

O painel foi estruturado para fornecer todas as ferramentas necessárias para investigar as queixas dos clientes sem a necessidade de ferramentas externas.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FIDLI PLATFORM - OPERATIONAL DASHBOARD                 │
├───────────────────┬─────────────────────────────────────┬───────────────────┤
│ 📋 FILA DE TICKETS│ 🖥️ ÁREA DE DIAGNÓSTICO (Centro)    │ 📟 CONSOLE SERVER │
│                   │                                     │                   │
│ • SCN-01 (Alta)   │ [1. Interface Dispositivo] [2. API] │ [INFO] 08:35 ...  │
│ • SCN-02 (Crítica)│                                     │ [WARN] 08:36 ...  │
│ • SCN-03 (Média)  │ Dispositivo / Checkout / Terminal   │ [ERROR] 08:37 ... │
│ • SCN-04 a 12...  │ Botões de Teste e Alertas Visuais   │ Stack traces &    │
│                   │                                     │ Payloads em tempo │
│ Filtros por tipo: │                                     │ real com cores    │
│ Pagamentos, APIs, │                                     │                   │
│ POS/Mobile        │ [Inspecionar na Bancada Técnica ➔] │ [Copiar Logs]     │
└───────────────────┴─────────────────────────────────────┴───────────────────┘
```

### 3.1. Barra Superior e Controles
- **Contadores Globais:** Mostram o total de cenários (12), quantos já foram testados por si e a contagem de erros retornados.
- **Indicador de Conexão:** Mostra se o backend local está operacional.
- **Resetar Estado:** Restaura o banco em memória (limpa o cache de idempotência e reseta os limites de requisição).
- **Atalhos para Documentos:** Botões rápidos para consultar as orientações e abrir o formulário de respostas.

### 3.2. Coluna da Esquerda: Fila de Tickets
- Lista os 12 chamados com badge de severidade (**Crítica**, **Alta**, **Média**) e canal de origem (**WhatsApp**, **E-mail**, **Jira**, **Slack**).
- Utilize os filtros de categoria e a barra de busca para localizar chamados específicos.

### 3.3. Coluna Central: Modos de Visualização

#### Aba 1: Interface do Dispositivo (Visão do Lojista/Cliente)
- Reproduz visualmente o equipamento exato onde a falha ocorreu:
  - **POS Touch de Caixa de Supermercado** (ex: Caixa travado em duplicidade).
  - **Checkout de E-commerce M-Pesa** (ex: Gateway com tela de carregamento e timeout).
  - **Smartphone do Cliente** (ex: Caixa de entrada SMS OTP vazia).
  - **Tablet de Cadastro ou Provisionamento Sunmi**.
  - **Painel de Ajuste de Saldo do ERP do Parceiro**.
- **Botão "Reproduzir Falha Relatada" (Vermelho):** Dispara a ação executada pelo lojista, aciona a animação de carregamento e exibe na tela o erro visual correspondente.
- **Botão "Testar Cenário Corrigido" (Verde):** Submete a transação com os parâmetros corretos para validar como o sistema se comporta em condição ideal de sucesso.

#### Aba 2: Bancada Técnica N1 (API & Payloads)
- Exibe o método HTTP (`POST`, `GET`), a rota da API (`/api/...`) e o tempo de resposta em milissegundos.
- **Request Body & Headers:** Editores de código onde você pode inspecionar e alterar payloads JSON e cabeçalhos (`x-api-key`, `x-app-version`).
- **Comando cURL:** Gera o comando de terminal correspondente para replicação manual.
- **Visualizador de Resposta:** Mostra o código de status HTTP (`400`, `401`, `409`, `422`, `426`, `429`, `500`, `502`, `503`, `504`) e o JSON de retorno.

### 3.4. Coluna da Direita: Console do Servidor (Logs ao Vivo)
- Captura todos os eventos de log emitidos pelo servidor Node.js em tempo real.
- Permite filtrar por severidade: `ERROR` (vermelho), `WARN` (amarelo), `INFO` (azul).
- Botão para copiar logs com um clique para facilitar a inclusão de evidências no relatório.

---

## 4. Padrões de Comunicação com o Cliente por Canal

O suporte da Fidli zela por um atendimento humanizado, profissional e assertivo. Cada canal possui suas particularidades:

| Canal | Perfil do Remetente | Tom Recomendado | Práticas Essenciais |
| :--- | :--- | :--- | :--- |
| **WhatsApp** | Operador de caixa, lojista de balcão com fila física | Ágil, empático, direto e acolhedor | Frases curtas, foco em destravar o cliente na fila. **Nunca use jargões como "MongoServerError" ou "Duplicate Key".** |
| **E-mail** | Gerente financeiro, diretor de loja | Formal, estruturado e tranquilizador | Reconheça o impacto financeiro, forneça número de protocolo e preveja prazos claros de acompanhamento. |
| **Jira Service Desk** | Desenvolvedor ou integrador de software parceiro | Técnico, preciso e documental | Aponte o parâmetro exato, envie links de documentação e o trecho de payload corrigido. |
| **Slack (#alertas)** | Equipa interna de operações de loja | Objetivo e voltado a incidentes | Confirme recebimento do alerta, reporte o status da infraestrutura e indique o plano de contingência. |

### Exemplos de Comparação: Como Responder

#### Exemplo 1: Erro de Chave Duplicada no Caixa (SCN-01)
- ❌ **Inadequado:** *"Boa tarde. O seu erro foi 500 duplicate key no MongoDB porque você mandou a referenceId TX-99821 repetida. Fale com seu desenvolvedor para mudar o índice."*
- ✅ **Adequado:** *"Olá Sr. Arlindo, boa tarde! Compreendemos a urgência da fila e já verificamos o seu caixa. Identificamos que a transação TX-99821 já havia sido registrada com sucesso no nosso sistema há alguns instantes, por isso a máquina acusou repetição. Os pontos do seu cliente já foram creditados normalmente. Caso se trate de uma nova venda para outro cliente, basta o operador gerar um novo comprovativo de venda com a nova referência. Estamos à disposição caso precise de mais algum apoio imediato."*

#### Exemplo 2: Timeout em Pagamento M-Pesa (SCN-02)
- ❌ **Inadequado:** *"Deu status 504 ETIMEDOUT no servidor da Vodacom. O problema não é nosso, fale com a Vodacom ou mande o cliente pagar de novo."*
- ✅ **Adequado:** *"Prezada Dra. Isabel, bom dia. Compreendemos a criticidade da situação e já acionamos a nossa equipa de operações financeiras em prioridade máxima. Identificamos uma instabilidade temporária de comunicação entre a nossa plataforma e o gateway da Vodacom M-Pesa, o que causou o atraso na confirmação das encomendas. **Por favor, oriente os clientes a não realizarem novos pagamentos para o mesmo pedido.** Já estamos em contato direto com a operadora para reconciliar as faturas pendentes e liberar as encomendas de forma segura. Atualizaremos o status deste chamado nos próximos 30 minutos com a lista de pedidos regularizados."*

---

## 5. Metodologia de Diagnóstico Técnico N1

Ao analisar qualquer ocorrência, siga o fluxo metódico de investigação:

```text
[Chamado Recebido]
       │
       ▼
[1. Reproduzir na Interface do Dispositivo] ──► Observar comportamento na tela do lojista
       │
       ▼
[2. Inspecionar Requisição na Bancada] ─────► Conferir URL, Headers, Payload JSON e Status HTTP
       │
       ▼
[3. Analisar Logs no Console] ──────────────► Localizar stack trace, códigos de erro e latência
       │
       ▼
[4. Determinar Resolução vs Escalonamento] ──► N1 resolve localmente OU Escala com evidências
```

### Guia Rápido de Interpretação de Códigos HTTP:
- **HTTP 400 (Bad Request):** Parâmetros obrigatórios ausentes no contrato da API (ex: `SCN-11`). Identifique quais campos faltam no payload.
- **HTTP 401 (Unauthorized):** Credencial ausente, inválida ou expirada. Diferencie **chave de API externa incorreta** (`SCN-05`) de **token JWT de sessão expirado no POS** (`SCN-09`).
- **HTTP 409 (Conflict):** Conflito de unicidade de dados de negócio. Exemplos: NUIT de cliente já cadastrado (`SCN-07`) ou endereço MAC já vinculado a outro terminal físico (`SCN-12`).
- **HTTP 422 (Unprocessable Entity):** Formato sintático válido, mas regra de negócio violada. Exemplo: valor negativo enviado em campo que requer valor estritamente positivo (`SCN-03`).
- **HTTP 426 (Upgrade Required):** Versão do aplicativo móvel incompatível ou descontinuada por política de segurança (`SCN-10`).
- **HTTP 429 (Too Many Requests):** Limite de taxa excedido (*Rate Limit*). Identifique o cabeçalho `Retry-After` e oriente a implementação de retentativas espaçadas (`SCN-06`).
- **HTTP 500 (Internal Server Error):** Exceção no servidor de aplicação. No nosso ecossistema, investigue a chave duplicada do banco de dados MongoDB (`SCN-01`).
- **HTTP 502 (Bad Gateway):** Falha de conectividade ou resolução de rede com serviços parceiros, como queda de VPN IPsec ou falha de DNS (`SCN-08`).
- **HTTP 503 (Service Unavailable):** Serviço auxiliar de infraestrutura indisponível, como o broker de mensageria RabbitMQ fora do ar (`SCN-04`).
- **HTTP 504 (Gateway Timeout):** O servidor intermediário ou gateway financeiro externo excedeu o tempo limite de resposta tolerado (`SCN-02`).

---

## 6. Matriz de Severidade & Escalonamento Qualificado

Nem todo chamado deve ser escalado para a Engenharia. O analista de suporte N1 demonstra maturidade técnica ao filtrar o que é operacional e escalar apenas o que realmente exige intervenção de N2, Infraestrutura ou Produto.

| Código | Ocorrência | Severidade | Fluxo Operacional / Resolução |
| :--- | :--- | :---: | :--- |
| **SCN-01** | Erro 500 Chave Duplicada no Caixa | **Alta (P2)** | **N1 Resolve:** Consulta o extrato de pontos, confirma a gravação prévia e orienta o caixa a prosseguir com nova referência. |
| **SCN-02** | Timeout M-Pesa com Débito de Clientes | **Crítica (P1)** | **Escala para N2 Financeiro & Reconciliação:** Exige conciliação bancária/webhook de operadora para liberar encomendas sem dupla cobrança. |
| **SCN-03** | Erro 422 Valor Negativo em Ajuste | **Média (P3)** | **N1 Resolve:** Orienta o integrador parceiro a enviar valor positivo absoluto e indicar débito via `operationType`. |
| **SCN-04** | SMS OTP Indisponível (RabbitMQ 503) | **Alta (P2)** | **Escala para DevOps / Infraestrutura:** Abre incidente de broker com logs de canal fechado e fila `notifications.sms.critical`. |
| **SCN-05** | Erro 401 Chave de API Inválida | **Alta (P2)** | **N1 Resolve:** Confere a empresa no painel administrativo, orienta o uso da chave de produção correta no cabeçalho `x-api-key`. |
| **SCN-06** | Erro 429 Rate Limit Excedido | **Média (P3)** | **N1 Resolve:** Explica a cota por minuto e orienta o uso de Exponential Backoff e sincronização agrupada em lote. |
| **SCN-07** | Erro 409 NUIT Duplicado em Cadastro | **Alta (P2)** | **N1 Resolve:** Localiza o cadastro original associado ao NUIT e instrui a atendente a atualizar os dados em vez de duplicar. |
| **SCN-08** | Erro 502 DNS/VPN Bancária Down | **Crítica (P1)** | **Escala para DevOps & Redes (SysAdmin):** Comunica falha crítica no túnel IPsec/DNS do gateway bancário parceiro. |
| **SCN-09** | Erro 401 Sessão JWT Expirada no POS | **Média (P3)** | **N1 Resolve:** Instruir o operador de caixa a realizar Logout no app do terminal e efetuar novo Login com seu código PIN. |
| **SCN-10** | Erro 426 Versão de App Descontinuada | **Alta (P2)** | **N1 Resolve:** Instruir a loja a atualizar o aplicativo Fidli Merchant via Google Play Store para a versão atual. |
| **SCN-11** | Erro 400 Parâmetros Ausentes no POS | **Média (P3)** | **N1 Resolve:** Informa ao técnico de campo os campos obrigatórios (`terminalId`, `storeLocation`, `merchantId`) para o provisionamento. |
| **SCN-12** | Erro 409 Conflito de Endereço MAC | **Alta (P2)** | **N1 Resolve / N2:** Valida transferência de ativo físico e realiza o despareamento do terminal antigo antes do novo vínculo. |

### Regra de Ouro do Escalonamento:
Ao abrir um ticket para N2, DevOps ou Engenharia, você deve **obrigatoriamente** incluir:
1. **Identificador único do caso:** (ex: `SCN-02`, Pedido `ORD-5541`).
2. **Timestamp exato:** Data e hora em que a falha ocorreu.
3. **Código de status HTTP e Nome do Erro:** (ex: `HTTP 504 Gateway Timeout / ETIMEDOUT`).
4. **Trecho relevante do log do console:** (ex: stack trace ou log de conexão).
5. **Comando de reprodução cURL ou payload:** Para que o engenheiro consiga replicar o cenário em segundos.

---

## 7. Instruções de Preenchimento do Caderno de Respostas

O arquivo oficial onde você registrará as suas conclusões é o:
📄 [**`SIMULACAO_TICKETS.md`**](file:///home/java/Documentos/Cluster/desafio-helpdesk-monorepo/SIMULACAO_TICKETS.md)

Para cada um dos 12 tickets, você encontrará três blocos identificados:

```markdown
#### 1. Resposta ao Cliente:
[Escreva o texto exato que enviará ao solicitante]

#### 2. Diagnóstico Técnico N1:
[Explique a causa raiz técnica, status code e evidências observadas]

#### 3. Ação / Roteamento:
[Indique o procedimento imediato de N1 ou detalhes do escalonamento para N2/DevOps/Engenharia]
```

---

## 8. Checklist de Finalização

Antes de submeter a sua avaliação, faça a seguinte verificação:
- [ ] O ambiente foi executado e os 12 cenários foram testados no painel `http://localhost:3000`.
- [ ] O teste automatizado `npm test` foi executado no terminal e finalizou com 100% de sucesso.
- [ ] Todos os 12 chamados do arquivo [`SIMULACAO_TICKETS.md`](file:///home/java/Documentos/Cluster/desafio-helpdesk-monorepo/SIMULACAO_TICKETS.md) possuem os 3 blocos preenchidos sem campos vazios.
- [ ] As respostas aos clientes foram revisadas para garantir cordialidade, clareza e ausência de jargões internos crus.
- [ ] Os diagnósticos técnicos citam os códigos HTTP, nomes de exceções e dados dos logs.
- [ ] O arquivo [`SIMULACAO_TICKETS.md`](file:///home/java/Documentos/Cluster/desafio-helpdesk-monorepo/SIMULACAO_TICKETS.md) foi salvo e está pronto para entrega.

Bom trabalho! Demonstre a sua atenção aos detalhes, precisão técnica e compromisso com a experiência do cliente.
