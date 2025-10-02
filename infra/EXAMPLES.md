# Exemplos de Uso - Terraform Infrastructure

Este documento fornece exemplos práticos de como usar a infraestrutura Terraform do Tech Challenge FIAP.

## 🚀 Início Rápido

### 1. Ambiente Local (Desenvolvimento)

```bash
# 1. Clone o repositório
git clone <repository-url>
cd tech-challenge-FIAP/terraform

# 2. Verifique os pré-requisitos
make check-prereqs

# 3. Deploy completo do ambiente de desenvolvimento
make dev-setup

# 4. Acesse a aplicação
make port-forward-local
# Visite: http://localhost:8080
```

### 2. Ambiente AWS (Produção)

```bash
# 1. Configure as credenciais AWS
aws configure

# 2. Copie e edite as variáveis
cd environments/aws
cp terraform.tfvars.example terraform.tfvars
# Edite terraform.tfvars com suas configurações

# 3. Deploy da infraestrutura
make aws-deploy

# 4. Deploy da aplicação
make aws-app

# 5. Obtenha informações de acesso
make aws-output
```

## 📋 Cenários de Uso

### Cenário 1: Desenvolvimento Local

**Objetivo**: Configurar um ambiente local para desenvolvimento e testes.

```bash
# Passo a passo detalhado
cd terraform

# 1. Validar configurações
make validate

# 2. Planejar deployment
make local-plan

# 3. Aplicar infraestrutura
make local-deploy

# 4. Configurar kubectl
make local-configure

# 5. Deploy da aplicação
make local-app

# 6. Verificar saúde do cluster
make local-health

# 7. Conectar ao banco de dados
make db-connect-local

# 8. Ver logs da aplicação
make logs-local
```

**Resultado Esperado**:
- Cluster Kind com 3 nós
- PostgreSQL em pod
- Namespace `workshop-app` configurado
- Aplicação rodando e acessível via port-forward

### Cenário 2: Ambiente de Staging na AWS

**Objetivo**: Criar um ambiente de staging com recursos otimizados para custo.

```bash
# 1. Preparar configuração para staging
cd environments/aws
cp terraform.tfvars.example terraform.tfvars

# Editar terraform.tfvars para staging:
cat > terraform.tfvars << EOF
# Staging Configuration
environment = "staging"
cluster_name = "workshop-staging-cluster"

# Configuração econômica
node_instance_types = ["t3.small"]
node_desired_size = 1
node_max_size = 2
node_min_size = 1
node_capacity_type = "SPOT"  # Usar Spot instances

# Database econômico
db_instance_class = "db.t3.micro"
db_allocated_storage = 20
multi_az = false
backup_retention_period = 3

# Security settings para staging
deletion_protection = false
skip_final_snapshot = true

# Networking
region = "us-east-1"  # Região mais barata
EOF

# 2. Deploy
cd ../..
make aws-deploy

# 3. Deploy da aplicação
make aws-app

# 4. Configurar monitoramento básico
./scripts/post-deploy.sh monitor aws
```

### Cenário 3: Ambiente de Produção na AWS

**Objetivo**: Configurar um ambiente de produção com alta disponibilidade.

```bash
# 1. Configuração de produção
cd environments/aws
cat > terraform.tfvars << EOF
# Production Configuration
environment = "production"
cluster_name = "workshop-prod-cluster"
owner = "production-team"

# Configuração para alta disponibilidade
node_instance_types = ["t3.medium", "t3.large"]
node_desired_size = 3
node_max_size = 6
node_min_size = 2
node_capacity_type = "ON_DEMAND"

# Database com alta disponibilidade
db_instance_class = "db.t3.small"
db_allocated_storage = 100
db_max_allocated_storage = 500
multi_az = true
backup_retention_period = 30

# Security settings para produção
deletion_protection = true
skip_final_snapshot = false
storage_encrypted = true

# Network redundante
private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnet_cidrs = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
database_subnet_cidrs = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
EOF

# 2. Deploy com validação
cd ../..
make aws-plan  # Revisar o plano
make aws-deploy

# 3. Configuração completa da aplicação
make aws-app

# 4. Verificar segurança
./scripts/post-deploy.sh health aws
```

### Cenário 4: Multi-ambiente (Dev, Staging, Prod)

**Objetivo**: Gerenciar múltiplos ambientes simultaneamente.

```bash
# Estrutura de diretórios
terraform/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/

# 1. Deploy de desenvolvimento
make local-deploy  # ou dev-setup

# 2. Deploy de staging
cd environments/staging  # assumindo que você criou este diretório
cp ../aws/* .
# Editar variáveis para staging
terraform init
terraform apply

# 3. Deploy de produção
cd ../prod  # assumindo que você criou este diretório  
cp ../aws/* .
# Editar variáveis para produção
terraform init
terraform apply
```

## 🔧 Casos de Uso Específicos

### Migração de Dados

```bash
# 1. Backup do ambiente local
kubectl exec -n workshop-app deployment/postgres-deployment -- \
  pg_dump -U postgres workshop_db > backup.sql

# 2. Restore no ambiente AWS
kubectl create secret generic db-backup \
  --from-file=backup.sql=backup.sql \
  -n workshop-app

# 3. Job para restore
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: db-restore
  namespace: workshop-app
spec:
  template:
    spec:
      containers:
      - name: restore
        image: postgres:15-alpine
        command: ["/bin/sh", "-c"]
        args:
          - "psql \$DATABASE_URL < /backup/backup.sql"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: workshop-app-secrets
              key: DATABASE_URL
        volumeMounts:
        - name: backup
          mountPath: /backup
      volumes:
      - name: backup
        secret:
          secretName: db-backup
      restartPolicy: Never
EOF
```

### Scaling Automático

```bash
# 1. Configurar HPA para a aplicação
kubectl apply -f - <<EOF
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: workshop-app-hpa
  namespace: workshop-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: workshop-app-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF

# 2. Configurar VPA (Vertical Pod Autoscaler)
kubectl apply -f - <<EOF
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: workshop-app-vpa
  namespace: workshop-app
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: workshop-app-deployment
  updatePolicy:
    updateMode: "Auto"
EOF
```

### Monitoramento Avançado

```bash
# 1. Deploy do Prometheus Stack (se não estiver instalado)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# 2. Configurar ServiceMonitor para a aplicação
kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: workshop-app-metrics
  namespace: workshop-app
spec:
  selector:
    matchLabels:
      app: workshop-app
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
EOF

# 3. Dashboard Grafana personalizado
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: workshop-dashboard
  namespace: monitoring
  labels:
    grafana_dashboard: "1"
data:
  workshop-app.json: |
    {
      "dashboard": {
        "title": "Workshop App Dashboard",
        "panels": [
          {
            "title": "Request Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "rate(http_requests_total[5m])",
                "legendFormat": "{{method}} {{status}}"
              }
            ]
          }
        ]
      }
    }
EOF
```

### Backup e Restore Automático

```bash
# 1. CronJob para backup automático (AWS)
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: CronJob
metadata:
  name: db-backup
  namespace: workshop-app
spec:
  schedule: "0 2 * * *"  # Todo dia às 2h
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: amazon/aws-cli:latest
            command: ["/bin/sh"]
            args:
              - -c
              - |
                # Backup do RDS via snapshot
                aws rds create-db-snapshot \
                  --db-instance-identifier \$(DB_INSTANCE_ID) \
                  --db-snapshot-identifier workshop-backup-\$(date +%Y%m%d-%H%M%S)
            env:
            - name: AWS_DEFAULT_REGION
              value: "us-west-2"
            - name: DB_INSTANCE_ID
              value: "workshop-eks-cluster-postgresql"
          restartPolicy: OnFailure
EOF
```

### Blue-Green Deployment

```bash
# 1. Deploy da versão "blue" (atual)
kubectl apply -f k8s/ -n workshop-app

# 2. Preparar versão "green" (nova)
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: workshop-app-green
  namespace: workshop-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: workshop-app
      version: green
  template:
    metadata:
      labels:
        app: workshop-app
        version: green
    spec:
      containers:
      - name: workshop-app
        image: workshop-app:v2.0.0  # Nova versão
        ports:
        - containerPort: 3000
EOF

# 3. Testar a versão green
kubectl port-forward service/workshop-app-green-service 8081:80 -n workshop-app

# 4. Switchar tráfego (atualizar service selector)
kubectl patch service workshop-app-service -n workshop-app \
  -p '{"spec":{"selector":{"version":"green"}}}'

# 5. Remover versão antiga após validação
kubectl delete deployment workshop-app-blue -n workshop-app
```

## 🔍 Troubleshooting

### Debug de Problemas Comuns

```bash
# 1. Pods não iniciam
kubectl describe pod <pod-name> -n workshop-app
kubectl logs <pod-name> -n workshop-app

# 2. Problemas de rede
kubectl exec -it <pod-name> -n workshop-app -- nslookup kubernetes.default
kubectl exec -it <pod-name> -n workshop-app -- curl -I http://kubernetes.default

# 3. Problemas de banco de dados
kubectl exec -it deployment/postgres-deployment -n workshop-app -- \
  psql -U postgres -d workshop_db -c "SELECT version();"

# 4. Verificar recursos
kubectl top nodes
kubectl top pods -n workshop-app

# 5. Eventos do cluster
kubectl get events -n workshop-app --sort-by='.lastTimestamp'
```

### Comandos de Diagnóstico

```bash
# Verificar certificados
kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' | base64 -d | openssl x509 -text

# Verificar conectividade com API server
kubectl cluster-info dump

# Verificar configuração do CNI
kubectl describe daemonset aws-node -n kube-system

# Verificar logs do sistema
kubectl logs -n kube-system -l k8s-app=aws-load-balancer-controller
```

## 📊 Monitoramento e Alertas

### CloudWatch Dashboards (AWS)

```bash
# Criar dashboard personalizado
aws cloudwatch put-dashboard \
  --dashboard-name "WorkshopApp" \
  --dashboard-body file://dashboard.json
```

### Grafana Queries

```promql
# Taxa de requisições
rate(http_requests_total[5m])

# Latência P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Uso de CPU por pod
rate(container_cpu_usage_seconds_total[5m]) * 100

# Uso de memória
container_memory_usage_bytes / container_spec_memory_limit_bytes * 100
```

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2
    
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v2
    
    - name: Terraform Plan
      run: |
        cd terraform/environments/aws
        terraform init
        terraform plan
    
    - name: Terraform Apply
      if: github.ref == 'refs/heads/main'
      run: |
        cd terraform/environments/aws
        terraform apply -auto-approve
```

Estes exemplos cobrem os principais cenários de uso da infraestrutura. Cada exemplo pode ser adaptado conforme suas necessidades específicas.