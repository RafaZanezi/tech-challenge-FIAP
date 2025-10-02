# 🚀 Pipeline CI/CD - Setup Rápido

Este guia ajuda você a configurar e usar o pipeline CI/CD do projeto.

## ⚡ Setup Rápido (5 minutos)

### 1. Configurar Secrets no GitHub

Vá para `Settings > Secrets and variables > Actions` e adicione:

```bash
# Desenvolvimento
KUBECONFIG_DEV=<seu_kubeconfig_dev_em_base64>
POSTGRES_USER=workshop_user
POSTGRES_PASSWORD=dev_password_123
POSTGRES_DB=workshop_db

# Produção  
KUBECONFIG_PROD=<seu_kubeconfig_prod_em_base64>
POSTGRES_USER_PROD=workshop_user_prod
POSTGRES_PASSWORD_PROD=super_secure_prod_password
POSTGRES_DB_PROD=workshop_db_prod
```

### 2. Configurar Environments

Crie dois environments:
- `development` - Deploy automático
- `production` - Requer aprovação manual

### 3. Testar Localmente

```bash
# Executar verificação completa
./scripts/verify-pipeline.sh

# Verificação rápida (sem Docker)
./scripts/verify-pipeline.sh --skip-docker
```

### 4. Fazer Push

```bash
git add .
git commit -m "feat: adicionar pipeline CI/CD"
git push origin sua-branch
```

## 🔄 Como Funciona

### Push para `develop` ou `fase-2`
- ✅ Testes automatizados
- ✅ Build da aplicação  
- ✅ Build da imagem Docker
- ✅ Deploy automático para desenvolvimento
- ✅ Aplicação dos manifestos K8s

### Push para `main`
- ✅ Tudo do desenvolvimento +
- ✅ Scan de segurança
- ⏸️ **Aguarda aprovação manual**
- ✅ Deploy para produção
- ✅ Health checks completos

### Branch `hotfix/*`
- ✅ Pipeline simplificado
- ✅ Deploy rápido para emergências

## 🎯 Endpoints Úteis

### Health Check
```bash
curl http://your-app/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "database": "connected",
  "uptime": 123.45
}
```

## 🐛 Troubleshooting

### Pipeline Falha nos Testes
```bash
# Executar testes localmente
npm test
npm run test:integration

# Corrigir lint
npm run lint:fix
```

### Deploy Falha
```bash
# Verificar logs no GitHub Actions
# Verificar se secrets estão configurados
# Verificar se cluster K8s está acessível
```

### Banco de Dados
```bash
# Executar migração manual
gh workflow run database-migration.yml \
  -f environment=development \
  -f migration_file=001_initial_schema.sql
```

## 📋 Checklist Rápido

- [ ] Secrets configurados no GitHub
- [ ] Environments criados (dev/prod)
- [ ] Kubeconfig válido e acessível
- [ ] Cluster Kubernetes funcionando
- [ ] `./scripts/verify-pipeline.sh` passou
- [ ] Branch está limpa e atualizada

## 🆘 Comandos de Emergência

### Rollback Produção
```bash
kubectl rollout undo deployment/workshop-app-deployment -n workshop-app
```

### Hotfix Deploy
```bash
git checkout -b hotfix/critical-fix
# fazer alterações
git push origin hotfix/critical-fix
# Pipeline executa automaticamente
```

### Verificar Status
```bash
kubectl get pods -n workshop-app
kubectl logs -f deployment/workshop-app-deployment -n workshop-app
```

---

💡 **Dica**: Execute sempre `./scripts/verify-pipeline.sh` antes de fazer push para evitar falhas no pipeline!