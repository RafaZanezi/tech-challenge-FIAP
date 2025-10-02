# Terraform Infrastructure Makefile
# Tech Challenge FIAP

.PHONY: help local-deploy local-destroy aws-deploy aws-destroy local-plan aws-plan local-apply aws-apply local-app aws-app clean

# Default target
help: ## Show this help message
	@echo "🚀 Tech Challenge FIAP - Infrastructure Management"
	@echo ""
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Examples:"
	@echo "  make local-deploy    # Deploy local infrastructure"
	@echo "  make aws-deploy      # Deploy AWS infrastructure"
	@echo "  make local-app       # Deploy app to local cluster"
	@echo "  make local-destroy   # Destroy local infrastructure"

# Local Environment Targets
local-plan: ## Plan local infrastructure deployment
	@echo "🔍 Planning local infrastructure..."
	@./scripts/deploy.sh plan local

local-deploy: ## Deploy local infrastructure (Kind + PostgreSQL)
	@echo "🚀 Deploying local infrastructure..."
	@./scripts/deploy.sh deploy local

local-destroy: ## Destroy local infrastructure
	@echo "💥 Destroying local infrastructure..."
	@./scripts/deploy.sh destroy local

local-output: ## Show local infrastructure outputs
	@echo "📊 Local infrastructure outputs..."
	@./scripts/deploy.sh output local

local-app: ## Deploy application to local cluster
	@echo "📱 Deploying application to local cluster..."
	@./scripts/post-deploy.sh all local

local-configure: ## Configure kubectl for local cluster
	@echo "⚙️  Configuring kubectl for local cluster..."
	@./scripts/post-deploy.sh configure local

local-health: ## Check local cluster health
	@echo "🏥 Checking local cluster health..."
	@./scripts/post-deploy.sh health local

# AWS Environment Targets
aws-plan: ## Plan AWS infrastructure deployment
	@echo "🔍 Planning AWS infrastructure..."
	@./scripts/deploy.sh plan aws

aws-deploy: ## Deploy AWS infrastructure (EKS + RDS)
	@echo "🚀 Deploying AWS infrastructure..."
	@./scripts/deploy.sh deploy aws

aws-destroy: ## Destroy AWS infrastructure
	@echo "💥 Destroying AWS infrastructure..."
	@./scripts/deploy.sh destroy aws

aws-output: ## Show AWS infrastructure outputs
	@echo "📊 AWS infrastructure outputs..."
	@./scripts/deploy.sh output aws

aws-app: ## Deploy application to AWS cluster
	@echo "📱 Deploying application to AWS cluster..."
	@./scripts/post-deploy.sh all aws

aws-configure: ## Configure kubectl for AWS cluster
	@echo "⚙️  Configuring kubectl for AWS cluster..."
	@./scripts/post-deploy.sh configure aws

aws-health: ## Check AWS cluster health
	@echo "🏥 Checking AWS cluster health..."
	@./scripts/post-deploy.sh health aws

# Development Targets
dev-setup: ## Setup development environment (local)
	@echo "🛠️  Setting up development environment..."
	@make local-deploy
	@make local-app

dev-teardown: ## Teardown development environment
	@echo "🧹 Tearing down development environment..."
	@make local-destroy

# Utility Targets
validate: ## Validate all Terraform configurations
	@echo "✅ Validating Terraform configurations..."
	@cd environments/local && terraform validate
	@cd environments/aws && terraform validate
	@echo "✅ All configurations are valid!"

format: ## Format all Terraform files
	@echo "🎨 Formatting Terraform files..."
	@terraform fmt -recursive .
	@echo "✅ Formatting completed!"

security-scan: ## Run security scan on Terraform configurations
	@echo "🔒 Running security scan..."
	@if command -v checkov >/dev/null 2>&1; then \
		checkov -d . --framework terraform; \
	else \
		echo "⚠️  Checkov not installed. Install with: pip install checkov"; \
	fi

docs: ## Generate documentation
	@echo "📚 Generating documentation..."
	@if command -v terraform-docs >/dev/null 2>&1; then \
		terraform-docs markdown table --output-file README.md modules/networking/; \
		terraform-docs markdown table --output-file README.md modules/k8s-cluster/; \
		terraform-docs markdown table --output-file README.md modules/database/; \
		echo "✅ Documentation generated!"; \
	else \
		echo "⚠️  terraform-docs not installed. Install from: https://terraform-docs.io/"; \
	fi

# Monitoring and Debugging
logs-local: ## Show application logs from local cluster
	@echo "📋 Showing local application logs..."
	@kubectl logs -f deployment/workshop-app-deployment -n workshop-app

logs-aws: ## Show application logs from AWS cluster
	@echo "📋 Showing AWS application logs..."
	@kubectl logs -f deployment/workshop-app-deployment -n workshop-app

debug-local: ## Debug local cluster issues
	@echo "🐛 Debugging local cluster..."
	@echo "Cluster info:"
	@kubectl cluster-info
	@echo ""
	@echo "Nodes:"
	@kubectl get nodes
	@echo ""
	@echo "Pods in workshop-app namespace:"
	@kubectl get pods -n workshop-app
	@echo ""
	@echo "Services in workshop-app namespace:"
	@kubectl get services -n workshop-app

debug-aws: ## Debug AWS cluster issues
	@echo "🐛 Debugging AWS cluster..."
	@echo "Cluster info:"
	@kubectl cluster-info
	@echo ""
	@echo "Nodes:"
	@kubectl get nodes
	@echo ""
	@echo "Pods in workshop-app namespace:"
	@kubectl get pods -n workshop-app
	@echo ""
	@echo "Services in workshop-app namespace:"
	@kubectl get services -n workshop-app

# Database Operations
db-connect-local: ## Connect to local PostgreSQL database
	@echo "🗄️  Connecting to local database..."
	@kubectl exec -it deployment/postgres-deployment -n workshop-app -- psql -U postgres -d workshop_db

db-migrate-local: ## Run database migrations on local cluster
	@echo "🔄 Running database migrations on local cluster..."
	@./scripts/post-deploy.sh migrate local

db-migrate-aws: ## Run database migrations on AWS cluster
	@echo "🔄 Running database migrations on AWS cluster..."
	@./scripts/post-deploy.sh migrate aws

# Cleanup
clean: ## Clean up temporary files
	@echo "🧹 Cleaning up temporary files..."
	@find . -name "*.tfplan" -delete
	@find . -name ".terraform.lock.hcl" -delete
	@find . -name "terraform.tfstate.backup" -delete
	@echo "✅ Cleanup completed!"

# Port Forwarding
port-forward-local: ## Setup port forwarding for local application
	@echo "🔌 Setting up port forwarding for local application..."
	@echo "Access the application at: http://localhost:8080"
	@kubectl port-forward service/workshop-app-service 8080:80 -n workshop-app

port-forward-aws: ## Setup port forwarding for AWS application
	@echo "🔌 Setting up port forwarding for AWS application..."
	@echo "Access the application at: http://localhost:8080"
	@kubectl port-forward service/workshop-app-service 8080:80 -n workshop-app

# Cost Management (AWS only)
cost-estimate: ## Estimate AWS costs (requires infracost)
	@echo "💰 Estimating AWS costs..."
	@if command -v infracost >/dev/null 2>&1; then \
		cd environments/aws && infracost breakdown --path .; \
	else \
		echo "⚠️  Infracost not installed. Install from: https://www.infracost.io/docs/"; \
	fi

# Prerequisites Check
check-prereqs: ## Check if all prerequisites are installed
	@echo "🔍 Checking prerequisites..."
	@echo "Terraform: $$(command -v terraform >/dev/null 2>&1 && echo "✅ Installed" || echo "❌ Missing")"
	@echo "kubectl: $$(command -v kubectl >/dev/null 2>&1 && echo "✅ Installed" || echo "❌ Missing")"
	@echo "Docker: $$(command -v docker >/dev/null 2>&1 && echo "✅ Installed" || echo "❌ Missing")"
	@echo "Kind: $$(command -v kind >/dev/null 2>&1 && echo "✅ Installed" || echo "❌ Missing")"
	@echo "AWS CLI: $$(command -v aws >/dev/null 2>&1 && echo "✅ Installed" || echo "❌ Missing")"

# Quick Start
quick-start: ## Quick start guide
	@echo "🚀 Quick Start Guide"
	@echo ""
	@echo "For Local Development:"
	@echo "  1. make dev-setup     # Deploy local infrastructure and app"
	@echo "  2. make port-forward-local  # Access the application"
	@echo ""
	@echo "For AWS Deployment:"
	@echo "  1. aws configure      # Configure AWS credentials"
	@echo "  2. make aws-deploy    # Deploy AWS infrastructure"
	@echo "  3. make aws-app       # Deploy application"
	@echo ""
	@echo "Useful Commands:"
	@echo "  make logs-local       # View application logs"
	@echo "  make debug-local      # Debug issues"
	@echo "  make db-connect-local # Connect to database"