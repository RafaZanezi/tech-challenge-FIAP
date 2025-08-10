# Sistema Integrado de Atendimento e Execução de Serviços

Sistema desenvolvido durante o curso de pós-graduação em Arquitetura de Software pela FIAP para gerenciamento de ordens de serviço automotivo.

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- PostgreSQL
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd tech-challenge-FIAP
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações de banco de dados e JWT secret.

4. Execute as migrações do banco de dados:
```bash
# Execute o script SQL em migrations/001_initial_schema.sql no seu PostgreSQL
```

5. Inicie o servidor:
```bash
npm start
```

6. Se preferir, utilize o docker-compose na pasta raiz com o comando: 
```docker-compose up```

O servidor estará rodando em `http://localhost:3000`.
As APIs do projeto podem ser consultadas em `https://doc.echoapi.com/docs/4d94dde19002000?locale=en&target_id=194d56ed7120a0`

## 📋 Fluxo de Ordem de Serviço

O sistema gerencia ordens de serviço automotivo seguindo um fluxo bem definido com os seguintes status:

### 1. **RECEIVED** (Recebida)
- Status inicial quando uma ordem de serviço é criada
- **Endpoint**: `POST /api/service-order`
- Valida se não existe OS aberta para o mesmo veículo e cliente

### 2. **IN_DIAGNOSIS** (Em Diagnóstico)
- Início do diagnóstico do veículo
- **Endpoint**: `PUT /api/service-order/:id/start-diagnosis`
- Técnicos avaliam o problema e determinam serviços/peças necessárias

### 3. **WAITING_FOR_APPROVAL** (Aguardando Aprovação)
- OS enviada para aprovação do cliente
- **Endpoint**: `PUT /api/service-order/:id/submit-approval`
- Cliente pode visualizar orçamento e decidir se aprova

### 4. **APPROVED** (Aprovada)
- Cliente aprovou o orçamento
- **Endpoint**: `PUT /api/service-order/:id/approve`
- OS pode prosseguir para execução

### 5. **IN_PROGRESS** (Em Execução)
- Serviços sendo executados
- **Endpoint**: `PUT /api/service-order/:id/start-execution`
- Técnicos executam os serviços aprovados

### 6. **FINISHED** (Finalizada)
- Serviços concluídos
- **Endpoint**: `PUT /api/service-order/:id/finalize`
- OS pronta para entrega

### 7. **DELIVERED** (Entregue)
- Veículo entregue ao cliente
- **Endpoint**: `PUT /api/service-order/:id/deliver`
- Status final do fluxo

### 8. **CANCELLED** (Cancelada)
- OS cancelada (pode acontecer em qualquer etapa)
- **Endpoint**: `PUT /api/service-order/:id/cancel`

## 🔧 Funcionalidades Principais

### Gestão de Ordens de Serviço
- ✅ Criar nova OS
- ✅ Listar todas as OS
- ✅ Buscar OS específica
- ✅ Atualizar diagnóstico
- ✅ Tempo médio de execução
- ✅ Controle completo do fluxo de status

### Gestão de Clientes, Serviços e Suprimentos
- Gerenciamento de clientes
- Catálogo de serviços
- Gestão de peças/suprimentos
- Cadastro de veículos

### Autenticação
- Sistema de autenticação JWT
- Controle de acesso por roles (Admin/User)
- Middleware de segurança

## 🏗️ Arquitetura

O projeto segue princípios de Clean Architecture com estrutura modular:

- **Domain**: Entidades e regras de negócio
- **Application**: Casos de uso
- **Infrastructure**: Acesso a dados e serviços externos
- **Presentation**: Controllers e rotas

### Tecnologias Utilizadas
- **Backend**: Node.js + Express
- **Database**: PostgreSQL com queries nativas
- **Auth**: JWT + bcrypt
- **TypeScript**: Para tipagem estática
- **Nodemon**: Para desenvolvimento com hot reload

## 📚 Endpoints Principais

```
POST   /api/service-order                        # Criar OS
GET    /api/service-order                        # Listar todas OS
GET    /api/service-order/:id                    # Buscar OS específica
PUT    /api/service-order/:id/start-diagnosis    # Iniciar diagnóstico
PUT    /api/service-order/:id/update-diagnosis   # Atualizar diagnóstico
PUT    /api/service-order/:id/submit-approval    # Enviar para aprovação
PUT    /api/service-order/:id/approve            # Aprovar OS
PUT    /api/service-order/:id/start-execution    # Iniciar execução
PUT    /api/service-order/:id/finalize           # Finalizar OS
PUT    /api/service-order/:id/deliver            # Entregar veículo
PUT    /api/service-order/:id/cancel             # Cancelar OS
GET    /api/service-order/average-time           # Tempo médio de execução
```

### Outros Endpoints
```
# Autenticação
POST   /api/auth/register                        # Cadastrar usuário
POST   /api/auth/login                           # Login

# Clientes
GET    /api/clients                              # Listar clientes
POST   /api/clients                              # Criar cliente

# Serviços
GET    /api/services                             # Listar serviços
POST   /api/services                             # Criar serviço

# Suprimentos
GET    /api/supplies                             # Listar suprimentos
POST   /api/supplies                             # Criar suprimento
```

## 💾 Banco de Dados

O sistema utiliza PostgreSQL com schema bem definido incluindo:

- Tabelas para clientes, veículos, serviços e suprimentos
- Controle de ordens de serviço com relacionamentos
- Sistema de autenticação e autorização
- Triggers para auditoria e controle de timestamps

## 🔄 Fluxo Completo de Uma Ordem de Serviço

1. **Cliente chega com veículo** → Status: `RECEIVED`
2. **Técnico inicia diagnóstico** → Status: `IN_DIAGNOSIS`
3. **Diagnóstico completo, gera orçamento** → Status: `WAITING_FOR_APPROVAL`
4. **Cliente aprova serviços** → Status: `APPROVED`
5. **Execução dos serviços** → Status: `IN_PROGRESS`
6. **Serviços finalizados** → Status: `FINISHED`
7. **Veículo entregue** → Status: `DELIVERED`

O sistema está configurado para rodar com **nodemon**, recompilando automaticamente o TypeScript a cada mudança através do comando