#!/bin/bash

# Deploy Infrastructure - Tech Challenge FIAP
# This script helps deploy the infrastructure for both local and AWS environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo
    echo "=================================="
    echo "🚀 $1"
    echo "=================================="
    echo
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing_tools=()
    
    # Check terraform
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("terraform")
    fi
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        missing_tools+=("kubectl")
    fi
    
    # Check docker
    if ! command -v docker &> /dev/null; then
        missing_tools+=("docker")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        echo
        echo "Please install the missing tools:"
        for tool in "${missing_tools[@]}"; do
            case $tool in
                terraform)
                    echo "  - Terraform: https://www.terraform.io/downloads"
                    ;;
                kubectl)
                    echo "  - kubectl: https://kubernetes.io/docs/tasks/tools/"
                    ;;
                docker)
                    echo "  - Docker: https://docs.docker.com/get-docker/"
                    ;;
            esac
        done
        exit 1
    fi
    
    print_success "All required tools are installed"
}

# Check environment-specific prerequisites
check_env_prerequisites() {
    local environment=$1
    
    if [ "$environment" = "aws" ]; then
        print_info "Checking AWS prerequisites..."
        
        if ! command -v aws &> /dev/null; then
            print_error "AWS CLI is not installed"
            echo "Install it from: https://aws.amazon.com/cli/"
            exit 1
        fi
        
        # Check AWS credentials
        if ! aws sts get-caller-identity &> /dev/null; then
            print_error "AWS credentials not configured"
            echo "Configure them with: aws configure"
            exit 1
        fi
        
        print_success "AWS CLI is configured"
        
    elif [ "$environment" = "local" ]; then
        print_info "Checking local prerequisites..."
        
        if ! command -v kind &> /dev/null; then
            print_error "Kind is not installed"
            echo "Install it from: https://kind.sigs.k8s.io/docs/user/quick-start/"
            exit 1
        fi
        
        print_success "Kind is installed"
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo
    echo "Commands:"
    echo "  deploy     Deploy infrastructure"
    echo "  destroy    Destroy infrastructure"
    echo "  plan       Show deployment plan"
    echo "  output     Show deployment outputs"
    echo "  help       Show this help message"
    echo
    echo "Environments:"
    echo "  local      Deploy using Kind (local Kubernetes)"
    echo "  aws        Deploy using AWS EKS"
    echo
    echo "Examples:"
    echo "  $0 deploy local"
    echo "  $0 deploy aws"
    echo "  $0 destroy local"
    echo "  $0 plan aws"
}

# Deploy infrastructure
deploy_infrastructure() {
    local environment=$1
    local env_dir="environments/$environment"
    
    print_header "Deploying Infrastructure - $environment"
    
    if [ ! -d "$env_dir" ]; then
        print_error "Environment directory not found: $env_dir"
        exit 1
    fi
    
    cd "$env_dir"
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        print_warning "terraform.tfvars not found"
        if [ -f "terraform.tfvars.example" ]; then
            print_info "Creating terraform.tfvars from example..."
            cp terraform.tfvars.example terraform.tfvars
            print_warning "Please edit terraform.tfvars with your specific values before proceeding"
            print_info "Opening terraform.tfvars for editing..."
            ${EDITOR:-nano} terraform.tfvars
        else
            print_error "No terraform.tfvars.example found"
            exit 1
        fi
    fi
    
    print_info "Initializing Terraform..."
    terraform init
    
    print_info "Planning deployment..."
    terraform plan -out=tfplan
    
    echo
    read -p "Do you want to apply this plan? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Applying deployment..."
        terraform apply tfplan
        rm -f tfplan
        
        print_success "Deployment completed!"
        
        # Show next steps
        print_header "Next Steps"
        terraform output -raw next_steps 2>/dev/null || terraform output -raw deployment_summary 2>/dev/null || echo "Check terraform outputs for next steps"
        
    else
        print_info "Deployment cancelled"
        rm -f tfplan
    fi
    
    cd - > /dev/null
}

# Destroy infrastructure
destroy_infrastructure() {
    local environment=$1
    local env_dir="environments/$environment"
    
    print_header "Destroying Infrastructure - $environment"
    
    if [ ! -d "$env_dir" ]; then
        print_error "Environment directory not found: $env_dir"
        exit 1
    fi
    
    cd "$env_dir"
    
    print_warning "This will destroy all resources in the $environment environment"
    echo
    read -p "Are you sure you want to destroy the infrastructure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Destroying infrastructure..."
        terraform destroy
        print_success "Infrastructure destroyed!"
    else
        print_info "Destruction cancelled"
    fi
    
    cd - > /dev/null
}

# Show plan
show_plan() {
    local environment=$1
    local env_dir="environments/$environment"
    
    print_header "Showing Plan - $environment"
    
    if [ ! -d "$env_dir" ]; then
        print_error "Environment directory not found: $env_dir"
        exit 1
    fi
    
    cd "$env_dir"
    
    print_info "Initializing Terraform..."
    terraform init
    
    print_info "Generating plan..."
    terraform plan
    
    cd - > /dev/null
}

# Show outputs
show_outputs() {
    local environment=$1
    local env_dir="environments/$environment"
    
    print_header "Showing Outputs - $environment"
    
    if [ ! -d "$env_dir" ]; then
        print_error "Environment directory not found: $env_dir"
        exit 1
    fi
    
    cd "$env_dir"
    
    if [ ! -f "terraform.tfstate" ]; then
        print_error "No terraform state found. Deploy infrastructure first."
        exit 1
    fi
    
    terraform output
    
    cd - > /dev/null
}

# Main script logic
main() {
    local command=$1
    local environment=$2
    
    # Change to terraform directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR/.."
    
    case "$command" in
        deploy)
            if [ -z "$environment" ]; then
                print_error "Environment is required for deploy command"
                show_usage
                exit 1
            fi
            check_prerequisites
            check_env_prerequisites "$environment"
            deploy_infrastructure "$environment"
            ;;
        destroy)
            if [ -z "$environment" ]; then
                print_error "Environment is required for destroy command"
                show_usage
                exit 1
            fi
            check_prerequisites
            destroy_infrastructure "$environment"
            ;;
        plan)
            if [ -z "$environment" ]; then
                print_error "Environment is required for plan command"
                show_usage
                exit 1
            fi
            check_prerequisites
            check_env_prerequisites "$environment"
            show_plan "$environment"
            ;;
        output)
            if [ -z "$environment" ]; then
                print_error "Environment is required for output command"
                show_usage
                exit 1
            fi
            show_outputs "$environment"
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            echo
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"