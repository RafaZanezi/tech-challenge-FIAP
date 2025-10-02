# K8s Cluster Module Variables

variable "cluster_name" {
  description = "Name of the Kubernetes cluster"
  type        = string
}

variable "cluster_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.27"
}

variable "vpc_id" {
  description = "VPC ID where the cluster will be created"
  type        = string
  default     = ""
}

variable "subnet_ids" {
  description = "List of subnet IDs for the cluster"
  type        = list(string)
  default     = []
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for worker nodes"
  type        = list(string)
  default     = []
}

variable "cluster_security_group_id" {
  description = "Security group ID for the cluster"
  type        = string
  default     = ""
}

variable "worker_security_group_id" {
  description = "Security group ID for worker nodes"
  type        = string
  default     = ""
}

variable "node_group_name" {
  description = "Name of the EKS node group"
  type        = string
  default     = "main"
}

variable "node_instance_types" {
  description = "List of instance types for the worker nodes"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_capacity_type" {
  description = "Type of capacity associated with the EKS Node Group. Valid values: ON_DEMAND, SPOT"
  type        = string
  default     = "ON_DEMAND"
}

variable "node_disk_size" {
  description = "Disk size in GiB for worker nodes"
  type        = number
  default     = 20
}

variable "node_desired_size" {
  description = "Desired number of nodes in the EKS Node Group"
  type        = number
  default     = 2
}

variable "node_max_size" {
  description = "Maximum number of nodes in the EKS Node Group"
  type        = number
  default     = 4
}

variable "node_min_size" {
  description = "Minimum number of nodes in the EKS Node Group"
  type        = number
  default     = 1
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "deployment_type" {
  description = "Type of deployment (local or aws)"
  type        = string
  default     = "aws"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}