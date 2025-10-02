#!/bin/bash

# Deploy script for Workshop App on Kubernetes

set -e

NAMESPACE="workshop-app"
IMAGE_TAG=${1:-latest}

echo "🚀 Starting deployment of Workshop App to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Create namespace
echo "📦 Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMap and Secrets
echo "🔧 Applying configuration..."
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy PostgreSQL (for development/testing)
echo "🐘 Deploying PostgreSQL..."
kubectl apply -f k8s/postgres.yaml

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s

# Deploy the application
echo "🏗️ Deploying Workshop App..."
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Wait for deployment to be ready
echo "⏳ Waiting for Workshop App to be ready..."
kubectl wait --for=condition=available deployment/workshop-app-deployment -n $NAMESPACE --timeout=300s

# Apply HPA
echo "📈 Setting up autoscaling..."
kubectl apply -f k8s/hpa.yaml

# Apply network policies (optional)
echo "🔒 Applying network policies..."
kubectl apply -f k8s/network-policy.yaml

# Apply ingress (optional)
echo "🌐 Setting up ingress..."
kubectl apply -f k8s/ingress.yaml

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Deployment status:"
kubectl get all -n $NAMESPACE

echo ""
echo "🔍 To check the status of your deployment:"
echo "kubectl get pods -n $NAMESPACE"
echo "kubectl logs -f deployment/workshop-app-deployment -n $NAMESPACE"
echo ""
echo "🌐 To access the application:"
echo "kubectl port-forward service/workshop-app-service 8080:80 -n $NAMESPACE"
echo "Then visit: http://localhost:8080"