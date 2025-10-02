output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = var.deployment_type == "aws" ? aws_db_instance.postgresql[0].endpoint : "postgres-service.workshop-app.svc.cluster.local"
}

output "db_instance_hosted_zone_id" {
  description = "RDS instance hosted zone ID"
  value       = var.deployment_type == "aws" ? aws_db_instance.postgresql[0].hosted_zone_id : ""
}

output "db_instance_id" {
  description = "RDS instance ID"
  value       = var.deployment_type == "aws" ? aws_db_instance.postgresql[0].id : "postgres-local"
}

output "db_instance_resource_id" {
  description = "RDS Resource ID of this instance"
  value       = var.deployment_type == "aws" ? aws_db_instance.postgresql[0].resource_id : ""
}

output "db_instance_status" {
  description = "RDS instance status"
  value       = var.deployment_type == "aws" ? aws_db_instance.postgresql[0].status : "available"
}

output "db_instance_name" {
  description = "RDS instance name"
  value       = var.db_name
}

output "db_instance_username" {
  description = "RDS instance root username"
  value       = var.db_username
  sensitive   = true
}

output "db_instance_port" {
  description = "RDS instance port"
  value       = var.db_port
}

output "db_parameter_group_id" {
  description = "DB parameter group id"
  value       = var.deployment_type == "aws" ? aws_db_parameter_group.postgresql[0].id : ""
}

output "db_subnet_group_id" {
  description = "DB subnet group id"
  value       = var.subnet_group_name
}

output "database_url" {
  description = "Database connection URL"
  value = var.deployment_type == "aws" ? 
    "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgresql[0].endpoint}:${var.db_port}/${var.db_name}" :
    "postgresql://${var.db_username}:${var.db_password}@postgres-service.workshop-app.svc.cluster.local:${var.db_port}/${var.db_name}"
  sensitive = true
}

output "database_secret_name" {
  description = "Name of the Kubernetes secret containing database credentials"
  value       = kubernetes_secret.database_credentials.metadata[0].name
}

output "cloudwatch_alarms" {
  description = "CloudWatch alarms for RDS monitoring"
  value = var.deployment_type == "aws" ? {
    cpu_alarm         = aws_cloudwatch_metric_alarm.database_cpu[0].arn
    connections_alarm = aws_cloudwatch_metric_alarm.database_connections[0].arn
  } : {}
}