# AWS Environment Configuration
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
}

# AWS Provider Configuration
provider "aws" {
  region = var.region

  default_tags {
    tags = local.common_tags
  }
}

# Local Variables
locals {
  cluster_name = var.cluster_name
  environment  = var.environment
  
  common_tags = {
    Environment = local.environment
    Project     = "tech-challenge-fiap"
    ManagedBy   = "terraform"
    Owner       = var.owner
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# Networking Module
module "networking" {
  source = "../../modules/networking"

  cluster_name       = local.cluster_name
  region            = var.region
  environment       = local.environment
  vpc_cidr          = var.vpc_cidr
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 3)
  
  private_subnet_cidrs  = var.private_subnet_cidrs
  public_subnet_cidrs   = var.public_subnet_cidrs
  database_subnet_cidrs = var.database_subnet_cidrs
  
  tags = local.common_tags
}

# Kubernetes Cluster Module (EKS)
module "k8s_cluster" {
  source = "../../modules/k8s-cluster"

  cluster_name    = local.cluster_name
  cluster_version = var.cluster_version
  deployment_type = "aws"
  environment     = local.environment
  
  vpc_id                   = module.networking.vpc_id
  subnet_ids              = concat(module.networking.public_subnet_ids, module.networking.private_subnet_ids)
  private_subnet_ids      = module.networking.private_subnet_ids
  cluster_security_group_id = module.networking.cluster_security_group_id
  worker_security_group_id = module.networking.worker_nodes_security_group_id
  
  node_group_name      = var.node_group_name
  node_instance_types  = var.node_instance_types
  node_capacity_type   = var.node_capacity_type
  node_disk_size       = var.node_disk_size
  node_desired_size    = var.node_desired_size
  node_max_size        = var.node_max_size
  node_min_size        = var.node_min_size
  
  tags = local.common_tags

  depends_on = [module.networking]
}

# Database Module (RDS PostgreSQL)
module "database" {
  source = "../../modules/database"

  cluster_name    = local.cluster_name
  deployment_type = "aws"
  environment     = local.environment
  
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  db_port     = var.db_port
  
  db_instance_class         = var.db_instance_class
  db_allocated_storage      = var.db_allocated_storage
  db_max_allocated_storage  = var.db_max_allocated_storage
  db_engine_version         = var.db_engine_version
  backup_retention_period   = var.backup_retention_period
  multi_az                  = var.multi_az
  publicly_accessible       = var.publicly_accessible
  storage_encrypted         = var.storage_encrypted
  deletion_protection       = var.deletion_protection
  skip_final_snapshot       = var.skip_final_snapshot
  
  vpc_id               = module.networking.vpc_id
  subnet_group_name    = module.networking.database_subnet_group_name
  security_group_ids   = [module.networking.rds_security_group_id]
  
  tags = local.common_tags

  depends_on = [module.k8s_cluster]
}