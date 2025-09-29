# API de Autenticação

Esta documentação descreve os endpoints da API de autenticação do sistema integrado de atendimento e execução de serviços.

## Endpoints

### 1. Registrar Usuário
**POST** `/api/auth/register`

Cria um novo usuário no sistema.

#### Request Body
```json
{
    "name": "string",
    "password": "string",
    "role": "admin" | "mechanic"
}
```

#### Response (201 - Success)
```json
{
    "message": "Usuário criado com sucesso",
    "data": {
        "user": {
            "id": 1,
            "name": "João Silva",
            "role": "admin"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

#### Response (400 - Bad Request)
```json
{
    "message": "Nome, senha e função são obrigatórios"
}
```

#### Response (409 - Conflict)
```json
{
    "message": "Usuário com este nome já existe"
}
```

### 2. Login
**POST** `/api/auth/login`

Autentica um usuário existente.

#### Request Body
```json
{
    "name": "string",
    "password": "string"
}
```

#### Response (200 - Success)
```json
{
    "message": "Login realizado com sucesso",
    "data": {
        "user": {
            "id": 1,
            "name": "João Silva",
            "role": "admin"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

#### Response (400 - Bad Request)
```json
{
    "message": "Nome e senha são obrigatórios"
}
```

#### Response (401 - Unauthorized)
```json
{
    "message": "Credenciais inválidas"
}
```

### 3. Logout
**POST** `/api/auth/logout`

Faz logout do usuário (adiciona o token à blacklist).

#### Headers
```
Authorization: Bearer <token>
```

#### Response (200 - Success)
```json
{
    "message": "Logout realizado com sucesso"
}
```

#### Response (401 - Unauthorized)
```json
{
    "message": "Token não fornecido"
}
```

### 4. Perfil do Usuário
**GET** `/api/auth/profile`

Retorna as informações do usuário autenticado.

#### Headers
```
Authorization: Bearer <token>
```

#### Response (200 - Success)
```json
{
    "message": "Perfil do usuário",
    "data": {
        "id": 1,
        "name": "João Silva",
        "role": "admin"
    }
}
```

#### Response (401 - Unauthorized)
```json
{
    "message": "Usuário não autenticado"
}
```

## Middlewares

### verifyJWT
Middleware que verifica se o token JWT é válido e não está na blacklist.

### requireAdmin
Middleware que verifica se o usuário autenticado tem papel de administrador.

## Roles (Funções)

- **admin**: Administrador do sistema com acesso completo
- **mechanic**: Mecânico com acesso limitado

## Validações

### Senha
- Mínimo de 6 caracteres

### Nome
- Obrigatório e não pode estar vazio

### Role
- Deve ser uma das opções válidas: 'admin' ou 'mechanic'

## Segurança

- Senhas são hasheadas usando bcrypt com salt rounds = 10
- Tokens JWT têm expiração de 24 horas
- Logout adiciona o token à blacklist para invalidação imediata
- Senhas nunca são retornadas nas respostas da API

## Exemplos de Uso

### Registrar um novo administrador
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "password": "admin123",
    "role": "admin"
  }'
```

### Fazer login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "password": "admin123"
  }'
```

### Acessar perfil (usando token do login)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Estrutura Clean Architecture

A implementação segue os princípios da Clean Architecture:

- **Entities** (`src/entities/auth-user.ts`): Lógica de negócio e validações
- **Use Cases** (`src/usecases/user.ts`): Casos de uso de autenticação
- **Gateways** (`src/gateways/user.ts`): Interface com o banco de dados
- **Controllers** (`src/controllers/auth.ts`): Controle das requisições HTTP
- **Presenters** (`src/presenters/auth.ts`): Formatação das respostas
- **API** (`src/api/auth.ts`): Definição das rotas

## Testes

Os testes de integração estão localizados em `src/api/auth.integration.test.ts` e cobrem:

- Registro de usuários
- Login com credenciais válidas e inválidas
- Acesso a rotas protegidas
- Logout e invalidação de tokens
- Validações de entrada