# 🚀 Guia de Deploy Kubernetes - Workshop App

Esta documentação fornece um guia completo para fazer o deploy da aplicação Workshop App no Kubernetes, incluindo todos os manifestos criados e instruções passo a passo.

## 📋 Índice

- [Resumo dos Manifestos](#-resumo-dos-manifestos)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração Inicial](#-configuração-inicial)
- [Deploy Passo a Passo](#-deploy-passo-a-passo)
- [Verificação do Deploy](#-verificação-do-deploy)
- [Acesso à Aplicação](#-acesso-à-aplicação)
- [Monitoramento e Troubleshooting](#-monitoramento-e-troubleshooting)
- [Limpeza do Ambiente](#-limpeza-do-ambiente)

## 📦 Resumo dos Manifestos

### 🏗️ **Deployments e Workloads**

| Arquivo | Descrição | Recursos |
|---------|-----------|----------|
| `namespace.yaml` | Namespace dedicado para isolamento | Namespace: `workshop-app` |
| `deployment.yaml` | Deployment principal da aplicação | 3 réplicas, health checks, resource limits |
| `postgres.yaml` | PostgreSQL para desenvolvimento | 1 réplica, persistent volume, init scripts |

### 🌐 **Networking e Exposição**

| Arquivo | Descrição | Tipo |
|---------|-----------|------|
| `service.yaml` | Exposição da aplicação | ClusterIP + LoadBalancer |
| `ingress.yaml` | Roteamento externo com SSL | NGINX Ingress com TLS |
| `network-policy.yaml` | Políticas de segurança de rede | Ingress/Egress rules |

### ⚙️ **Configuração e Secrets**

| Arquivo | Descrição | Conteúdo |
|---------|-----------|----------|
| `configmap.yaml` | Configurações não-sensíveis | PORT, NODE_ENV, DB_HOST, etc. |
| `secret.yaml` | Variáveis sensíveis | DATABASE_URL, JWT_SECRET, credenciais |

### 📈 **Escalabilidade e Performance**

| Arquivo | Descrição | Configuração |
|---------|-----------|--------------|
| `hpa.yaml` | Auto-scaling horizontal | CPU: 70%, Memory: 80%, Min: 2, Max: 10 |

### 🛠️ **Utilitários**

| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| `deploy.sh` | Script automatizado de deploy | Execução: `./k8s/deploy.sh` |
| `kustomization.yaml` | Organização com Kustomize | `kubectl apply -k k8s/` |
| `README.md` | Documentação técnica detalhada | Referência completa |

## 🔧 Pré-requisitos

### Ferramentas Necessárias

```bash
# Verificar se kubectl está instalado
kubectl version --client

# Verificar conexão com o cluster
kubectl cluster-info

# Verificar se o Metrics Server está funcionando (necessário para HPA)
kubectl top nodes
```

### Requisitos do Cluster

- ✅ Kubernetes 1.20+
- ✅ Metrics Server instalado
- ✅ NGINX Ingress Controller (opcional)
- ✅ Cert-Manager (opcional, para SSL)
- ✅ Storage Class configurado

### Verificar Requisitos

```bash
# Verificar Metrics Server
kubectl get deployment metrics-server -n kube-system

# Verificar NGINX Ingress
kubectl get pods -n ingress-nginx

# Verificar Storage Classes disponíveis
kubectl get storageclass
```

## 🔐 Configuração Inicial

### 1. Configurar Secrets

**⚠️ IMPORTANTE**: Configure os secrets com valores reais antes do deploy:

```bash
# Navegar para o diretório do projeto
cd /Users/zar2ca/repositorios/tech-challenge-FIAP

# Criar secrets com valores reais (substitua pelos seus valores)
kubectl create secret generic workshop-app-secrets \
  --from-literal=DATABASE_URL="postgresql://seu_usuario:sua_senha@postgres-service:5432/workshop_db" \
  --from-literal=JWT_SECRET="seu-jwt-secret-super-seguro-aqui" \
  --from-literal=DB_USER="seu_usuario_db" \
  --from-literal=DB_PASSWORD="sua_senha_db" \
  --from-literal=EXTERNAL_API_TOKEN="seu-token-api-externa" \
  --dry-run=client -o yaml > k8s/secrets-real.yaml

# Aplicar o secret
kubectl apply -f k8s/secrets-real.yaml
```

### 2. Configurar Imagem Docker

```bash
# Build da imagem (se necessário)
docker build -t workshop-app:v1.0.0 .

# Tag para registry (substitua pelo seu registry)
docker tag workshop-app:v1.0.0 seu-registry/workshop-app:v1.0.0

# Push para registry
docker push seu-registry/workshop-app:v1.0.0
```

### 3. Atualizar Deployment

Edite o arquivo `k8s/deployment.yaml` para usar sua imagem:

```yaml
containers:
- name: workshop-app
  image: seu-registry/workshop-app:v1.0.0  # Atualize aqui
```

## 🚀 Deploy Passo a Passo

### Método 1: Deploy Automatizado (Recomendado)

```bash
# Tornar o script executável (já feito)
chmod +x k8s/deploy.sh

# Executar o deploy
./k8s/deploy.sh
```

### Método 2: Deploy Manual

```bash
# Passo 1: Criar namespace
kubectl apply -f k8s/namespace.yaml
echo "✅ Namespace criado"

# Passo 2: Aplicar configurações
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
echo "✅ Configurações aplicadas"

# Passo 3: Deploy PostgreSQL
kubectl apply -f k8s/postgres.yaml
echo "✅ PostgreSQL em deploy..."

# Aguardar PostgreSQL ficar pronto
kubectl wait --for=condition=ready pod -l app=postgres -n workshop-app --timeout=300s
echo "✅ PostgreSQL pronto"

# Passo 4: Deploy da aplicação
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
echo "✅ Aplicação em deploy..."

# Aguardar aplicação ficar pronta
kubectl wait --for=condition=available deployment/workshop-app-deployment -n workshop-app --timeout=300s
echo "✅ Aplicação pronta"

# Passo 5: Configurar auto-scaling
kubectl apply -f k8s/hpa.yaml
echo "✅ HPA configurado"

# Passo 6: Aplicar políticas de segurança
kubectl apply -f k8s/network-policy.yaml
echo "✅ Network Policies aplicadas"

# Passo 7: Configurar ingress (opcional)
kubectl apply -f k8s/ingress.yaml
echo "✅ Ingress configurado"
```

### Método 3: Deploy com Kustomize

```bash
# Deploy usando Kustomize
kubectl apply -k k8s/

# Verificar status
kubectl get all -n workshop-app
```

## ✅ Verificação do Deploy

### 1. Verificar Status dos Pods

```bash
# Ver todos os recursos
kubectl get all -n workshop-app

# Ver pods detalhadamente
kubectl get pods -n workshop-app -o wide

# Ver logs da aplicação
kubectl logs -f deployment/workshop-app-deployment -n workshop-app
```

### 2. Verificar HPA

```bash
# Status do HPA
kubectl get hpa -n workshop-app

# Detalhes do HPA
kubectl describe hpa workshop-app-hpa -n workshop-app

# Métricas dos pods
kubectl top pods -n workshop-app
```

### 3. Verificar Conectividade

```bash
# Testar conectividade interna
kubectl exec -it deployment/workshop-app-deployment -n workshop-app -- curl http://localhost:3000

# Testar conectividade com PostgreSQL
kubectl exec -it deployment/workshop-app-deployment -n workshop-app -- nc -zv postgres-service 5432
```

## 🌐 Acesso à Aplicação

### Método 1: Port Forward (Desenvolvimento)

```bash
# Port forward para acesso local
kubectl port-forward service/workshop-app-service 8080:80 -n workshop-app

# Acessar em: http://localhost:8080
```

### Método 2: LoadBalancer

```bash
# Obter IP externo
kubectl get service workshop-app-loadbalancer -n workshop-app

# Aguardar EXTERNAL-IP ser atribuído
kubectl get service workshop-app-loadbalancer -n workshop-app --watch
```

### Método 3: Ingress

```bash
# Verificar ingress
kubectl get ingress -n workshop-app

# Configurar DNS apontando para o IP do Ingress Controller
# Acessar em: https://workshop-app.seudominio.com
```

## 📊 Monitoramento e Troubleshooting

### Comandos Úteis de Monitoramento

```bash
# Status geral
kubectl get all -n workshop-app

# Eventos recentes
kubectl get events -n workshop-app --sort-by='.lastTimestamp'

# Logs em tempo real
kubectl logs -f deployment/workshop-app-deployment -n workshop-app

# Métricas de recursos
kubectl top pods -n workshop-app
kubectl top nodes

# Status do HPA
watch kubectl get hpa -n workshop-app
```

### Troubleshooting Comum

#### Pod não inicia

```bash
# Descrever pod para ver eventos
kubectl describe pod <pod-name> -n workshop-app

# Ver logs do pod
kubectl logs <pod-name> -n workshop-app

# Entrar no pod para debug
kubectl exec -it <pod-name> -n workshop-app -- /bin/sh
```

#### Problemas de Conectividade

```bash
# Testar DNS interno
kubectl exec -it <pod-name> -n workshop-app -- nslookup postgres-service

# Testar conectividade de rede
kubectl exec -it <pod-name> -n workshop-app -- telnet postgres-service 5432

# Verificar network policies
kubectl describe networkpolicy -n workshop-app
```

#### HPA não funciona

```bash
# Verificar Metrics Server
kubectl get pods -n kube-system | grep metrics-server

# Verificar métricas disponíveis
kubectl top nodes
kubectl top pods -n workshop-app

# Debug do HPA
kubectl describe hpa workshop-app-hpa -n workshop-app
```

#### Problemas com Secrets

```bash
# Verificar se secrets existem
kubectl get secrets -n workshop-app

# Ver conteúdo dos secrets (base64 encoded)
kubectl get secret workshop-app-secrets -n workshop-app -o yaml

# Recriar secrets se necessário
kubectl delete secret workshop-app-secrets -n workshop-app
# Recriar conforme instruções na seção "Configuração Inicial"
```

## 🧪 Teste de Carga para HPA

Para testar o auto-scaling:

```bash
# Criar pod de teste
kubectl run -i --tty load-generator --rm --image=busybox --restart=Never -- /bin/sh

# Dentro do pod, gerar carga
while true; do wget -q -O- http://workshop-app-service.workshop-app.svc.cluster.local; done
```

Em outro terminal, monitore o HPA:

```bash
watch kubectl get hpa -n workshop-app
watch kubectl get pods -n workshop-app
```

## 📈 Escalabilidade Manual

```bash
# Escalar manualmente
kubectl scale deployment workshop-app-deployment --replicas=5 -n workshop-app

# Verificar status
kubectl get pods -n workshop-app

# Voltar para auto-scaling
kubectl scale deployment workshop-app-deployment --replicas=3 -n workshop-app
```

## 🔄 Atualizações da Aplicação

### Rolling Update

```bash
# Atualizar imagem
kubectl set image deployment/workshop-app-deployment workshop-app=workshop-app:v1.1.0 -n workshop-app

# Acompanhar rollout
kubectl rollout status deployment/workshop-app-deployment -n workshop-app

# Verificar histórico
kubectl rollout history deployment/workshop-app-deployment -n workshop-app
```

### Rollback

```bash
# Rollback para versão anterior
kubectl rollout undo deployment/workshop-app-deployment -n workshop-app

# Rollback para versão específica
kubectl rollout undo deployment/workshop-app-deployment --to-revision=2 -n workshop-app
```

## 🧹 Limpeza do Ambiente

### Remoção Completa

```bash
# Remover tudo do namespace
kubectl delete namespace workshop-app

# Ou remover recursos específicos
kubectl delete -f k8s/
```

### Remoção Seletiva

```bash
# Remover apenas a aplicação (manter PostgreSQL)
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/service.yaml
kubectl delete -f k8s/hpa.yaml

# Remover apenas ingress
kubectl delete -f k8s/ingress.yaml
```

## 📝 Checklist de Deploy

### Pré-Deploy
- [ ] Cluster Kubernetes funcionando
- [ ] kubectl configurado
- [ ] Metrics Server instalado
- [ ] Imagem Docker disponível no registry
- [ ] Secrets configurados com valores reais
- [ ] DNS configurado (se usando Ingress)

### Durante o Deploy
- [ ] Namespace criado
- [ ] ConfigMaps aplicados
- [ ] Secrets aplicados
- [ ] PostgreSQL rodando
- [ ] Aplicação deployada
- [ ] Services criados
- [ ] HPA configurado
- [ ] Network Policies aplicadas

### Pós-Deploy
- [ ] Pods rodando corretamente
- [ ] Health checks passando
- [ ] HPA funcionando
- [ ] Aplicação acessível
- [ ] Logs sem erros
- [ ] Métricas sendo coletadas

## 🔗 Recursos Úteis

- [Documentação oficial do Kubernetes](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)

## 🆘 Suporte

Em caso de problemas:

1. Verifique os logs: `kubectl logs -f deployment/workshop-app-deployment -n workshop-app`
2. Verifique eventos: `kubectl get events -n workshop-app --sort-by='.lastTimestamp'`
3. Verifique recursos: `kubectl top pods -n workshop-app`
4. Consulte a documentação técnica em `k8s/README.md`

---

**🎉 Parabéns! Sua aplicação Workshop App está pronta para produção no Kubernetes!**