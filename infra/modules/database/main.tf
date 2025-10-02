# RDS PostgreSQL Instance for AWS
resource "aws_db_instance" "postgresql" {
  count = var.deployment_type == "aws" ? 1 : 0

  identifier     = "${var.cluster_name}-postgresql"
  engine         = "postgres"
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = var.db_storage_type
  storage_encrypted     = var.storage_encrypted

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = var.db_port

  vpc_security_group_ids = var.security_group_ids
  db_subnet_group_name   = var.subnet_group_name

  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window

  multi_az               = var.multi_az
  publicly_accessible    = var.publicly_accessible
  deletion_protection    = var.deletion_protection
  skip_final_snapshot    = var.skip_final_snapshot

  # Enhanced monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_enhanced_monitoring[0].arn

  # Performance Insights
  performance_insights_enabled = true
  performance_insights_retention_period = 7

  # Parameter group for PostgreSQL optimization
  parameter_group_name = aws_db_parameter_group.postgresql[0].name

  tags = merge(var.tags, {
    Name        = "${var.cluster_name}-postgresql"
    Environment = var.environment
    Type        = "PostgreSQL"
  })

  depends_on = [aws_db_parameter_group.postgresql]
}

# Parameter Group for PostgreSQL
resource "aws_db_parameter_group" "postgresql" {
  count = var.deployment_type == "aws" ? 1 : 0

  family = "postgres15"
  name   = "${var.cluster_name}-postgresql-params"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = merge(var.tags, {
    Name = "${var.cluster_name}-postgresql-params"
  })
}

# IAM Role for RDS Enhanced Monitoring
resource "aws_iam_role" "rds_enhanced_monitoring" {
  count = var.deployment_type == "aws" ? 1 : 0

  name = "${var.cluster_name}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  count = var.deployment_type == "aws" ? 1 : 0

  role       = aws_iam_role.rds_enhanced_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# CloudWatch Alarms for RDS Monitoring
resource "aws_cloudwatch_metric_alarm" "database_cpu" {
  count = var.deployment_type == "aws" ? 1 : 0

  alarm_name          = "${var.cluster_name}-database-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS CPU utilization"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql[0].id
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "database_connections" {
  count = var.deployment_type == "aws" ? 1 : 0

  alarm_name          = "${var.cluster_name}-database-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS database connections"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql[0].id
  }

  tags = var.tags
}

# Kubernetes Secret for Database Connection (for both local and AWS)
resource "kubernetes_secret" "database_credentials" {
  metadata {
    name      = "workshop-app-secrets"
    namespace = "workshop-app"
  }

  data = {
    DB_HOST     = var.deployment_type == "aws" ? aws_db_instance.postgresql[0].endpoint : "postgres-service.workshop-app.svc.cluster.local"
    DB_PORT     = tostring(var.db_port)
    DB_NAME     = var.db_name
    DB_USER     = var.db_username
    DB_PASSWORD = var.db_password
    DATABASE_URL = var.deployment_type == "aws" ? 
      "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgresql[0].endpoint}:${var.db_port}/${var.db_name}" :
      "postgresql://${var.db_username}:${var.db_password}@postgres-service.workshop-app.svc.cluster.local:${var.db_port}/${var.db_name}"
  }

  type = "Opaque"

  depends_on = [aws_db_instance.postgresql]
}

# ConfigMap for PostgreSQL initialization scripts (for local deployment)
resource "kubernetes_config_map" "postgres_init" {
  count = var.deployment_type == "local" ? 1 : 0

  metadata {
    name      = "postgres-init-scripts"
    namespace = "workshop-app"
  }

  data = {
    "init.sql" = file("${path.root}/../../migrations/001_initial_schema.sql")
  }
}

# Local PostgreSQL Deployment (when deployment_type is local)
resource "kubernetes_deployment" "postgresql_local" {
  count = var.deployment_type == "local" ? 1 : 0

  metadata {
    name      = "postgres-deployment"
    namespace = "workshop-app"
    labels = {
      app = "postgres"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = {
          app = "postgres"
        }
      }

      spec {
        container {
          image = "postgres:15-alpine"
          name  = "postgres"

          port {
            container_port = 5432
          }

          env {
            name  = "POSTGRES_DB"
            value = var.db_name
          }

          env {
            name = "POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = "workshop-app-secrets"
                key  = "DB_USER"
              }
            }
          }

          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = "workshop-app-secrets"
                key  = "DB_PASSWORD"
              }
            }
          }

          volume_mount {
            name       = "postgres-storage"
            mount_path = "/var/lib/postgresql/data"
          }

          volume_mount {
            name       = "postgres-init"
            mount_path = "/docker-entrypoint-initdb.d"
          }

          resources {
            requests = {
              memory = "256Mi"
              cpu    = "250m"
            }
            limits = {
              memory = "512Mi"
              cpu    = "500m"
            }
          }

          liveness_probe {
            exec {
              command = ["pg_isready", "-U", var.db_username, "-d", var.db_name]
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }

          readiness_probe {
            exec {
              command = ["pg_isready", "-U", var.db_username, "-d", var.db_name]
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }

        volume {
          name = "postgres-storage"
          persistent_volume_claim {
            claim_name = "postgres-pvc"
          }
        }

        volume {
          name = "postgres-init"
          config_map {
            name = "postgres-init-scripts"
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_secret.database_credentials,
    kubernetes_config_map.postgres_init,
    kubernetes_persistent_volume_claim.postgres_local
  ]
}

# Service for local PostgreSQL
resource "kubernetes_service" "postgresql_local" {
  count = var.deployment_type == "local" ? 1 : 0

  metadata {
    name      = "postgres-service"
    namespace = "workshop-app"
    labels = {
      app = "postgres"
    }
  }

  spec {
    selector = {
      app = "postgres"
    }

    port {
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }
}

# Persistent Volume Claim for local PostgreSQL
resource "kubernetes_persistent_volume_claim" "postgres_local" {
  count = var.deployment_type == "local" ? 1 : 0

  metadata {
    name      = "postgres-pvc"
    namespace = "workshop-app"
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "5Gi"
      }
    }
  }
}