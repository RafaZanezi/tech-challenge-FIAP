# Local Environment Configuration
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

# Local Variables
locals {
  cluster_name = "workshop-cluster"
  environment  = "local"
  
  common_tags = {
    Environment = local.environment
    Project     = "tech-challenge-fiap"
    ManagedBy   = "terraform"
  }
}

# Kubernetes Cluster Module (Kind)
module "k8s_cluster" {
  source = "../../modules/k8s-cluster"

  cluster_name    = local.cluster_name
  cluster_version = var.cluster_version
  deployment_type = "local"
  environment     = local.environment
  tags           = local.common_tags
}

# Database Module (PostgreSQL in Kubernetes)
module "database" {
  source = "../../modules/database"

  cluster_name    = local.cluster_name
  deployment_type = "local"
  environment     = local.environment
  
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  db_port     = var.db_port
  
  tags = local.common_tags

  depends_on = [module.k8s_cluster]
}