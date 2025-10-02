# ⚡ Quick Deploy Checklist - Workshop App

## 🚀 Deploy Rápido (5 minutos)

### 1. Pré-requisitos ✅
```bash
# Verificar cluster
kubectl cluster-info

# Verificar metrics server (necessário para HPA)
kubectl top nodes
```

### 2. Configurar Secrets 🔐
```bash
# IMPORTANTE: Substitua pelos valores reais!
kubectl create secret generic workshop-app-secrets \
  --from-literal=DATABASE_URL="postgresql://user:password@postgres-service:5432/workshop_db" \
  --from-literal=JWT_SECRET="seu-jwt-secret-aqui" \
  --from-literal=DB_USER="user" \
  --from-literal=DB_PASSWORD="password" \
  --from-literal=EXTERNAL_API_TOKEN="seu-token-aqui" \
  -n workshop-app --dry-run=client -o yaml | kubectl apply -f -
```

### 3. Deploy Automático 🎯
```bash
# Executar script de deploy
./k8s/deploy.sh
```

### 4. Verificar Status 📊
```bash
# Aguardar pods ficarem prontos
kubectl get pods -n workshop-app -w

# Verificar HPA
kubectl get hpa -n workshop-app
```

### 5. Acessar Aplicação 🌐
```bash
# Port forward para teste local
kubectl port-forward service/workshop-app-service 8080:80 -n workshop-app

# Abrir: http://localhost:8080
```

---

## 📋 Checklist Detalhado

### Pré-Deploy
- [ ] Kubernetes cluster ativo
- [ ] kubectl configurado
- [ ] Metrics Server funcionando
- [ ] Imagem Docker no registry
- [ ] Valores dos secrets definidos

### Deploy
- [ ] Secrets criados com valores reais
- [ ] Script de deploy executado
- [ ] Todos os pods em Running
- [ ] HPA configurado e ativo
- [ ] Aplicação respondendo

### Pós-Deploy
- [ ] Health checks OK
- [ ] Logs sem erros críticos
- [ ] Auto-scaling testado
- [ ] Acesso externo funcionando

---

## 🆘 Comandos de Emergência

### Status Rápido
```bash
kubectl get all -n workshop-app
```

### Logs em Tempo Real
```bash
kubectl logs -f deployment/workshop-app-deployment -n workshop-app
```

### Reiniciar Deployment
```bash
kubectl rollout restart deployment/workshop-app-deployment -n workshop-app
```

### Escalar Manualmente
```bash
kubectl scale deployment workshop-app-deployment --replicas=5 -n workshop-app
```

### Limpeza Completa
```bash
kubectl delete namespace workshop-app
```

---

## 📈 Monitoramento Contínuo

### HPA Status
```bash
watch kubectl get hpa -n workshop-app
```

### Pods e Recursos
```bash
watch kubectl top pods -n workshop-app
```

### Eventos Recentes
```bash
kubectl get events -n workshop-app --sort-by='.lastTimestamp' | tail -10
```

---

**⏱️ Tempo estimado de deploy: 3-5 minutos**

**🎯 Para documentação completa, consulte: `KUBERNETES_DEPLOY_GUIDE.md`**