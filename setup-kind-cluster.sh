#!/bin/bash

# Script para configurar cluster Kind local para desenvolvimento
# Execute este script para configurar o ambiente K8s local

echo "🚀 Configurando cluster Kind para desenvolvimento..."

# 1. Verificar se Kind está instalado
if ! command -v kind &> /dev/null; then
    echo "❌ Kind não encontrado. Instalando..."
    
    # Detectar sistema operacional
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo "📦 Instalando Kind via Homebrew..."
            brew install kind
        else
            echo "❌ Homebrew não encontrado. Por favor, instale o Kind manualmente:"
            echo "https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "📦 Instalando Kind no Linux..."
        curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
        chmod +x ./kind
        sudo mv ./kind /usr/local/bin/kind
    else
        echo "❌ Sistema operacional não suportado. Instale o Kind manualmente:"
        echo "https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
        exit 1
    fi
fi

# 2. Verificar se kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl não encontrado. Por favor, instale o kubectl:"
    echo "https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# 3. Criar cluster Kind
echo "🔧 Criando cluster Kind..."
kind create cluster --name workshop-cluster --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF

# 4. Verificar se cluster está rodando
echo "✅ Verificando cluster..."
kubectl cluster-info --context kind-workshop-cluster

# 5. Gerar kubeconfig para GitHub Secrets
echo ""
echo "📋 Para configurar o GitHub Actions, use este kubeconfig:"
echo "---"
kubectl config view --raw --context kind-workshop-cluster | base64 | tr -d '\n'
echo ""
echo "---"
echo ""
echo "🔧 Passos para configurar o GitHub:"
echo "1. Copie o kubeconfig acima (base64 encoded)"
echo "2. Vá em: Repositório → Settings → Secrets and variables → Actions"
echo "3. Adicione o secret: KUBECONFIG_DEV com o valor copiado"
echo ""
echo "🚀 Cluster local configurado com sucesso!"
echo "🎯 Para testar o deploy localmente:"
echo "   cd k8s && ./deploy.sh"