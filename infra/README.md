# Terraform Infrastructure - Tech Challenge FIAP

Este diretório contém a infraestrutura como código (IaC) para provisionamento do cluster Kubernetes e banco de dados PostgreSQL para o projeto Tech Challenge FIAP.

## 📁 Estrutura de Diretórios

```
terraform/
├── README.md                    # Este arquivo
├── modules/                     # Módulos Terraform reutilizáveis
│   ├── k8s-cluster/            # Módulo para cluster Kubernetes
│   ├── database/               # Módulo para banco de dados PostgreSQL
│   └── networking/             # Módulo para configuração de rede
├── environments/               # Configurações por ambiente
│   ├── local/                  # Ambiente local (kind/minikube)
│   └── aws/                    # Ambiente AWS (EKS)
└── scripts/                    # Scripts auxiliares
```

## 🚀 Recursos Provisionados

### 1. Cluster Kubernetes
- **Local**: Configuração para Kind ou Minikube
- **AWS**: Amazon EKS com node groups gerenciados
- Configuração de RBAC
- Service accounts
- Ingress controller (nginx)

### 2. Banco de Dados
- **Local**: PostgreSQL em container no cluster
- **AWS**: Amazon RDS PostgreSQL
- Configuração de backups automáticos
- Monitoramento básico

### 3. Networking
- VPC e subnets (AWS)
- Security groups
- Load balancers
- Ingress rules

## 📋 Pré-requisitos

### Ferramentas Necessárias
- [Terraform](https://www.terraform.io/downloads) >= 1.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Docker](https://docs.docker.com/get-docker/)

### Para Ambiente Local
- [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/) ou [Minikube](https://minikube.sigs.k8s.io/docs/start/)

### Para Ambiente AWS
- [AWS CLI](https://aws.amazon.com/cli/) configurado
- Credenciais AWS com permissões adequadas
- [eksctl](https://eksctl.io/installation/) (opcional)

## 🛠️ Como Aplicar

### Ambiente Local

1. **Inicializar Terraform**:
```bash
cd terraform/environments/local
terraform init
```

2. **Planejar a infraestrutura**:
```bash
terraform plan
```

3. **Aplicar a infraestrutura**:
```bash
terraform apply
```

4. **Configurar kubectl** (após a aplicação):
```bash
# Para Kind
kind get kubeconfig --name workshop-cluster > ~/.kube/config

# Para Minikube
minikube update-context
```

### Ambiente AWS

1. **Configurar credenciais AWS**:
```bash
aws configure
```

2. **Inicializar Terraform**:
```bash
cd terraform/environments/aws
terraform init
```

3. **Revisar e ajustar variáveis** em `terraform.tfvars`:
```hcl
region = "us-west-2"
cluster_name = "workshop-eks-cluster"
node_instance_type = "t3.medium"
# ... outras variáveis
```

4. **Planejar a infraestrutura**:
```bash
terraform plan
```

5. **Aplicar a infraestrutura**:
```bash
terraform apply
```

6. **Configurar kubectl**:
```bash
aws eks update-kubeconfig --region us-west-2 --name workshop-eks-cluster
```

## 🔧 Configuração da Aplicação

Após provisionar a infraestrutura, você pode aplicar os manifestos Kubernetes:

```bash
# Voltar para o diretório raiz do projeto
cd ../../../

# Aplicar os manifestos
kubectl apply -f k8s/
```

## 📊 Verificação da Infraestrutura

### Verificar Cluster
```bash
kubectl cluster-info
kubectl get nodes
kubectl get namespaces
```

### Verificar Banco de Dados
```bash
# Para ambiente local
kubectl get pods -n workshop-app | grep postgres

# Para ambiente AWS (RDS)
aws rds describe-db-instances --query 'DBInstances[0].{Status:DBInstanceStatus,Endpoint:Endpoint.Address}'
```

## 🧹 Limpeza dos Recursos

### Ambiente Local
```bash
cd terraform/environments/local
terraform destroy
```

### Ambiente AWS
```bash
cd terraform/environments/aws
terraform destroy
```

## 🔒 Segurança

### Variáveis Sensíveis
- Use `terraform.tfvars` para variáveis específicas do ambiente
- Nunca commite credenciais no repositório
- Use AWS Secrets Manager ou Kubernetes Secrets para dados sensíveis

### Exemplo de `terraform.tfvars`:
```hcl
# Não commitar este arquivo!
db_password = "senha-super-secreta"
admin_users = ["usuario@empresa.com"]
```

## 📈 Monitoramento

### Logs
```bash
# Logs da aplicação
kubectl logs -f deployment/workshop-app-deployment -n workshop-app

# Logs do PostgreSQL
kubectl logs -f deployment/postgres-deployment -n workshop-app
```

### Métricas
- HPA configurado para escalonamento automático
- Recursos monitorados via kubectl top

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de permissões AWS**:
   - Verifique as credenciais: `aws sts get-caller-identity`
   - Confirme as permissões IAM necessárias

2. **Cluster não responde**:
   - Verifique o contexto: `kubectl config current-context`
   - Teste conectividade: `kubectl cluster-info`

3. **Pods não iniciam**:
   - Verifique recursos: `kubectl describe pod <pod-name>`
   - Verifique logs: `kubectl logs <pod-name>`

### Comandos Úteis
```bash
# Ver estado do Terraform
terraform state list
terraform state show <resource>

# Refresh do estado
terraform refresh

# Importar recursos existentes
terraform import <resource-type>.<name> <resource-id>
```

## 🤝 Contribuição

Para contribuir com melhorias na infraestrutura:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Teste localmente com `terraform plan`
4. Submeta um Pull Request

## 📝 Notas de Versão

- **v1.0**: Configuração inicial para ambientes local e AWS
- Suporte para PostgreSQL local e RDS
- Configuração básica de segurança e monitoramento