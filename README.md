# API de Livros - Requisitos N1B

API REST para gerenciar livros com persistência em MongoDB Atlas, upload de imagens em Cloudinary e testes automatizados com Jest.

## Requisitos Implementados

- **A. Armazenar dados com banco de dados MongoDB em nuvem** ✅
  - Integração com MongoDB Atlas
  - Modelo Mongoose com esquema Book
  - Persistência de 27 livros iniciais via `seed.js`

- **B. Salvar imagem em nuvem** ✅
  - Upload de imagens para Cloudinary
  - Rota `POST /api/items/:codigo/image`
  - Multipart/form-data com multer

- **C. Rota PUT que atualiza dados no BD** ✅
  - `PUT /api/items/:codigo` — atualiza livro existente

- **D. Testes automatizados com Jest** ✅
  - 13 testes cobrindo rotas, middlewares e autenticação
  - Suites: `tests/bookRoutes.test.js`, `tests/middlewares.test.js`
  - Execução: `npm test`

## Instalação e Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Variáveis de Ambiente

Configure um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/banco?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
JWT_SECRET=sua_chave_secreta
PORT=3000
```

### 3. Popular banco de dados (opcional)
```bash
node seed.js
```

## Como Rodar

### Desenvolvimento
```bash
node src/app.js
```

### Testes
```bash
npm test
```

## Endpoints da API

### Livros (Books)

#### GET /api/items
Lista todos os livros

**Resposta (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "codigo": 1,
    "titulo": "Clean Code",
    "autor": "Robert C. Martin",
    "descricao": "Guia sobre código limpo",
    "resenha": "Excelente referência",
    "imageUrl": "https://res.cloudinary.com/...",
    "timestamps": "2026-04-17T15:00:00Z"
  }
]
```

#### POST /api/items
Cria um novo livro

**Body (JSON):**
```json
{
  "codigo": 1,
  "titulo": "Clean Code",
  "autor": "Robert C. Martin",
  "descricao": "Guia sobre código limpo",
  "resenha": "Excelente referência"
}
```

**Resposta (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "codigo": 1,
  "titulo": "Clean Code",
  "autor": "Robert C. Martin",
  "descricao": "Guia sobre código limpo",
  "resenha": "Excelente referência",
  "timestamps": "2026-04-17T15:00:00Z"
}
```

#### GET /api/items/:codigo
Busca um livro pelo código

**Resposta (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "codigo": 1,
  "titulo": "Clean Code",
  "autor": "Robert C. Martin",
  "descricao": "Guia sobre código limpo",
  "resenha": "Excelente referência",
  "imageUrl": "https://res.cloudinary.com/...",
  "timestamps": "2026-04-17T15:00:00Z"
}
```

#### PUT /api/items/:codigo
Atualiza um livro existente

**Body (JSON):**
```json
{
  "titulo": "Clean Code (Atualizado)",
  "descricao": "Versão revisada"
}
```

**Resposta (200 OK):**
```json
{
  "message": "Livro atualizado com sucesso",
  "livro": {
    "_id": "507f1f77bcf86cd799439011",
    "codigo": 1,
    "titulo": "Clean Code (Atualizado)",
    "autor": "Robert C. Martin",
    "descricao": "Versão revisada",
    "resenha": "Excelente referência",
    "timestamps": "2026-04-17T15:00:00Z"
  }
}
```

#### DELETE /api/items/:codigo
Exclui um livro

**Resposta (204 No Content)** (sem body)

#### POST /api/items/:codigo/image
Faz upload de imagem para Cloudinary

**Body:** multipart/form-data
- Campo: `image` (tipo File)

**Resposta (200 OK):**
```json
{
  "message": "Imagem enviada com sucesso",
  "imageUrl": "https://res.cloudinary.com/..../image.jpg"
}
```

#### GET /api/items/pdf
Gera PDF com lista de livros

**Resposta:** arquivo PDF (application/pdf)

## Autenticação

#### POST /logar
Faz login e retorna JWT token

**Body (JSON):**
```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

**Resposta (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzdWFyaW9AZXhlbXBsby5jb20iLCJpYXQiOjE2MzM1NzQ4MDAsImV4cCI6MTYzMzU3ODQwMH0...."
}
```

**Resposta (401 Unauthorized):**
```json
{
  "message": "Credenciais inválidas"
}
```

## Logs e Relatórios

#### GET /api/requests/:date
Retorna requisições feitas em uma data específica

**Formato de data:** `YYYY-MM-DD` (ex: `2026-04-17`)

**Resposta (200 OK):**
```json
[
  {
    "url": "/api/items",
    "date": "2026-04-17T15:30:45.123Z"
  },
  {
    "url": "/api/items/1",
    "date": "2026-04-17T15:35:20.456Z"
  }
]
```

**Resposta (404 Not Found):**
```json
{
  "message": "Nenhuma requisição encontrada para esta data"
}
```

## Middlewares

### checkWeekday
Bloqueia requisições aos finais de semana (sábado e domingo)

- Dias úteis (segunda a sexta): ✅ requisição permitida
- Finais de semana: ❌ retorna `403 Forbidden`

### logRequest
Registra todas as requisições com timestamp em `src/logs.js`

Formato: `{ url, date }`

## Exemplos com cURL

### Listar livros
```bash
curl http://localhost:3000/api/items
```

### Criar livro
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": 1,
    "titulo": "Clean Code",
    "autor": "Robert C. Martin",
    "descricao": "Guia sobre código limpo",
    "resenha": "Excelente referência"
  }'
```

### Buscar livro por código
```bash
curl http://localhost:3000/api/items/1
```

### Atualizar livro
```bash
curl -X PUT http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Clean Code - Edição Revisada"
  }'
```

### Deletar livro
```bash
curl -X DELETE http://localhost:3000/api/items/1
```

### Fazer login
```bash
curl -X POST http://localhost:3000/logar \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "senha": "senha123"
  }'
```

### Gerar PDF
```bash
curl http://localhost:3000/api/items/pdf -o livros.pdf
```

### Consultar logs por data
```bash
curl http://localhost:3000/api/requests/2026-04-17
```

### Upload de imagem com cURL
```bash
curl -X POST http://localhost:3000/api/items/1/image \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/caminho/para/o/arquivo.jpg"
```

## Uso no Postman

### Upload de imagem
1. Método: `POST`
2. URL: `http://localhost:3000/api/items/1/image`
3. Aba `Body` → selecione `form-data`
4. Campo `image` do tipo `File`
5. Selecione arquivo e clique em `Send`

**Resposta esperada:**
```json
{
  "message": "Imagem enviada com sucesso",
  "imageUrl": "https://res.cloudinary.com/.../image.jpg"
}
```

### Criar livro
1. Método: `POST`
2. URL: `http://localhost:3000/api/items`
3. Aba `Body` → `raw` → JSON
4. Insira JSON:
```json
{
  "codigo": 1,
  "titulo": "Clean Code",
  "autor": "Robert C. Martin",
  "descricao": "Guia sobre código limpo",
  "resenha": "Excelente referência"
}
```

## Testes Automatizados

### Executar todos os testes
```bash
npm test
```

### Cobertura de testes
- ✅ **10 testes de rotas** (GET, POST, PUT, DELETE, PDF, image upload, autenticação, logs)
- ✅ **3 testes de middlewares** (weekday check, log request)
- ✅ **Total: 13 testes**

### Suites de teste
- `tests/bookRoutes.test.js` — testes de rotas e endpoints
- `tests/middlewares.test.js` — testes de middlewares

### Tecnologias de teste
- **Jest** — framework de testes
- **Supertest** — biblioteca para testar HTTP
- **MongoDB Memory Server** — banco de dados em memória para testes

## Estrutura do Projeto

```
api1/
├── src/
│   ├── app.js                    # Aplicação Express principal
│   ├── logs.js                   # Array para armazenar logs
│   ├── models/
│   │   └── Book.js              # Schema Mongoose para livros
│   ├── routes/
│   │   └── bookRoutes.js         # Rotas da API de livros
│   └── middlewares/
│       ├── logMiddleware.js       # Middleware de logging
│       └── weekdayMiddleware.js   # Middleware de controle de dia
├── tests/
│   ├── bookRoutes.test.js        # Testes de rotas
│   └── middlewares.test.js       # Testes de middlewares
├── seed.js                        # Script para popular BD
├── package.json                   # Dependências do projeto
├── .gitignore                     # Arquivos ignorados no Git
└── README.md                      # Este arquivo
```

## Tecnologias Utilizadas

- **Node.js** — runtime JavaScript
- **Express** — framework web
- **Mongoose** — ODM para MongoDB
- **MongoDB Atlas** — banco de dados em nuvem
- **Cloudinary** — armazenamento de imagens
- **Multer** — middleware para upload de arquivos
- **PDFKit** — gerador de PDFs
- **JWT** — autenticação por tokens
- **Jest** — framework de testes
- **Supertest** — testes HTTP

## Variáveis de Ambiente Suportadas

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `MONGO_URI` | Não | URI do MongoDB (padrão: conexão pública) |
| `CLOUDINARY_CLOUD_NAME` | Sim | Cloud name da Cloudinary |
| `CLOUDINARY_API_KEY` | Sim | API key da Cloudinary |
| `CLOUDINARY_API_SECRET` | Sim | API secret da Cloudinary |
| `JWT_SECRET` | Não | Chave secreta para JWT (padrão: 'secreta') |
| `PORT` | Não | Porta do servidor (padrão: 3000) |

## Tratamento de Erros

Todos os endpoints retornam status HTTP apropriados:

- `200 OK` — requisição bem-sucedida
- `201 Created` — recurso criado
- `204 No Content` — recurso deletado
- `400 Bad Request` — dados inválidos
- `401 Unauthorized` — credenciais inválidas
- `403 Forbidden` — acesso negado (ex: fim de semana)
- `404 Not Found` — recurso não encontrado
- `500 Internal Server Error` — erro do servidor

## Commits Git

Todos os requisitos foram versionados no Git com commit `N1B`:

```
git log --oneline
e545043 N1B - Implementação de todos os requisitos
```

## Autor

Desenvolvido como parte da N1B do curso WEBII.
