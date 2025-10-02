# Local Environment Variables

variable "cluster_version" {
  description = "Kubernetes version for the local cluster"
  type        = string
  default     = "1.27.3"
}

variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "workshop_db"
}

variable "db_username" {
  description = "Database administrator username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Database administrator password"
  type        = string
  default     = "admin123"
  sensitive   = true
}

variable "db_port" {
  description = "Database port"
  type        = number
  default     = 5432
}