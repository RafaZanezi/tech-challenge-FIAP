#!/bin/bash

# Post-deployment configuration script
# This script helps configure the application after infrastructure is deployed

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo "🔧 $1"
    echo "=================================="
    echo
}

# Configure kubectl for the cluster
configure_kubectl() {
    local environment=$1
    
    print_header "Configuring kubectl"
    
    cd "environments/$environment"
    
    # Get the kubeconfig command from terraform output
    local kubeconfig_cmd
    kubeconfig_cmd=$(terraform output -raw kubeconfig_command 2>/dev/null || echo "")
    
    if [ -z "$kubeconfig_cmd" ]; then
        print_error "Could not get kubeconfig command from terraform output"
        exit 1
    fi
    
    print_info "Running: $kubeconfig_cmd"
    eval "$kubeconfig_cmd"
    
    # Verify connection
    print_info "Verifying cluster connection..."
    kubectl cluster-info
    
    print_success "kubectl configured successfully"
    
    cd - > /dev/null
}

# Deploy the application manifests
deploy_application() {
    local environment=$1
    
    print_header "Deploying Application"
    
    # Get namespace from terraform output
    cd "environments/$environment"
    local namespace
    namespace=$(terraform output -raw namespace_name 2>/dev/null || echo "workshop-app")
    cd - > /dev/null
    
    print_info "Deploying to namespace: $namespace"
    
    # Apply all Kubernetes manifests
    print_info "Applying Kubernetes manifests..."
    kubectl apply -f ../../k8s/ -n "$namespace"
    
    # Wait for deployments to be ready
    print_info "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available deployment --all -n "$namespace" --timeout=300s
    
    print_success "Application deployed successfully"
    
    # Show deployment status
    print_info "Deployment status:"
    kubectl get all -n "$namespace"
}

# Run database migrations
run_migrations() {
    local environment=$1
    
    print_header "Running Database Migrations"
    
    cd "environments/$environment"
    local namespace
    namespace=$(terraform output -raw namespace_name 2>/dev/null || echo "workshop-app")
    cd - > /dev/null
    
    # Create a job to run migrations
    print_info "Creating migration job..."
    
    cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration-$(date +%s)
  namespace: $namespace
spec:
  template:
    spec:
      containers:
      - name: migration
        image: postgres:15-alpine
        command: ["/bin/sh"]
        args:
          - -c
          - |
            echo "Running database migrations..."
            for f in /migrations/*.sql; do
              if [ -f "\$f" ]; then
                echo "Applying migration: \$f"
                psql "\$DATABASE_URL" -f "\$f"
              fi
            done
            echo "Migrations completed successfully"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: workshop-app-secrets
              key: DATABASE_URL
        volumeMounts:
        - name: migrations
          mountPath: /migrations
      volumes:
      - name: migrations
        configMap:
          name: migration-scripts
      restartPolicy: Never
  backoffLimit: 3
EOF
    
    # Create ConfigMap with migration scripts
    print_info "Creating migration scripts ConfigMap..."
    kubectl create configmap migration-scripts \
      --from-file=../../migrations/ \
      -n "$namespace" \
      --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "Migration job created"
}

# Setup monitoring and observability
setup_monitoring() {
    local environment=$1
    
    print_header "Setting up Monitoring"
    
    cd "environments/$environment"
    local namespace
    namespace=$(terraform output -raw namespace_name 2>/dev/null || echo "workshop-app")
    cd - > /dev/null
    
    # Create ServiceMonitor for Prometheus (if available)
    print_info "Creating ServiceMonitor for metrics collection..."
    
    cat <<EOF | kubectl apply -f - || print_warning "ServiceMonitor creation failed (Prometheus operator may not be installed)"
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: workshop-app-metrics
  namespace: $namespace
spec:
  selector:
    matchLabels:
      app: workshop-app
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
EOF
    
    print_info "Monitoring setup completed"
}

# Show access information
show_access_info() {
    local environment=$1
    
    print_header "Access Information"
    
    cd "environments/$environment"
    local namespace
    namespace=$(terraform output -raw namespace_name 2>/dev/null || echo "workshop-app")
    cd - > /dev/null
    
    print_info "Application Access Options:"
    echo
    
    # Check if ingress exists
    if kubectl get ingress -n "$namespace" &>/dev/null; then
        echo "🌐 Ingress (recommended):"
        kubectl get ingress -n "$namespace"
        echo
    fi
    
    # Check if LoadBalancer service exists
    if kubectl get service -n "$namespace" -o jsonpath='{.items[?(.spec.type=="LoadBalancer")].status.loadBalancer.ingress[0].hostname}' 2>/dev/null | grep -q .; then
        echo "⚖️  LoadBalancer:"
        kubectl get service -n "$namespace" --field-selector spec.type=LoadBalancer
        echo
    fi
    
    # Show port forward option
    echo "🔌 Port Forward (for testing):"
    echo "   kubectl port-forward service/workshop-app-service 8080:80 -n $namespace"
    echo "   Then visit: http://localhost:8080"
    echo
    
    # Show logs command
    echo "📋 View Logs:"
    echo "   kubectl logs -f deployment/workshop-app-deployment -n $namespace"
    echo
    
    # Show database access
    echo "🗄️  Database Access:"
    echo "   kubectl exec -it deployment/postgres-deployment -n $namespace -- psql -U postgres -d workshop_db"
    echo
}

# Health check
health_check() {
    local environment=$1
    
    print_header "Health Check"
    
    cd "environments/$environment"
    local namespace
    namespace=$(terraform output -raw namespace_name 2>/dev/null || echo "workshop-app")
    cd - > /dev/null
    
    print_info "Checking cluster health..."
    kubectl get nodes
    echo
    
    print_info "Checking application pods..."
    kubectl get pods -n "$namespace"
    echo
    
    print_info "Checking services..."
    kubectl get services -n "$namespace"
    echo
    
    # Check if all pods are running
    local not_running
    not_running=$(kubectl get pods -n "$namespace" --no-headers | grep -v Running | grep -v Completed | wc -l)
    
    if [ "$not_running" -eq 0 ]; then
        print_success "All pods are running successfully!"
    else
        print_warning "$not_running pod(s) are not in Running state"
        kubectl get pods -n "$namespace" --no-headers | grep -v Running | grep -v Completed
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo
    echo "Commands:"
    echo "  configure      Configure kubectl and deploy application"
    echo "  deploy-app     Deploy application manifests only"
    echo "  migrate        Run database migrations"
    echo "  monitor        Setup monitoring"
    echo "  access         Show access information"
    echo "  health         Run health check"
    echo "  all            Run all configuration steps"
    echo "  help           Show this help message"
    echo
    echo "Environments:"
    echo "  local          Local Kubernetes (Kind)"
    echo "  aws            AWS EKS"
    echo
    echo "Examples:"
    echo "  $0 all local"
    echo "  $0 configure aws"
    echo "  $0 health local"
}

# Main function
main() {
    local command=$1
    local environment=$2
    
    # Change to terraform directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR/.."
    
    if [ -z "$environment" ]; then
        print_error "Environment is required"
        show_usage
        exit 1
    fi
    
    case "$command" in
        configure)
            configure_kubectl "$environment"
            ;;
        deploy-app)
            deploy_application "$environment"
            ;;
        migrate)
            run_migrations "$environment"
            ;;
        monitor)
            setup_monitoring "$environment"
            ;;
        access)
            show_access_info "$environment"
            ;;
        health)
            health_check "$environment"
            ;;
        all)
            configure_kubectl "$environment"
            deploy_application "$environment"
            run_migrations "$environment"
            setup_monitoring "$environment"
            show_access_info "$environment"
            health_check "$environment"
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