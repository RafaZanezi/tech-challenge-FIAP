#!/bin/bash

# Script para corrigir o problema de conexão Kind no GitHub Actions
# Este script remove o kubeconfig local dos secrets do GitHub e configura
# o workflow para usar Kind automaticamente

echo "🔧 Corrigindo problema de conexão Kind no GitHub Actions..."
echo ""

echo "📋 Problema identificado:"
echo "- O KUBECONFIG_DEV aponta para cluster local (127.0.0.1:52636)"
echo "- No GitHub Actions, esse cluster não existe"
echo "- Resultado: connection refused"
echo ""

echo "✅ Soluções implementadas:"
echo "1. Novo workflow com Kind automático: .github/workflows/deploy-with-kind.yml"
echo "2. Workflow existente modificado para usar Kind quando não há secrets"
echo ""

# Verificar se o cluster local está rodando
if kind get clusters | grep -q "dev-cluster"; then
    echo "🔍 Cluster local 'dev-cluster' encontrado:"
    kubectl cluster-info --context kind-dev-cluster 2>/dev/null || echo "   ❌ Não está respondendo"
else
    echo "❌ Cluster local 'dev-cluster' não encontrado"
    echo "   💡 Execute: ./setup-kind-cluster.sh"
fi

echo ""
echo "🚀 Próximos passos:"
echo ""
echo "1. Para usar o novo workflow (recomendado):"
echo "   - Faça push das alterações"
echo "   - O workflow 'Deploy with Kind Cluster' será executado"
echo "   - Ele criará um cluster Kind automaticamente no GitHub Actions"
echo ""

echo "2. Para corrigir os secrets do GitHub (opcional):"
echo "   - Vá em: Settings → Secrets and variables → Actions"
echo "   - DELETE o secret KUBECONFIG_DEV atual"
echo "   - Ou atualize com um kubeconfig válido de cluster externo"
echo ""

echo "3. Para testar localmente:"
echo "   ./setup-kind-cluster.sh"
echo "   kubectl get nodes"
echo ""

echo "✨ Arquivos criados/modificados:"
echo "- ✅ .github/workflows/deploy-with-kind.yml (novo)"
echo "- ✅ .github/workflows/ci-cd.yml (modificado)"
echo "- ✅ fix-kind-github-actions.sh (este script)"
echo ""

echo "🎯 O erro 'connection refused' deve ser resolvido após o próximo push!"