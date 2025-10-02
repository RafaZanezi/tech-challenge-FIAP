output "cluster_name" {
  description = "Name of the Kubernetes cluster"
  value       = var.deployment_type == "aws" ? aws_eks_cluster.main[0].name : var.cluster_name
}

output "cluster_endpoint" {
  description = "Endpoint for the Kubernetes cluster"
  value       = var.deployment_type == "aws" ? aws_eks_cluster.main[0].endpoint : "http://localhost:6443"
}

output "cluster_version" {
  description = "The Kubernetes server version for the cluster"
  value       = var.deployment_type == "aws" ? aws_eks_cluster.main[0].version : var.cluster_version
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = var.deployment_type == "aws" ? aws_eks_cluster.main[0].certificate_authority[0].data : ""
  sensitive   = true
}

output "cluster_arn" {
  description = "The Amazon Resource Name (ARN) of the cluster"
  value       = var.deployment_type == "aws" ? aws_eks_cluster.main[0].arn : ""
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = var.deployment_type == "aws" ? aws_eks_cluster.main[0].vpc_config[0].cluster_security_group_id : ""
}

output "node_group_arn" {
  description = "Amazon Resource Name (ARN) of the EKS Node Group"
  value       = var.deployment_type == "aws" ? aws_eks_node_group.main[0].arn : ""
}

output "node_group_status" {
  description = "Status of the EKS Node Group"
  value       = var.deployment_type == "aws" ? aws_eks_node_group.main[0].status : "ACTIVE"
}

output "cluster_oidc_issuer_url" {
  description = "The URL on the EKS cluster OIDC Issuer"
  value       = var.deployment_type == "aws" ? aws_eks_cluster.main[0].identity[0].oidc[0].issuer : ""
}

output "cluster_primary_security_group_id" {
  description = "The cluster primary security group ID created by EKS"
  value       = var.deployment_type == "aws" ? aws_eks_cluster.main[0].vpc_config[0].cluster_security_group_id : ""
}

output "namespace_name" {
  description = "Name of the workshop-app namespace"
  value       = kubernetes_namespace.workshop_app.metadata[0].name
}

output "kubeconfig_command" {
  description = "Command to configure kubectl"
  value = var.deployment_type == "aws" ? "aws eks update-kubeconfig --region ${data.aws_region.current.name} --name ${var.cluster_name}" : "kind get kubeconfig --name ${var.cluster_name}"
}

data "aws_region" "current" {
  count = var.deployment_type == "aws" ? 1 : 0
}