# Solução para Erro de Conexão Kind no GitHub Actions

## 🔍 Problema Identificado

Você estava enfrentando este erro no GitHub Actions:

```
E1002 19:36:40.981567 2146 memcache.go:265] "Unhandled Error" err="couldn't get current server API group list: Get \"https://127.0.0.1:52636/api?timeout=32s\": dial tcp 127.0.0.1:52636: connect: connection refused"
The connection to the server 127.0.0.1:52636 was refused - did you specify the right host or port?
```

## 🎯 Causa Raiz

O erro ocorre porque:

1. **Localmente**: Seu cluster Kind está rodando em `127.0.0.1:52636`
2. **No GitHub Actions**: Não há cluster Kind rodando nesse endereço
3. **O kubeconfig**: Aponta para o cluster local que não existe no CI

## ✅ Soluções Implementadas

### 1. Workflow com Kind Automático (`test-with-kind.yml`)

Criamos um novo workflow que:
- ✅ Cria cluster Kind automaticamente no GitHub Actions
- ✅ Aguarda cluster ficar pronto
- ✅ Testa o deployment completo
- ✅ Não depende de secrets externos

### 2. Script Local Melhorado (`setup-kind-cluster.sh`)

Atualizamos o script para:
- ✅ Usar nome consistente `dev-cluster`
- ✅ Aguardar cluster ficar pronto
- ✅ Gerar kubeconfig válido
- ✅ Verificar conectividade

### 3. Workflow de Diagnóstico (`fix-kind-connection.yml`)

Criamos workflow para:
- ✅ Testar conectividade kubectl
- ✅ Gerar kubeconfig válido
- ✅ Documentar troubleshooting

## 🚀 Como Usar

### Para Desenvolvimento Local
```bash
# 1. Execute o script (já funciona!)
./setup-kind-cluster.sh

# 2. Verificar se está funcionando
kubectl cluster-info
kubectl get nodes
```

### Para GitHub Actions
```bash
# Use qualquer um destes workflows:

# 1. Workflow completo com testes Kind
.github/workflows/test-with-kind.yml

# 2. Workflow existente (sem Kind)
.github/workflows/ci-cd.yml

# 3. Workflow de diagnóstico
.github/workflows/fix-kind-connection.yml
```

## 🔧 Configuração de Secrets (Opcional)

Se quiser usar cluster externo no GitHub Actions:

```bash
# 1. Gerar kubeconfig local
kubectl config view --raw --context kind-dev-cluster | base64 -w 0

# 2. Adicionar no GitHub:
# Settings → Secrets and variables → Actions
# Nome: KUBECONFIG_DEV
# Valor: [kubeconfig base64]
```

## 📊 Status da Correção

| Item | Status | Descrição |
|------|--------|-----------|
| 🔧 Script local | ✅ **Corrigido** | `setup-kind-cluster.sh` funciona |
| 🐳 Cluster local | ✅ **Funcionando** | Kind roda em `127.0.0.1:52636` |
| 🚀 GitHub Actions | ✅ **Novo workflow** | `test-with-kind.yml` cria cluster |
| 📋 Documentação | ✅ **Criada** | Guias e troubleshooting |
| 🧪 Testes | ✅ **Automatizados** | CI/CD testa deployment |

## 🎯 Próximos Passos

1. **Testar localmente** (já deve funcionar):
   ```bash
   ./setup-kind-cluster.sh
   kubectl get nodes
   ```

2. **Fazer push para testar o CI**:
   ```bash
   git add .
   git commit -m "fix: correção do Kind no GitHub Actions"
   git push
   ```

3. **Verificar workflows**:
   - Acompanhar execução em `Actions` no GitHub
   - O workflow `test-with-kind.yml` deve passar

## 🔍 Troubleshooting

Se ainda houver problemas:

1. **Verificar cluster local**:
   ```bash
   kind get clusters
   docker ps | grep kind
   kubectl cluster-info
   ```

2. **Executar workflow de diagnóstico**:
   - Vá em `Actions` → `Fix GitHub Actions with Kind`
   - Clique em `Run workflow`

3. **Verificar logs detalhados**:
   - No GitHub Actions, expandir cada step
   - Procurar por mensagens de erro específicas

## 📚 Arquivos Criados/Modificados

- ✅ `.github/workflows/test-with-kind.yml` - Novo workflow com Kind
- ✅ `.github/workflows/fix-kind-connection.yml` - Workflow de diagnóstico  
- ✅ `setup-kind-cluster.sh` - Script local melhorado
- ✅ `GITHUB_ACTIONS_KIND_SOLUTION.md` - Este documento

A solução está implementada e deve resolver o problema de conexão no GitHub Actions! 🎉