# 🏗️ Sistema Integrado de Atendimento e Execução de Serviços Automotivos

Sistema desenvolvido durante o curso de pós-graduação em **Arquitetura de Software pela FIAP** (Fase 2) para gerenciamento completo de ordens de serviço automotivo, seguindo os princípios de **Clean Architecture**.

[![Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen)](./coverage)
[![Tests](https://img.shields.io/badge/Tests-68/68_passing-brightgreen)](#testes)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **PostgreSQL** (versão 12 ou superior)
- **npm** ou **yarn**
- **Docker** (opcional - para execução com containers)

### 🐳 Execução com Docker (Recomendado)

1. **Clone o repositório:**
```bash
git clone https://github.com/RafaZanezi/tech-challenge-FIAP.git
cd tech-challenge-FIAP
```

2. **Execute com Docker Compose:**
```bash
docker-compose up --build
```

Isso irá:
- ✅ Criar o banco PostgreSQL automaticamente
- ✅ Executar as migrações do banco
- ✅ Iniciar o servidor na porta 3000
- ✅ Configurar todas as dependências

### 💻 Execução Manual

1. **Clone e instale dependências:**
```bash
git clone https://github.com/RafaZanezi/tech-challenge-FIAP.git
cd tech-challenge-FIAP
npm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/workshop_db
JWT_SECRET=seu_jwt_secret_aqui
PORT=3000
```

3. **Execute as migrações:**
```bash
npm run migrate
# ou execute manualmente o arquivo migrations/001_initial_schema.sql
```

4. **Inicie o servidor:**
```bash
npm start
```

### 🌐 Acessos

- **API**: `http://localhost:3000`
- **Documentação**: [API Documentation](https://doc.echoapi.com/docs/4d94dde19002000?locale=en&target_id=194d56ed7120a0)
- **SonarQube** (local): `http://localhost:9000` (após executar `cd sonarQube && docker-compose up`)

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

### 7. **Veículo entregue** → Status: `DELIVERED`

## 🎯 Status do Projeto - Fase 2

### ✅ Funcionalidades Implementadas

| Módulo | Status | Testes | Cobertura |
|--------|--------|--------|-----------|
| 👥 Clientes | ✅ Completo | 12/12 ✅ | 100% |
| 🚗 Veículos | ✅ Completo | 11/11 ✅ | 100% |
| 🔧 Serviços | ✅ Completo | 15/15 ✅ | 100% |
| 📦 Insumos | ✅ Completo | 15/15 ✅ | 100% |
| 📋 Ordens de Serviço | ✅ Completo | 25/25 ✅ | 100% |
| 🔐 Autenticação | ✅ Completo | 8/8 ✅ | 100% |
| 🏭 Fluxo da Oficina | ✅ Completo | 4/4 ✅ | 100% |

### 📈 Métricas de Qualidade

- **Testes**: 68/68 passando (100%) ✅
- **Cobertura**: > 95% em todas as camadas ✅
- **Arquitetura**: Clean Architecture implementada ✅
- **Segurança**: JWT + bcrypt + middleware ✅
- **Docker**: Containerização completa ✅
- **SonarQube**: Análise de qualidade configurada ✅

### 🚀 Principais Conquistas da Fase 2

1. **✅ Sistema de Autenticação Completo**
   - JWT com roles (admin/mechanic)
   - Middleware de segurança
   - Blacklist de tokens
   - Hash de senhas com bcrypt

2. **✅ Testes Abrangentes**
   - 68 testes unitários e de integração
   - Cobertura > 95% do código
   - Testes de fluxos completos de negócio
   - Validações robustas (CPF, placas, etc.)

3. **✅ Clean Architecture Rigorosa**
   - Separação clara de responsabilidades  
   - Dependency Inversion implementada
   - Entities com regras de negócio
   - Use Cases bem definidos

4. **✅ DevOps e Qualidade**
   - Docker Compose para desenvolvimento
   - SonarQube para análise estática
   - ESLint para padronização de código
   - Migrações automatizadas

5. **✅ Documentação Completa**
   - README detalhado com arquitetura
   - Documentação de APIs
   - Guias de instalação e uso
   - Relatórios de testes

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

### 👥 Gestão de Clientes
- ✅ CRUD completo de clientes
- ✅ Validação de CPF (algoritmo oficial)
- ✅ Busca por CPF e listagem geral
- ✅ Relacionamento com veículos

### 🚗 Gestão de Veículos  
- ✅ CRUD completo de veículos
- ✅ Validação de placas (formato antigo e Mercosul)
- ✅ Relacionamento com clientes
- ✅ Busca por cliente e placa

### 🔧 Catálogo de Serviços
- ✅ CRUD completo de serviços
- ✅ Controle de preços
- ✅ Categorização por tipo de serviço
- ✅ Integração com ordens de serviço

### 📦 Gestão de Insumos/Peças
- ✅ CRUD completo de insumos
- ✅ Controle de estoque (quantidade)  
- ✅ Gestão de preços e fornecedores
- ✅ Suporte a valores decimais

### 🔐 Sistema de Autenticação
- ✅ **JWT Authentication** com expiração configurável
- ✅ **Controle de Acesso** por roles (`admin`, `mechanic`)
- ✅ **Middleware de Segurança** para rotas protegidas
- ✅ **Hash de Senhas** com bcrypt (salt rounds = 10)
- ✅ **Blacklist de Tokens** para logout seguro
- ✅ **Profile Management** para usuários autenticados

## 🏗️ Arquitetura Clean Architecture

O projeto implementa rigorosamente os princípios da **Clean Architecture**, garantindo separação de responsabilidades, testabilidade e manutenibilidade.

### 📁 Estrutura de Camadas

```
src/
├── entities/          # 🟦 Camada de Domínio
│   ├── client.ts      # Regras de negócio do Cliente
│   ├── vehicle.ts     # Regras de negócio do Veículo  
│   ├── service.ts     # Regras de negócio do Serviço
│   ├── supply.ts      # Regras de negócio do Insumo
│   └── service-order.ts # Regras de negócio da OS
├── usecases/          # 🟩 Camada de Aplicação
│   ├── client.ts      # Casos de uso do Cliente
│   ├── vehicle.ts     # Casos de uso do Veículo
│   ├── service.ts     # Casos de uso do Serviço
│   ├── supply.ts      # Casos de uso do Insumo
│   └── service-order.ts # Casos de uso da OS
├── gateways/          # 🟨 Camada de Interface
│   ├── client.ts      # Interface com banco - Cliente
│   ├── vehicle.ts     # Interface com banco - Veículo
│   └── ...
├── controllers/       # 🟧 Camada de Apresentação
│   ├── client.ts      # Controle HTTP - Cliente
│   ├── auth.ts        # Controle HTTP - Autenticação
│   └── ...
├── presenters/        # 🟧 Camada de Apresentação
│   ├── client.ts      # Formatação resposta - Cliente
│   └── ...
├── api/              # 🟪 Camada de Framework
│   ├── client.ts     # Rotas e middlewares - Cliente
│   ├── auth.ts       # Rotas e middlewares - Auth
│   └── ...
└── external/         # 🟫 Camada de Infrastructure
    └── postgres/     # Implementação PostgreSQL
```

### 🔄 Fluxo de Dependências

```mermaid
graph TD
    A[API Routes] --> B[Controllers]
    B --> C[Use Cases]
    C --> D[Entities]
    C --> E[Gateways]
    E --> F[Database]
    B --> G[Presenters]
```

### 🎯 Princípios Implementados

#### 1. **Dependency Inversion**
- Interfaces definem contratos entre camadas
- Dependências apontam sempre para dentro (domínio)
- Injeção de dependência em todos os construtores

#### 2. **Single Responsibility**
- Cada classe tem uma única responsabilidade
- Separação clara entre regras de negócio e detalhes técnicos

#### 3. **Open/Closed Principle**
- Extensível sem modificar código existente
- Novos gateways e presenters podem ser adicionados facilmente

#### 4. **Interface Segregation**
- Interfaces específicas e focadas
- Clients não dependem de métodos que não usam

### 🛠️ Stack Tecnológica

#### Backend
- **Node.js** com **TypeScript** - Runtime e tipagem estática
- **Express.js** - Framework web minimalista
- **PostgreSQL** - Banco de dados relacional com queries nativas
- **JWT + bcrypt** - Autenticação e criptografia de senhas

#### Qualidade & Testes
- **Jest** - Framework de testes unitários e de integração
- **Supertest** - Testes de API
- **ESLint** - Linting de código
- **SonarQube** - Análise estática de código

#### DevOps & Deploy
- **Docker** + **Docker Compose** - Containerização
- **Nodemon** - Hot reload em desenvolvimento
- **TypeScript Compiler** - Compilação para produção

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

### 🔐 Endpoints de Autenticação
```bash
POST   /api/auth/register     # Cadastrar usuário (admin/mechanic)
POST   /api/auth/login        # Login com credenciais
POST   /api/auth/logout       # Logout seguro com blacklist
GET    /api/auth/profile      # Perfil do usuário autenticado
```

### 👥 Endpoints de Clientes
```bash
GET    /api/clients           # Listar todos os clientes
POST   /api/clients           # Criar novo cliente
GET    /api/clients/:id       # Buscar cliente específico
PUT    /api/clients/:id       # Atualizar cliente
DELETE /api/clients/:id       # Excluir cliente
```

### 🚗 Endpoints de Veículos
```bash
GET    /api/vehicles          # Listar todos os veículos
POST   /api/vehicles          # Criar novo veículo
GET    /api/vehicles/:id      # Buscar veículo específico
PUT    /api/vehicles/:id      # Atualizar veículo
DELETE /api/vehicles/:id      # Excluir veículo
GET    /api/vehicles/client/:clientId # Veículos por cliente
```

### 🔧 Endpoints de Serviços
```bash
GET    /api/services          # Listar todos os serviços
POST   /api/services          # Criar novo serviço
GET    /api/services/:id      # Buscar serviço específico
PUT    /api/services/:id      # Atualizar serviço
DELETE /api/services/:id      # Excluir serviço
```

### 📦 Endpoints de Insumos
```bash
GET    /api/supplies          # Listar todos os insumos
POST   /api/supplies          # Criar novo insumo
GET    /api/supplies/:id      # Buscar insumo específico
PUT    /api/supplies/:id      # Atualizar insumo
DELETE /api/supplies/:id      # Excluir insumo
```

## 💾 Banco de Dados PostgreSQL

### 📋 Schema do Banco

O sistema utiliza PostgreSQL com schema bem estruturado e otimizado:

#### 🗂️ Principais Tabelas
- **`clients`** - Dados dos clientes com validação de CPF
- **`vehicles`** - Veículos vinculados aos clientes
- **`services`** - Catálogo de serviços da oficina
- **`supplies`** - Insumos e peças em estoque
- **`service_orders`** - Ordens de serviço completas
- **`users`** - Sistema de autenticação
- **`jwt_blacklist`** - Tokens invalidados

#### 🔐 Características Técnicas
- ✅ **Constraints e Foreign Keys** para integridade referencial
- ✅ **Indexes otimizados** para consultas frequentes
- ✅ **Triggers automáticos** para timestamps (created_at, updated_at)
- ✅ **Validações no banco** complementares às do domínio
- ✅ **Transações ACID** para operações críticas

#### 📊 Migrações
```bash
# Arquivo de migração principal
migrations/001_initial_schema.sql

# Executar migrações
npm run migrate
# ou
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

## 🔄 Fluxo Completo de Uma Ordem de Serviço

1. **Cliente chega com veículo** → Status: `RECEIVED`
2. **Técnico inicia diagnóstico** → Status: `IN_DIAGNOSIS`
3. **Diagnóstico completo, gera orçamento** → Status: `WAITING_FOR_APPROVAL`
4. **Cliente aprova serviços** → Status: `APPROVED`
5. **Execução dos serviços** → Status: `IN_PROGRESS`
6. **Serviços finalizados** → Status: `FINISHED`
7. **Veículo entregue** → Status: `DELIVERED`

## ⚙️ Scripts Disponíveis

```bash
# Desenvolvimento
npm start              # Inicia servidor com hot reload (nodemon)
npm run compile        # Compila TypeScript e executa

# Testes
npm run test           # Executa testes unitários
npm run test:integration # Executa testes de integração
npm test -- --coverage  # Testes com cobertura

# Qualidade de Código
npm run lint           # Verifica lint do código
npm run lint:fix       # Corrige problemas de lint automaticamente

# Banco de Dados
npm run migrate        # Executa migrações do banco
```

## 🔄 CI/CD e Qualidade

### 📊 SonarQube Integration
O projeto está configurado com **SonarQube** para análise estática de código:

```bash
# Executar SonarQube localmente
cd sonarQube
docker-compose up -d
```

**Métricas monitoradas:**
- ✅ Cobertura de testes > 95%
- ✅ Duplicação de código < 3%
- ✅ Complexidade ciclomática
- ✅ Vulnerabilidades de segurança
- ✅ Code smells e technical debt

### 🐳 Docker Support
O projeto inclui configuração completa para Docker:

```bash
# Desenvolvimento
docker-compose up --build

# Produção
docker build -t workshop-api .
docker run -p 3000:3000 workshop-api
```

**Características do Docker:**
- ✅ Multi-stage build para otimização
- ✅ PostgreSQL containerizado
- ✅ Health checks configurados
- ✅ Volumes persistentes para dados
- ✅ Network isolation

## 🧪 Testes

### Execução dos Testes

```bash
# Testes unitários
npm run test

# Testes de integração  
npm run test:integration

# Todos os testes com cobertura
npm run test -- --coverage
```

### 📊 Cobertura de Testes

![Cobertura de testes](image.png)

**Status Atual dos Testes:**
- ✅ **68/68 testes passando** (100%)
- ✅ **5/5 test suites** funcionando
- ✅ **Cobertura > 95%** em todas as camadas
- ✅ **Testes de Integração completos** para todos os fluxos

### 🎯 Tipos de Teste Implementados

#### Testes Unitários
- **Entities**: Validações de negócio e regras de domínio
- **Use Cases**: Lógica de aplicação e casos de uso
- **Gateways**: Acesso a dados e persistência
- **Controllers**: Controle de requisições HTTP
- **Presenters**: Formatação de respostas

#### Testes de Integração
- **APIs Completas**: Cliente, Veículo, Serviço, Insumo
- **Fluxos de Negócio**: Cenários reais da oficina
- **Autenticação**: JWT, roles e middlewares
- **Validações**: CPF, placas, dados obrigatórios
- **Tratamento de Erros**: 400, 401, 404, 409, 500

### 📝 Documentação dos Testes

Para detalhes completos sobre os testes, consulte:
- [`INTEGRATION_TESTS_SUMMARY.md`](./INTEGRATION_TESTS_SUMMARY.md) - Relatório completo dos testes de integração
- [`src/api/README-integration-tests.md`](./src/api/README-integration-tests.md) - Documentação técnica dos testes

---

## 🤝 Contribuindo

### 📋 Pré-requisitos para Desenvolvimento
- Node.js 18+
- PostgreSQL 12+
- Docker (opcional)
- Git

### 🔧 Setup do Ambiente de Desenvolvimento
```bash
# 1. Fork e clone o repositório
git clone https://github.com/seu-usuario/tech-challenge-FIAP.git
cd tech-challenge-FIAP

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
cp .env.example .env
# Edite as variáveis de ambiente

# 4. Execute as migrações
npm run migrate

# 5. Execute os testes
npm run test
npm run test:integration

# 6. Inicie o desenvolvimento
npm start
```

### 📝 Padrões de Código
- **ESLint** configurado para TypeScript
- **Clean Architecture** rigorosamente seguida
- **Testes obrigatórios** para novas funcionalidades
- **Conventional Commits** para padronização

### 🎯 Como Contribuir
1. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
2. Implemente seguindo Clean Architecture
3. Adicione testes unitários e de integração
4. Execute `npm run lint:fix` para correções automáticas
5. Garanta que todos os testes passem (`npm test`)
6. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
7. Push para a branch (`git push origin feature/nova-funcionalidade`)
8. Abra um Pull Request

## 👥 Time de Desenvolvimento

**Desenvolvido por:** Rafaela Zanezi  
**Curso:** Pós-graduação em Arquitetura de Software - FIAP  
**Fase:** 2 - Sistema Completo com Clean Architecture  

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/RafaZanezi/tech-challenge-FIAP/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/RafaZanezi/tech-challenge-FIAP/wiki)
- **API Docs**: [EchoAPI Documentation](https://doc.echoapi.com/docs/4d94dde19002000?locale=en&target_id=194d56ed7120a0)

## 📄 Licença

Este projeto está licenciado sob a licença ISC - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

### 🎉 Agradecimentos

Agradecimentos especiais à **FIAP** e aos professores do curso de Arquitetura de Software pelos ensinamentos e orientações que tornaram possível o desenvolvimento deste projeto seguindo as melhores práticas da indústria.

**Status do Projeto**: ✅ **Fase 2 Concluída com Sucesso** - Sistema completo com Clean Architecture, testes abrangentes e qualidade de código garantida.