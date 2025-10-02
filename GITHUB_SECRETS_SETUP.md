# 🔐 Configuração de Secrets do GitHub Actions

Este documento explica como configurar os secrets necessários para o funcionamento completo do pipeline CI/CD.

## 🚨 Problema Atual

O build do GitHub Actions está falhando com o erro:
```
error: current-context is not set
Error: Process completed with exit code 1.
```

**Causa**: Os secrets do Kubernetes não estão configurados no repositório.

## 📋 Secrets Necessários

### Para Development (branch: develop, fase-2)

| Secret Name | Descrição | Como Obter |
|-------------|-----------|------------|
| `KUBECONFIG_DEV` | Configuração do kubectl para dev | `kubectl config view --raw \| base64 \| tr -d '\n'` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL (dev) | Definir senha (ex: `admin`) |
| `POSTGRES_USER` | Usuário do PostgreSQL (dev) | Definir usuário (ex: `postgres`) |
| `POSTGRES_DB` | Nome do banco PostgreSQL (dev) | Definir nome (ex: `postgres`) |

### Para Production (branch: main)

| Secret Name | Descrição | Como Obter |
|-------------|-----------|------------|
| `KUBECONFIG_PROD` | Configuração do kubectl para prod | `kubectl config view --raw \| base64 \| tr -d '\n'` |
| `POSTGRES_PASSWORD_PROD` | Senha do PostgreSQL (prod) | Senha segura para produção |
| `POSTGRES_USER_PROD` | Usuário do PostgreSQL (prod) | Usuário para produção |
| `POSTGRES_DB_PROD` | Nome do banco PostgreSQL (prod) | Nome do banco para produção |

## 🛠️ Como Configurar

### 1. Acessar Configurações do Repositório

1. Vá para o repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**

### 2. Adicionar Secrets

Para cada secret necessário:

1. Clique em **New repository secret**
2. Digite o **Name** (nome do secret)
3. Digite o **Secret** (valor do secret)
4. Clique em **Add secret**

### 3. Obter KUBECONFIG

#### Para Cluster Local (Kind/Minikube)

```bash
# Verificar se há contexto ativo
kubectl config current-context

# Se não há cluster, criar um com Kind
kind create cluster --name workshop-cluster

# Obter kubeconfig codificado
kubectl config view --raw | base64 | tr -d '\n'
```

#### Para Cluster AWS (EKS)

```bash
# Conectar ao cluster EKS
aws eks update-kubeconfig --region us-west-2 --name workshop-eks-cluster

# Obter kubeconfig codificado
kubectl config view --raw | base64 | tr -d '\n'
```

### 4. Configurar Secrets PostgreSQL

```bash
# Para desenvolvimento (valores de exemplo)
POSTGRES_PASSWORD=admin
POSTGRES_USER=postgres
POSTGRES_DB=postgres

# Para produção (usar valores seguros)
POSTGRES_PASSWORD_PROD=senha-super-segura-production
POSTGRES_USER_PROD=workshop_user
POSTGRES_DB_PROD=workshop_production
```

## 🚀 Opções de Deploy

### Opção 1: Deploy Apenas Local (Recomendado para desenvolvimento)

Se você não tem um cluster Kubernetes real, pode configurar apenas para desenvolvimento local:

1. **Criar cluster local com Kind:**
```bash
# Instalar Kind (se necessário)
# MacOS: brew install kind
# Linux: https://kind.sigs.k8s.io/docs/user/quick-start/

# Criar cluster
kind create cluster --name workshop-cluster

# Verificar
kubectl cluster-info
```

2. **Configurar apenas secrets de DEV:**
- `KUBECONFIG_DEV`
- `POSTGRES_PASSWORD` 
- `POSTGRES_USER`
- `POSTGRES_DB`

### Opção 2: Deploy com Infraestrutura AWS

1. **Provisionar infraestrutura:**
```bash
cd infra/environments/aws
terraform init
terraform plan
terraform apply
```

2. **Configurar todos os secrets** (DEV + PROD)

### Opção 3: Desabilitar Deploy Temporariamente

Modifique o workflow para pular o deploy até configurar a infraestrutura:

```yaml
# No arquivo .github/workflows/ci-cd.yml
# Adicione condição para pular deploy:
if: false && github.event_name == 'push' ...
```

## 📝 Exemplo de Configuração Completa

### Secrets no GitHub

```
KUBECONFIG_DEV=LS0tLS1CRUdJTi... (base64)
POSTGRES_PASSWORD=admin
POSTGRES_USER=postgres
POSTGRES_DB=postgres

KUBECONFIG_PROD=LS0tLS1CRUdJTi... (base64)
POSTGRES_PASSWORD_PROD=prod-secret-password
POSTGRES_USER_PROD=workshop_user  
POSTGRES_DB_PROD=workshop_production
```

### Teste Local

```bash
# Testar se kubectl funciona
kubectl cluster-info

# Testar se há recursos necessários
kubectl get nodes
kubectl top nodes

# Executar deploy local
cd k8s/
./deploy.sh
```

## 🆘 Troubleshooting

### Erro: "current-context is not set"

**Problema**: Não há cluster Kubernetes configurado

**Soluções**:
1. Criar cluster local: `kind create cluster`
2. Conectar a cluster existente: `aws eks update-kubeconfig`
3. Verificar kubeconfig: `kubectl config view`

### Erro: "Context access might be invalid"

**Problema**: Secret não existe no repositório

**Solução**: Configurar o secret nas configurações do GitHub

### Erro: "Failed to decode base64"

**Problema**: KUBECONFIG mal codificado

**Solução**: 
```bash
# Re-gerar kubeconfig
kubectl config view --raw | base64 | tr -d '\n'
```

### Deploy falha por timeout

**Problema**: Cluster não tem recursos suficientes

**Soluções**:
1. Verificar nodes: `kubectl get nodes`
2. Verificar recursos: `kubectl top nodes`
3. Ajustar resource requests no deployment

## 📚 Próximos Passos

1. **Configurar secrets** conforme este documento
2. **Testar pipeline** fazendo um commit na branch `fase-2`
3. **Monitorar logs** do GitHub Actions
4. **Ajustar configurações** conforme necessário

## 🔗 Links Úteis

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Kind Quick Start](https://kind.sigs.k8s.io/docs/user/quick-start/)
- [kubectl Configuration](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)
- [Terraform AWS EKS](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/eks_cluster)

---

**💡 Dica**: Comece com a Opção 1 (cluster local) para desenvolvimento e depois evolua para infraestrutura AWS quando necessário.