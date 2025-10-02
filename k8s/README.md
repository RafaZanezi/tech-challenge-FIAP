# Kubernetes Deployment Guide

Este diretório contém todos os manifestos YAML necessários para fazer o deploy da aplicação Workshop App no Kubernetes.

## 📋 Pré-requisitos

- Kubernetes cluster funcionando (local ou na nuvem)
- `kubectl` configurado para acessar o cluster
- Metrics Server instalado no cluster (para HPA funcionar)
- NGINX Ingress Controller (opcional, para ingress)

## 🗂️ Estrutura dos Manifestos

### Arquivos Principais

1. **`namespace.yaml`** - Cria o namespace `workshop-app`
2. **`configmap.yaml`** - Configurações não-sensíveis da aplicação
3. **`secret.yaml`** - Variáveis sensíveis (senhas, tokens, etc.)
4. **`deployment.yaml`** - Deployment da aplicação principal
5. **`service.yaml`** - Services para exposição da aplicação
6. **`hpa.yaml`** - Horizontal Pod Autoscaler
7. **`postgres.yaml`** - PostgreSQL para desenvolvimento/teste
8. **`ingress.yaml`** - Ingress para acesso externo (opcional)
9. **`network-policy.yaml`** - Políticas de rede para segurança

## 🚀 Deploy Rápido

```bash
# Execute o script de deploy
./k8s/deploy.sh

# Ou aplique manualmente na ordem:
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/network-policy.yaml
kubectl apply -f k8s/ingress.yaml
```

## 🔐 Configuração de Secrets

**IMPORTANTE**: Antes do deploy, você deve configurar os secrets com valores reais:

```bash
# Deletar o secret de exemplo
kubectl delete secret workshop-app-secrets -n workshop-app

# Criar secret com valores reais
kubectl create secret generic workshop-app-secrets \
  --from-literal=DATABASE_URL="postgresql://user:password@postgres-service:5432/workshop_db" \
  --from-literal=JWT_SECRET="your-actual-jwt-secret" \
  --from-literal=DB_USER="your-db-user" \
  --from-literal=DB_PASSWORD="your-db-password" \
  --from-literal=EXTERNAL_API_TOKEN="your-external-api-token" \
  -n workshop-app
```

## 📊 Horizontal Pod Autoscaler (HPA)

O HPA está configurado para:
- **Mínimo**: 2 replicas
- **Máximo**: 10 replicas
- **CPU threshold**: 70% de utilização
- **Memory threshold**: 80% de utilização

### Verificar status do HPA:
```bash
kubectl get hpa -n workshop-app
kubectl describe hpa workshop-app-hpa -n workshop-app
```

## 🏗️ Recursos e Limites

Cada pod da aplicação está configurado com:
- **Requests**: 256Mi RAM, 250m CPU
- **Limits**: 512Mi RAM, 500m CPU

## 🔍 Monitoramento e Logs

```bash
# Ver status dos pods
kubectl get pods -n workshop-app

# Ver logs da aplicação
kubectl logs -f deployment/workshop-app-deployment -n workshop-app

# Ver status do HPA
kubectl get hpa -n workshop-app

# Ver eventos do namespace
kubectl get events -n workshop-app --sort-by='.lastTimestamp'
```

## 🌐 Acesso à Aplicação

### Acesso Local (Port Forward)
```bash
kubectl port-forward service/workshop-app-service 8080:80 -n workshop-app
# Acesse: http://localhost:8080
```

### Acesso via LoadBalancer
```bash
kubectl get service workshop-app-loadbalancer -n workshop-app
# Use o EXTERNAL-IP retornado
```

### Acesso via Ingress
Configure o DNS para apontar `workshop-app.yourdomain.com` para o IP do Ingress Controller:
```bash
kubectl get ingress -n workshop-app
```

## 🐘 PostgreSQL

Para ambientes de **desenvolvimento/teste**, o PostgreSQL está incluído. Para **produção**, recomenda-se usar:
- Amazon RDS
- Google Cloud SQL
- Azure Database for PostgreSQL
- Ou um operador PostgreSQL como o CloudNativePG

## 🔒 Segurança

### Network Policies
As políticas de rede estão configuradas para:
- Permitir tráfego entre pods da aplicação e PostgreSQL
- Permitir tráfego do Ingress Controller
- Bloquear tráfego não autorizado

### Security Context
Os pods executam com:
- Usuário não-root (UID 1000)
- Sistema de arquivos somente leitura
- Sem privilégios elevados

## 🧹 Limpeza

```bash
# Remover todos os recursos
kubectl delete namespace workshop-app

# Ou remover individualmente
kubectl delete -f k8s/
```

## 📈 Escalabilidade

### Manual
```bash
kubectl scale deployment workshop-app-deployment --replicas=5 -n workshop-app
```

### Automática
O HPA ajustará automaticamente baseado na utilização de CPU e memória.

## 🛠️ Troubleshooting

### Pod não inicia
```bash
kubectl describe pod <pod-name> -n workshop-app
kubectl logs <pod-name> -n workshop-app
```

### Problemas de conectividade
```bash
kubectl exec -it <pod-name> -n workshop-app -- nslookup postgres-service
kubectl exec -it <pod-name> -n workshop-app -- telnet postgres-service 5432
```

### HPA não funciona
```bash
# Verificar se o Metrics Server está funcionando
kubectl top nodes
kubectl top pods -n workshop-app

# Verificar métricas do HPA
kubectl describe hpa workshop-app-hpa -n workshop-app
```

## 📝 Notas Importantes

1. **Secrets**: Sempre use valores reais em produção, nunca commite secrets no git
2. **Imagem**: Atualize a tag da imagem no `deployment.yaml` conforme necessário
3. **Recursos**: Ajuste requests/limits baseado no seu ambiente
4. **Backup**: Configure backup do PostgreSQL em produção
5. **Monitoramento**: Considere usar Prometheus + Grafana para monitoramento avançado