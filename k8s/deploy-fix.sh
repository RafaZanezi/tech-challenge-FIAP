#!/bin/bash

# Fix deployment by deleting existing deployments and recreating them
# This is necessary due to Kubernetes selector immutability

echo "🔧 Fixing Kubernetes deployment selector immutability issue..."

# Check if namespace exists
if kubectl get namespace workshop-app >/dev/null 2>&1; then
    echo "📦 Namespace workshop-app exists"
    
    # Delete existing deployments to avoid selector immutability issues
    echo "🗑️  Deleting existing deployments to fix selectors..."
    kubectl delete deployment postgres-deployment -n workshop-app --ignore-not-found=true
    kubectl delete deployment workshop-app-deployment -n workshop-app --ignore-not-found=true
    
    # Wait a moment for resources to be fully deleted
    echo "⏳ Waiting for deployments to be deleted..."
    sleep 5
else
    echo "📦 Namespace workshop-app does not exist yet"
fi

# Apply all resources
echo "🚀 Applying Kubernetes manifests..."
kubectl apply -k k8s/

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    
    # Check deployment status
    echo "📊 Checking deployment status..."
    kubectl get pods -n workshop-app
    kubectl get services -n workshop-app
else
    echo "❌ Deployment failed!"
    exit 1
fi