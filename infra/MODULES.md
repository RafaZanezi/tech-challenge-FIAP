# Terraform Modules Documentation

Este documento descreve os módulos Terraform criados para o provisionamento da infraestrutura do Tech Challenge FIAP.

## 📋 Visão Geral dos Módulos

### 1. Módulo Networking (`modules/networking/`)

**Propósito**: Provisiona toda a infraestrutura de rede necessária para o ambiente AWS.

**Recursos Criados**:
- VPC com DNS habilitado
- Subnets públicas, privadas e de banco de dados
- Internet Gateway
- NAT Gateways (um por AZ)
- Route Tables e associações
- Security Groups para cluster, worker nodes e RDS
- Database Subnet Group

**Variáveis Principais**:
```hcl
vpc_cidr                = "10.0.0.0/16"
private_subnet_cidrs    = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnet_cidrs     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
database_subnet_cidrs   = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
```

**Outputs Importantes**:
- `vpc_id`: ID da VPC criada
- `public_subnet_ids`: IDs das subnets públicas
- `private_subnet_ids`: IDs das subnets privadas
- `database_subnet_group_name`: Nome do grupo de subnets do banco
- `*_security_group_id`: IDs dos security groups

### 2. Módulo K8s Cluster (`modules/k8s-cluster/`)

**Propósito**: Provisiona cluster Kubernetes tanto local (Kind) quanto AWS (EKS).

**Recursos Criados**:

**Para AWS (EKS)**:
- EKS Cluster com versão especificada
- EKS Node Group com auto-scaling
- IAM Roles e políticas para cluster e worker nodes
- EKS Add-ons (VPC CNI, CoreDNS, kube-proxy)
- CloudWatch Log Group para logs do cluster

**Para Local (Kind)**:
- Cluster Kind com configuração multi-node
- Nginx Ingress Controller
- Port mappings para acesso local

**Variáveis Principais**:
```hcl
cluster_name        = "workshop-cluster"
cluster_version     = "1.27"
deployment_type     = "aws" | "local"
node_instance_types = ["t3.medium"]
node_desired_size   = 2
node_max_size       = 4
node_min_size       = 1
```

**Outputs Importantes**:
- `cluster_name`: Nome do cluster
- `cluster_endpoint`: Endpoint do cluster
- `kubeconfig_command`: Comando para configurar kubectl
- `namespace_name`: Nome do namespace criado

### 3. Módulo Database (`modules/database/`)

**Propósito**: Provisiona banco de dados PostgreSQL tanto local quanto AWS.

**Recursos Criados**:

**Para AWS (RDS)**:
- RDS PostgreSQL com configurações otimizadas
- Parameter Group customizado
- Enhanced Monitoring com IAM Role
- CloudWatch Alarms (CPU, conexões)
- Performance Insights habilitado

**Para Local (Kubernetes)**:
- Deployment PostgreSQL no cluster
- Service ClusterIP
- PersistentVolumeClaim
- ConfigMap para scripts de inicialização

**Ambos os ambientes**:
- Kubernetes Secret com credenciais do banco
- ConfigMap com scripts de migração

**Variáveis Principais**:
```hcl
db_name               = "workshop_db"
db_username           = "postgres"
db_password           = "secure-password"
db_instance_class     = "db.t3.micro"
db_allocated_storage  = 20
backup_retention_period = 7
multi_az              = false
storage_encrypted     = true
```

**Outputs Importantes**:
- `db_instance_endpoint`: Endpoint do banco de dados
- `database_url`: URL completa de conexão
- `database_secret_name`: Nome do secret no Kubernetes

## 🏗️ Arquitetura da Infraestrutura

### Ambiente Local
```
┌─────────────────────────────────────────┐
│               Kind Cluster              │
│  ┌─────────────┐    ┌─────────────────┐ │
│  │ Control     │    │    Worker       │ │
│  │ Plane       │    │    Nodes        │ │
│  └─────────────┘    └─────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │         PostgreSQL Pod              │ │
│  │    (with PersistentVolume)          │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Ambiente AWS
```
┌─────────────────────────────────────────────────────────────┐
│                        AWS VPC                             │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Public Subnet  │  │  Public Subnet  │  │ Public Subnet│ │
│  │      AZ-a       │  │      AZ-b       │  │     AZ-c     │ │
│  │                 │  │                 │  │              │ │
│  │   NAT Gateway   │  │   NAT Gateway   │  │  NAT Gateway │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Private Subnet  │  │ Private Subnet  │  │Private Subnet│ │
│  │      AZ-a       │  │      AZ-b       │  │     AZ-c     │ │
│  │                 │  │                 │  │              │ │
│  │  EKS Workers    │  │  EKS Workers    │  │ EKS Workers  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  DB Subnet      │  │  DB Subnet      │  │  DB Subnet   │ │
│  │      AZ-a       │  │      AZ-b       │  │     AZ-c     │ │
│  │                 │  │                 │  │              │ │
│  │                 │  │   RDS Primary   │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │    EKS Cluster    │
                    │   Control Plane   │
                    └───────────────────┘
```

## 🔧 Configurações de Segurança

### Security Groups

1. **Cluster Security Group**:
   - Egress: Permite todo tráfego de saída
   - Usado pelo EKS Control Plane

2. **Worker Nodes Security Group**:
   - Ingress: Comunicação entre worker nodes (all ports)
   - Ingress: Do cluster (porta 1025-65535)
   - Ingress: HTTPS do cluster (porta 443)
   - Egress: Todo tráfego de saída

3. **RDS Security Group**:
   - Ingress: PostgreSQL (porta 5432) apenas dos worker nodes
   - Egress: Todo tráfego de saída

### IAM Roles e Políticas

1. **EKS Cluster Role**:
   - `AmazonEKSClusterPolicy`
   - `AmazonEKSVPCResourceController`

2. **EKS Worker Nodes Role**:
   - `AmazonEKSWorkerNodePolicy`
   - `AmazonEKS_CNI_Policy`
   - `AmazonEC2ContainerRegistryReadOnly`

3. **RDS Enhanced Monitoring Role**:
   - `AmazonRDSEnhancedMonitoringRole`

## 📊 Monitoramento

### CloudWatch Alarms (AWS)
- **CPU Utilization**: Alerta quando CPU > 80%
- **Database Connections**: Alerta quando conexões > 80

### Logs
- **EKS Cluster Logs**: api, audit, authenticator, controllerManager, scheduler
- **Application Logs**: Através do kubectl

### Performance Insights
- Habilitado no RDS para análise de performance
- Retenção de 7 dias

## 🔄 CI/CD Integration

Os módulos são preparados para integração com pipelines CI/CD:

### Terraform Backend (recomendado)
```hcl
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "tech-challenge/terraform.tfstate"
    region = "us-west-2"
  }
}
```

### GitOps
Os manifestos Kubernetes podem ser gerenciados via:
- ArgoCD
- Flux
- GitHub Actions

## 🚀 Deployment Strategy

### Blue-Green Deployment
Suportado através da configuração de múltiplos node groups:

```hcl
# Green environment
node_group_name = "green"
node_desired_size = 2

# Blue environment (para deploy)
node_group_name = "blue"
node_desired_size = 2
```

### Rolling Updates
Configurado no EKS Node Group:
- `max_unavailable = 1`
- Updates graduais sem downtime

## 💰 Otimização de Custos

### AWS
- **Spot Instances**: `node_capacity_type = "SPOT"`
- **Right-sizing**: Ajustar `node_instance_types` conforme necessário
- **Auto-scaling**: HPA configurado para escalonamento automático
- **RDS**: `multi_az = false` para desenvolvimento

### Monitoramento de Custos
- Tags padronizadas para rastreamento
- Integration com AWS Cost Explorer
- Infracost para estimativas (opcional)

## 🔗 Dependências

### Módulo Networking
- Não possui dependências externas
- Base para outros módulos

### Módulo K8s Cluster
- **AWS**: Depende do módulo Networking
- **Local**: Apenas requer Docker e Kind

### Módulo Database
- **AWS**: Depende dos módulos Networking e K8s Cluster
- **Local**: Depende do módulo K8s Cluster

## 📈 Scaling

### Horizontal Scaling
- **EKS**: Auto Scaling Groups configurados
- **Application**: HPA baseado em CPU/Memory

### Vertical Scaling
- **RDS**: `db_max_allocated_storage` para auto-scaling de storage
- **Nodes**: Possibilidade de upgrade de instance types

## 🛡️ Backup e Recovery

### Database Backups
- **AWS RDS**: Backups automáticos com retenção configurável
- **Local**: Volumes persistentes

### Disaster Recovery
- **Multi-AZ**: Disponível para RDS (configurável)
- **Cross-region**: Possível através de replicação

## 📝 Notas de Customização

### Variáveis de Ambiente
Cada ambiente pode ser customizado através das variáveis definidas em `terraform.tfvars`:

```hcl
# Desenvolvimento
node_instance_types = ["t3.small"]
db_instance_class = "db.t3.micro"
multi_az = false

# Produção
node_instance_types = ["t3.large", "t3.xlarge"]
db_instance_class = "db.t3.medium"
multi_az = true
deletion_protection = true
```

### Tags
Tags consistentes aplicadas a todos os recursos:
- `Environment`: dev/staging/prod
- `Project`: tech-challenge-fiap
- `ManagedBy`: terraform
- `Owner`: nome da equipe