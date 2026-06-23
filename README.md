# TMS Frontend — Agendamento de Transferências

Interface web para agendamento de transferências financeiras e consulta do extrato de agendamentos, consumindo a API REST do backend Spring Boot.

## Tecnologias e versões

| Tecnologia | Versão |
|------------|--------|
| Vue.js | 3.5.x |
| Vite | 5.4.x |
| Axios | 1.7.x |
| Node.js | 18+ (recomendado 20+) |
| npm | 9+ |

## Decisões arquiteturais

### SPA com Vue 3 (Composition API)

O projeto é uma **Single Page Application** construída com Vue 3 e `<script setup>`. Essa abordagem foi escolhida por:

- Reatividade simples para formulários e atualização da tabela de extrato.
- Componentização clara entre agendamento e extrato.
- Integração direta com a API REST via Axios.

### Organização do código

```
src/
├── App.vue                    → Layout principal, abas e header
├── components/
│   ├── TransferForm.vue       → Formulário de agendamento
│   └── TransferStatement.vue  → Tabela de extrato
├── services/
│   └── transferService.js     → Chamadas HTTP à API
├── utils/
│   └── formatters.js          → Formatação de moeda e datas
├── assets/
│   └── main.css               → Estilos globais
├── config.js                  → URL base da API
└── main.js                    → Bootstrap da aplicação
images/
└── tokio-marine-seguradora.png
```

**Por que essa estrutura?**

- **Componentes** concentram a lógica de UI; cada aba tem responsabilidade única.
- **Services** isolam a comunicação com o backend, facilitando manutenção e troca de biblioteca HTTP.
- **Utils** centralizam formatação (moeda em BRL, datas) sem poluir os componentes.
- **Sem Vue Router** — a navegação por abas é simples o suficiente para duas telas; evita dependência extra.

### Regras de negócio no backend

O frontend **não calcula taxas**. Ele apenas:

- Envia os dados do formulário para `POST /api/transfers`.
- Consulta a prévia via `GET /api/transfers/fee-preview`.
- Exibe mensagens retornadas pela API.

Isso mantém uma única fonte da verdade para as regras de taxa no backend.

### Camada de serviço HTTP

`transferService.js` encapsula todas as requisições Axios:

| Função | Endpoint | Uso |
|--------|----------|-----|
| `scheduleTransfer` | `POST /transfers` | Agendar transferência |
| `listTransfers` | `GET /transfers` | Listar extrato |
| `previewFee` | `GET /transfers/fee-preview` | Prévia da taxa em tempo real |

Funções auxiliares:

- `extractErrorMessage` — extrai mensagem de erro da resposta da API.
- `mapPreviewErrorMessage` — adapta mensagens de erro para o contexto de prévia (ex.: prazo acima de 50 dias exibe aviso amigável em amarelo).

### Experiência do usuário (UX)

- **Prévia da taxa** calculada automaticamente ao informar valor e data.
- **Mensagens contextuais:**
  - Amarelo (aviso) na prévia quando a data excede 50 dias.
  - Vermelho (erro) ao tentar agendar com dados inválidos.
  - Verde (sucesso) após agendamento concluído.
- Mensagens de sucesso e erro **somem** quando o usuário altera os campos do formulário.
- O extrato é **atualizado automaticamente** após um agendamento bem-sucedido (`refreshToken` no `App.vue`).
- Layout responsivo para telas menores.

### Estilização

CSS global em `main.css`, sem framework de UI externo. Isso mantém o bundle leve e o controle total sobre o visual, incluindo a identidade visual com o logo da Tokio Marine no header.

### Configuração da API

A URL da API é configurável via variável de ambiente:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Se não definida, o padrão é `http://localhost:8080/api`.

## Funcionalidades

### Aba Agendar

- Conta de origem e destino (10 dígitos numéricos).
- Valor da transferência e data da transferência.
- Prévia da taxa (prazo, valor fixo, percentual e total).
- Validação client-side básica antes do envio.
- Feedback visual de sucesso ou erro.

### Aba Extrato

- Tabela com todos os agendamentos: ID, origem, destino, valor, taxa, data da transferência e data de criação.
- Botão para atualizar manualmente a lista.

## Estrutura do projeto

```
tms-frontend/
├── images/
│   └── tokio-marine-seguradora.png
├── src/
│   ├── App.vue
│   ├── main.js
│   ├── config.js
│   ├── assets/main.css
│   ├── components/
│   ├── services/
│   └── utils/
├── index.html
├── vite.config.js
├── package.json
└── .gitignore
```

## Pré-requisitos

- **Node.js 18+** (recomendado 20+)
- **npm** 9+
- **Backend em execução** na porta `8080` (ver [README do backend](../tms-backend/README.md))

Verificar instalação:

```bash
node -v
npm -v
```

## Como executar

### 1. Acessar o projeto

```bash
cd tms-frontend
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Subir o backend (em outro terminal)

```bash
cd ../tms-backend
JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64 mvn spring-boot:run
```

### 4. Iniciar o frontend em modo desenvolvimento

```bash
cd tms-frontend
npm run dev
```

A aplicação ficará disponível em: **http://localhost:5173**

### 5. Configurar URL da API (opcional)

Crie um arquivo `.env` na raiz do `tms-frontend`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Build para produção

```bash
npm run build
```

Os arquivos estáticos serão gerados em `dist/`.

Para visualizar o build localmente:

```bash
npm run preview
```

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (porta 5173) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build de produção |

## Integração com o backend

O backend deve estar rodando com CORS habilitado para `http://localhost:5173`. Essa configuração já existe em `WebConfig.java` no projeto `tms-backend`.

Fluxo típico:

1. Usuário preenche o formulário na aba **Agendar**.
2. Frontend chama `GET /api/transfers/fee-preview` para exibir a taxa.
3. Ao confirmar, chama `POST /api/transfers`.
4. Na aba **Extrato**, chama `GET /api/transfers` para listar os agendamentos.

## Observações

- O logo em `images/` é importado via Vite e incluído no bundle de produção.
- A pasta `node_modules/` e `dist/` não devem ser versionadas (já listadas no `.gitignore`).
