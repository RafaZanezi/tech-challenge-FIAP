# Pipeline CI/CD - Documentação

Este documento descreve a configuração completa do pipeline CI/CD para o projeto tech-challenge-FIAP.

## 📋 Visão Geral

O pipeline é composto por três workflows principais:

1. **CI/CD Principal** (`ci-cd.yml`) - Pipeline completo de integração e deploy
2. **Hotfix Deploy** (`hotfix.yml`) - Deploy rápido para correções emergenciais  
3. **Database Migration** (`database-migration.yml`) - Gerenciamento de migrações de banco

## 🚀 Workflows

### 1. CI/CD Principal (`ci-cd.yml`)

**Triggers:**
- Push para branches: `main`, `develop`, `fase-2`
- Pull requests para: `main`, `develop`

**Jobs:**

#### 📦 build-and-test
- ✅ Checkout do código
- ✅ Setup Node.js 18
- ✅ Instalação de dependências (`npm ci`)
- ✅ Lint com ESLint
- ✅ Setup do banco PostgreSQL para testes
- ✅ Execução de migrações
- ✅ Build da aplicação (`npm run compile`)
- ✅ Testes unitários (`npm test`)
- ✅ Testes de integração (`npm run test:integration`)
- ✅ Upload de cobertura de testes

#### 🐳 build-docker
- ✅ Build da imagem Docker multi-arquitetura (amd64/arm64)
- ✅ Push para GitHub Container Registry
- ✅ Cache otimizado
- ✅ Tagging automático baseado em branch/commit

#### 🔒 security-scan
- ✅ Scan de vulnerabilidades com Trivy
- ✅ Upload dos resultados para GitHub Security

#### 🚀 deploy-development
- ✅ Deploy automático para ambiente de desenvolvimento
- ✅ Deploy do PostgreSQL
- ✅ Execução de migrações
- ✅ Deploy da aplicação via Kustomize
- ✅ Verificação de saúde

#### 🏭 deploy-production
- ✅ Deploy para produção (apenas branch `main`)
- ✅ Aprovação manual obrigatória
- ✅ Deploy do banco com backup
- ✅ Deploy da aplicação com 5 réplicas
- ✅ Health checks completos
- ✅ Rollback automático em caso de falha

### 2. Hotfix Deploy (`hotfix.yml`)

**Uso:** Para correções emergenciais que precisam ser implantadas rapidamente.

**Triggers:**
- Push para branches `hotfix/*`
- Execução manual via workflow_dispatch

**Características:**
- Pipeline simplificado
- Apenas testes críticos
- Deploy direto sem aprovações
- Suporte a múltiplos ambientes

### 3. Database Migration (`database-migration.yml`)

**Uso:** Gerenciamento seguro de migrações de banco de dados.

**Triggers:**
- Execução manual apenas

**Recursos:**
- Backup automático (produção)
- Execução de migrações específicas ou todas
- Verificação pós-migração
- Suporte a rollback

## 🔧 Configuração Necessária

### Secrets do GitHub

Configure os seguintes secrets no repositório:

#### Para Ambientes
```
# Desenvolvimento
KUBECONFIG_DEV          # Configuração kubectl para desenvolvimento
POSTGRES_USER           # Usuário do PostgreSQL (dev)
POSTGRES_PASSWORD       # Senha do PostgreSQL (dev)  
POSTGRES_DB             # Nome do banco (dev)

# Produção
KUBECONFIG_PROD         # Configuração kubectl para produção
POSTGRES_USER_PROD      # Usuário do PostgreSQL (prod)
POSTGRES_PASSWORD_PROD  # Senha do PostgreSQL (prod)
POSTGRES_DB_PROD        # Nome do banco (prod)

# Container Registry
GITHUB_TOKEN            # Token para GHCR (automático)
```

### Ambientes do GitHub

Configure os seguintes environments:
- `development` - Deploy automático
- `production` - Requer aprovação manual

## 📊 Fluxo de Trabalho

### Desenvolvimento Normal
1. Push para `develop` ou `fase-2`
2. Pipeline executa testes e build
3. Deploy automático para desenvolvimento
4. Verificação de funcionamento

### Release para Produção
1. Merge/Push para `main`
2. Pipeline completo com security scan
3. **Aprovação manual necessária**
4. Deploy para produção
5. Health checks e monitoramento

### Hotfix Emergencial
1. Criar branch `hotfix/nome-do-fix`
2. Push para branch
3. Pipeline de hotfix executa
4. Deploy rápido com testes mínimos

### Migração de Banco
1. Acessar Actions → Database Migration
2. Selecionar ambiente
3. Especificar arquivo (opcional)
4. Executar manualmente

## 🔍 Monitoramento

### Verificações Incluídas
- ✅ Testes unitários e integração
- ✅ Análise de código (ESLint)
- ✅ Scan de segurança (Trivy)
- ✅ Cobertura de testes
- ✅ Health checks da aplicação
- ✅ Status dos pods Kubernetes

### Logs e Alertas
- Todos os jobs mantêm logs detalhados
- Falhas são reportadas via GitHub notifications
- Security scans aparecem na aba Security

## 📁 Estrutura de Arquivos

```
.github/
├── workflows/
│   ├── ci-cd.yml              # Pipeline principal
│   ├── hotfix.yml             # Deploy de hotfix
│   └── database-migration.yml # Migrações DB
└── PIPELINE_DOCS.md          # Esta documentação
```

## 🛠️ Customização

### Modificar Ambientes
Edite os valores em `ci-cd.yml`:
```yaml
environment: development  # ou production
```

### Alterar Recursos Kubernetes
Modifique os arquivos em `/k8s/`:
- `kustomization.yaml` - Configurações principais
- `deployment.yaml` - Especificações da aplicação
- `postgres.yaml` - Configurações do banco

### Adicionar Novos Testes
1. Adicione testes em `/src/`
2. Configure em `package.json`
3. Pipeline executará automaticamente

## 🚨 Troubleshooting

### Build Falha
1. Verifique logs do job `build-and-test`
2. Execute localmente: `npm ci && npm test`
3. Corrija erros de lint: `npm run lint:fix`

### Deploy Falha
1. Verifique configuração do kubectl
2. Confirme secrets estão configurados
3. Verifique logs do cluster Kubernetes

### Migrações Falham
1. Use workflow de migration manual
2. Verifique backup antes de produção
3. Teste em desenvolvimento primeiro

## 📞 Contato

Para dúvidas sobre o pipeline, abra uma issue no repositório ou contate a equipe de DevOps.