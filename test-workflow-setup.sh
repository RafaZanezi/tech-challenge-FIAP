#!/bin/bash

echo "🧪 Testando configuração do workflow Kind..."

# Verificar se os arquivos necessários existem
echo "📁 Verificando arquivos necessários:"
for file in "k8s/namespace.yaml" "k8s/secret.yaml" "k8s/configmap.yaml" "k8s/postgres.yaml" "k8s/deployment.yaml" "k8s/service.yaml" "k8s/kustomization.yaml" "Dockerfile"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (AUSENTE)"
    fi
done

echo ""
echo "🐳 Verificando Dockerfile..."
if [ -f "Dockerfile" ]; then
    echo "✅ Dockerfile encontrado"
    echo "📄 Primeiras linhas:"
    head -5 Dockerfile
else
    echo "❌ Dockerfile não encontrado"
fi

echo ""
echo "🔧 Verificando kustomization.yaml..."
if [ -f "k8s/kustomization.yaml" ]; then
    echo "✅ kustomization.yaml encontrado"
    echo "📄 Configuração de imagem:"
    grep -A 3 "images:" k8s/kustomization.yaml
else
    echo "❌ kustomization.yaml não encontrado"
fi

echo ""
echo "📦 Verificando package.json..."
if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
    echo "📄 Scripts disponíveis:"
    grep -A 10 '"scripts"' package.json | grep -E '"(build|test|start)":' || echo "Scripts básicos não encontrados"
else
    echo "❌ package.json não encontrado"
fi

echo ""
echo "🗄️ Verificando migrations..."
if [ -f "migrations/001_initial_schema.sql" ]; then
    echo "✅ Migration inicial encontrada"
else
    echo "❌ Migration inicial não encontrada"
fi

echo ""
echo "🚀 Status geral:"
if [ -f "Dockerfile" ] && [ -f "k8s/kustomization.yaml" ] && [ -f "package.json" ]; then
    echo "✅ Configuração básica OK - Workflow deve funcionar"
else
    echo "⚠️  Alguns arquivos estão ausentes - Workflow pode falhar"
fi

echo ""
echo "💡 Próximo passo: git push para testar o workflow"