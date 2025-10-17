## Desafio Event-Driven Wallet

Aplicação de exemplo com arquitetura orientada a eventos (EDA) composta por dois serviços:
- **goapp (fc-eda-main)**: API em Go responsável por criar clientes, contas e transações. Emite eventos no Kafka.
- **nodeapp (ms-balance)**: microserviço em Node.js que consome eventos de transação no Kafka e mantém um materialized view de saldos em MySQL, expondo uma API de consulta.

Infraestrutura de suporte via Docker Compose com **MySQL**, **Kafka + Zookeeper** e **Confluent Control Center**.

### Arquitetura (alto nível)
- **Kafka**: tópico principal `balances` para atualização de saldos; o serviço Go publica eventos de transação e de saldo; o serviço Node consome e persiste.
- **MySQL**: banco `wallet` inicializado por `init.sql`.
- **APIs**:
  - Go: `http://localhost:8080` para criação de clientes, contas e transações.
  - Node: `http://localhost:3003` para leitura de saldos por `account_id`.

### Estrutura do repositório
- `docker-compose.yaml`: orquestra todos os serviços.
- `init.sql`: criação/seed do banco `wallet` (executado no startup do MySQL).
- `fc-eda-main/` (Go):
  - `cmd/walletcore/main.go`: inicialização do servidor HTTP e produtores Kafka.
  - `internal/...`: entidades, casos de uso, web handlers e integração Kafka.
  - `api/client.http`: exemplos de chamadas HTTP (REST Client/Insomnia/VSCode REST Client).
- `ms-balance/` (Node.js/TypeScript):
  - `src/server.ts`: Express + KafkaJS consumer e rotas.
  - `src/database/`: acesso ao MySQL (Knex).
  - `package.json`: scripts `build`, `start`, `dev`.

### Requisitos
- Docker e Docker Compose
- Portas livres: 8080 (Go), 3003 (Node), 3306 (MySQL), 9092 (Kafka), 9021 (Control Center)

### Subindo o ambiente
```bash
# na raiz do repositório
docker compose up --build
```
Serviços expostos:
- Go API: `http://localhost:8080`
- Node API: `http://localhost:3003`
- MySQL: `localhost:3306` (user: `root`, pass: `root`, db: `wallet`)
- Kafka (externo): `localhost:9092` | (interno na rede docker): `kafka:29092`
- Confluent Control Center: `http://localhost:9021`

Atenção: O Node consumer (`ms-balance`) usa `kafka:29092` e o Go usa Confluent Kafka com `kafka:29092` (endereço interno). Ao publicar eventos de fora dos containers, use `localhost:9092`.

### Fluxo típico
1. Criar um cliente (Go API)
2. Criar uma conta para o cliente (Go API)
3. Criar uma transação entre contas (Go API) → eventos emitidos no Kafka
4. O `ms-balance` consome o evento no tópico `balances` e atualiza os saldos
5. Consultar o saldo por `account_id` no `ms-balance`

### Endpoints principais
#### Go API (http://localhost:8080)
- POST `/clients`
```json
{
  "name": "Jane Frost",
  "email": "jane@j.com"
}
```
- POST `/accounts`
```json
{
  "client_id": "<uuid-do-cliente>"
}
```
- POST `/transactions`
```json
{
  "account_id_from": "<id>",
  "account_id_to": "<id>",
  "amount": 100
}
```
Dicas: há exemplos em `fc-eda-main/api/client.http`.

#### Node API (http://localhost:3003)
- GET `/balances/:account_id`
Exemplo:
```
GET http://localhost:3003/balances/1
```
Resposta (exemplo):
```json
[
  { "account_id": "1", "amount": 100 }
]
```

### Desenvolvimento local (opcional)
Você pode rodar serviços individualmente, útil para depurar.

#### ms-balance (Node)
```bash
cd ms-balance
# build
yarn install
yarn build
# executar buildado
yarn start
# ou em dev (watch)
yarn dev
```
Observações:
- `src/server.ts` usa MySQL em `mysql:3306` (endereço do serviço no compose). Fora do compose, ajuste para `localhost` se necessário.
- O consumer Kafka usa `kafka:29092` internamente. Fora do compose, ajuste para `localhost:9092`.

#### fc-eda-main (Go)
O Dockerfile já compila o binário. Para rodar fora do Docker, garanta Go 1.20 e dependências do Confluent Kafka (librdkafka). No compose o pacote é instalado:
- Debian/Ubuntu: `apt-get install -y librdkafka-dev`

### Kafka e observabilidade
- Tópicos relevantes: `balances` (consumido pelo `ms-balance`).
- Acesse o Control Center em `http://localhost:9021` para inspecionar tópicos, mensagens e consumidores.

### Variáveis e configurações
- MySQL: user `root`, senha `root`, db `wallet` (ver `docker-compose.yaml`).
- Kafka: listeners `PLAINTEXT://kafka:29092` (interno) e `PLAINTEXT_HOST://localhost:9092` (externo).
- Ports: Go `8080`, Node `3003`.

### Solução de problemas
- Portas já em uso: pare serviços locais que conflitam ou altere as portas no `docker-compose.yaml`.
- Kafka indisponível no consumer: confirme se o Node está usando `kafka:29092` dentro do Docker. Fora do Docker, troque para `localhost:9092`.
- MySQL inicialização: verifique logs do container `mysql` e se `init.sql` foi aplicado.
