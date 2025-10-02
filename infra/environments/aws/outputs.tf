# AWS Environment Outputs

# Networking Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.networking.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.networking.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "List of IDs of the public subnets"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "List of IDs of the private subnets"
  value       = module.networking.private_subnet_ids
}

# EKS Cluster Outputs
output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.k8s_cluster.cluster_name
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.k8s_cluster.cluster_endpoint
}

output "cluster_version" {
  description = "The Kubernetes server version for the EKS cluster"
  value       = module.k8s_cluster.cluster_version
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = module.k8s_cluster.cluster_certificate_authority_data
  sensitive   = true
}

output "cluster_arn" {
  description = "The Amazon Resource Name (ARN) of the cluster"
  value       = module.k8s_cluster.cluster_arn
}

output "cluster_oidc_issuer_url" {
  description = "The URL on the EKS cluster OIDC Issuer"
  value       = module.k8s_cluster.cluster_oidc_issuer_url
}

output "node_group_arn" {
  description = "Amazon Resource Name (ARN) of the EKS Node Group"
  value       = module.k8s_cluster.node_group_arn
}

output "node_group_status" {
  description = "Status of the EKS Node Group"
  value       = module.k8s_cluster.node_group_status
}

output "kubeconfig_command" {
  description = "Command to configure kubectl"
  value       = module.k8s_cluster.kubeconfig_command
}

output "namespace_name" {
  description = "Name of the workshop-app namespace"
  value       = module.k8s_cluster.namespace_name
}

# Database Outputs
output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = module.database.db_instance_endpoint
}

output "db_instance_port" {
  description = "RDS instance port"
  value       = module.database.db_instance_port
}

output "db_instance_name" {
  description = "RDS instance name"
  value       = module.database.db_instance_name
}

output "db_instance_status" {
  description = "RDS instance status"
  value       = module.database.db_instance_status
}

output "database_secret_name" {
  description = "Name of the Kubernetes secret containing database credentials"
  value       = module.database.database_secret_name
}

output "cloudwatch_alarms" {
  description = "CloudWatch alarms for RDS monitoring"
  value       = module.database.cloudwatch_alarms
}

# Summary Output
output "deployment_summary" {
  description = "Summary of the deployed infrastructure"
  value = <<-EOT
  🚀 AWS Infrastructure deployed successfully!
  
  📊 Infrastructure Summary:
  ├── 🌐 VPC: ${module.networking.vpc_id} (${module.networking.vpc_cidr_block})
  ├── 🏗️  EKS Cluster: ${module.k8s_cluster.cluster_name}
  ├── 📡 Cluster Endpoint: ${module.k8s_cluster.cluster_endpoint}
  ├── 🗄️  Database: ${module.database.db_instance_endpoint}:${module.database.db_instance_port}
  └── 📦 Namespace: ${module.k8s_cluster.namespace_name}
  
  🔧 Next Steps:
  1. Configure kubectl: ${module.k8s_cluster.kubeconfig_command}
  2. Verify cluster: kubectl cluster-info
  3. Check nodes: kubectl get nodes
  4. Deploy your application: kubectl apply -f ../../k8s/
  5. Check status: kubectl get all -n ${module.k8s_cluster.namespace_name}
  
  💡 Access your application:
  - Get LoadBalancer URL: kubectl get ingress -n ${module.k8s_cluster.namespace_name}
  - Or port forward: kubectl port-forward service/workshop-app-service 8080:80 -n ${module.k8s_cluster.namespace_name}
  EOT
}

# Security and Access Information
output "security_information" {
  description = "Security and access information"
  value = <<-EOT
  🔒 Security Information:
  
  📋 Security Groups:
  ├── Cluster SG: ${module.networking.cluster_security_group_id}
  ├── Worker Nodes SG: ${module.networking.worker_nodes_security_group_id}
  └── RDS SG: ${module.networking.rds_security_group_id}
  
  🔑 Database Access:
  ├── Secret Name: ${module.database.database_secret_name}
  ├── Namespace: ${module.k8s_cluster.namespace_name}
  └── Endpoint: ${module.database.db_instance_endpoint}
  
  ⚠️  Security Reminders:
  - Database is only accessible from within the EKS cluster
  - Use kubectl to access logs: kubectl logs -f deployment/workshop-app-deployment -n ${module.k8s_cluster.namespace_name}
  - Monitor with CloudWatch alarms configured for CPU and connections
  EOT
}