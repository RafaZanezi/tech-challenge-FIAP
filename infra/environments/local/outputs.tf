# Local Environment Outputs

output "cluster_name" {
  description = "Name of the Kubernetes cluster"
  value       = module.k8s_cluster.cluster_name
}

output "cluster_endpoint" {
  description = "Endpoint for the Kubernetes cluster"
  value       = module.k8s_cluster.cluster_endpoint
}

output "kubeconfig_command" {
  description = "Command to configure kubectl"
  value       = module.k8s_cluster.kubeconfig_command
}

output "namespace_name" {
  description = "Name of the workshop-app namespace"
  value       = module.k8s_cluster.namespace_name
}

output "database_endpoint" {
  description = "Database endpoint"
  value       = module.database.db_instance_endpoint
}

output "database_port" {
  description = "Database port"
  value       = module.database.db_instance_port
}

output "database_name" {
  description = "Database name"
  value       = module.database.db_instance_name
}

output "database_secret_name" {
  description = "Name of the Kubernetes secret containing database credentials"
  value       = module.database.database_secret_name
}

output "next_steps" {
  description = "Next steps to deploy the application"
  value = <<-EOT
  🎉 Local Kubernetes cluster created successfully!
  
  Next steps:
  1. Configure kubectl: ${module.k8s_cluster.kubeconfig_command}
  2. Verify cluster: kubectl cluster-info
  3. Check namespace: kubectl get namespace ${module.k8s_cluster.namespace_name}
  4. Deploy your application: kubectl apply -f ../../k8s/
  5. Port forward to access: kubectl port-forward service/workshop-app-service 8080:80 -n ${module.k8s_cluster.namespace_name}
  
  Database connection available at: ${module.database.db_instance_endpoint}:${module.database.db_instance_port}
  EOT
}