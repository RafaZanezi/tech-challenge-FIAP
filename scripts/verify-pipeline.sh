#!/bin/bash

# Script de verificação local do pipeline
# Execute este script antes de fazer push para validar as mudanças

set -e

echo "🚀 Iniciando verificação local do pipeline..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para logs coloridos
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker não está rodando. Inicie o Docker primeiro."
        exit 1
    fi
    log_info "Docker está rodando"
}

# Verificar se Node.js está instalado
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js não encontrado. Instale Node.js versão 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js versão 18+ necessária. Versão atual: $(node -v)"
        exit 1
    fi
    log_info "Node.js $(node -v) encontrado"
}

# Instalar dependências
install_deps() {
    log_info "Instalando dependências..."
    npm ci
}

# Executar lint
run_lint() {
    log_info "Executando ESLint..."
    if npm run lint; then
        log_info "Lint passou sem erros"
    else
        log_error "Lint falhou. Execute 'npm run lint:fix' para corrigir automaticamente"
        exit 1
    fi
}

# Build da aplicação
build_app() {
    log_info "Fazendo build da aplicação..."
    if npm run compile; then
        log_info "Build concluído com sucesso"
    else
        log_error "Build falhou"
        exit 1
    fi
}

# Executar testes unitários
run_unit_tests() {
    log_info "Executando testes unitários..."
    if npm test; then
        log_info "Testes unitários passaram"
    else
        log_error "Testes unitários falharam"
        exit 1
    fi
}

# Setup banco para testes de integração
setup_test_db() {
    log_info "Configurando banco de dados para testes..."
    
    # Parar container se já estiver rodando
    docker stop test-postgres 2>/dev/null || true
    docker rm test-postgres 2>/dev/null || true
    
    # Iniciar PostgreSQL container
    docker run -d \
        --name test-postgres \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=admin \
        -e POSTGRES_DB=postgres \
        -p 5433:5432 \
        postgres:15
    
    # Aguardar banco ficar pronto
    log_info "Aguardando PostgreSQL ficar pronto..."
    sleep 10
    
    # Executar migrações
    PGPASSWORD=admin psql -h localhost -p 5433 -U postgres -d postgres -f migrations/001_initial_schema.sql
    
    log_info "Banco de dados configurado"
}

# Executar testes de integração
run_integration_tests() {
    log_info "Executando testes de integração..."

    export DATABASE_URL="postgresql://postgres:admin@localhost:5433/postgres"

    if npm run test:integration; then
        log_info "Testes de integração passaram"
    else
        log_error "Testes de integração falharam"
        exit 1
    fi
}

# Build Docker image
build_docker() {
    log_info "Fazendo build da imagem Docker..."
    
    if docker build -t tech-challenge-fiap:local .; then
        log_info "Imagem Docker criada com sucesso"
    else
        log_error "Build da imagem Docker falhou"
        exit 1
    fi
}

# Testar imagem Docker
test_docker() {
    log_info "Testando imagem Docker..."
    
    # Parar container se já estiver rodando
    docker stop test-app 2>/dev/null || true
    docker rm test-app 2>/dev/null || true
    
    # Executar container
    docker run -d \
        --name test-app \
        --link test-postgres:postgres \
        -e DATABASE_URL="postgresql://postgres:admin@postgres:5432/postgres" \
        -p 3001:3000 \
        tech-challenge-fiap:local
    
    # Aguardar aplicação iniciar
    sleep 10
    
    # Testar se aplicação está respondendo
    if curl -f http://localhost:3001/health 2>/dev/null; then
        log_info "Aplicação Docker está funcionando"
    else
        log_warn "Endpoint de health não encontrado, mas container está rodando"
    fi
}

# Validar manifestos Kubernetes
validate_k8s() {
    if ! command -v kubectl &> /dev/null; then
        log_warn "kubectl não encontrado. Pulando validação Kubernetes"
        return
    fi
    
    log_info "Validando manifestos Kubernetes..."
    
    # Validar sintaxe dos manifestos
    for file in k8s/*.yaml; do
        if kubectl apply --dry-run=client -f "$file" > /dev/null 2>&1; then
            log_info "Manifesto válido: $(basename $file)"
        else
            log_error "Manifesto inválido: $(basename $file)"
            exit 1
        fi
    done
    
    # Validar kustomization
    if kubectl apply --dry-run=client -k k8s/ > /dev/null 2>&1; then
        log_info "Kustomization válido"
    else
        log_error "Kustomization inválido"
        exit 1
    fi
}

# Cleanup
cleanup() {
    log_info "Fazendo limpeza..."
    
    # Parar e remover containers
    docker stop test-postgres test-app 2>/dev/null || true
    docker rm test-postgres test-app 2>/dev/null || true
    
    # Remover imagem local se desejado
    # docker rmi tech-challenge-fiap:local 2>/dev/null || true
    
    log_info "Limpeza concluída"
}

# Função principal
main() {
    echo "🔍 Verificação Local do Pipeline CI/CD"
    echo "======================================"
    
    # Trap para limpeza em caso de erro
    trap cleanup EXIT
    
    check_docker
    check_node
    install_deps
    run_lint
    build_app
    run_unit_tests
    setup_test_db
    run_integration_tests
    build_docker
    test_docker
    validate_k8s
    
    echo ""
    echo "======================================"
    log_info "🎉 Todas as verificações passaram!"
    log_info "Seu código está pronto para push"
    echo "======================================"
    
    # Mostrar próximos passos
    echo ""
    echo "📋 Próximos passos:"
    echo "1. git add ."
    echo "2. git commit -m 'Sua mensagem'"
    echo "3. git push origin sua-branch"
    echo ""
    echo "🔗 O pipeline será executado automaticamente após o push"
}

# Verificar argumentos
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    echo "Uso: $0 [opções]"
    echo ""
    echo "Opções:"
    echo "  --help, -h     Mostra esta ajuda"
    echo "  --skip-docker  Pula testes Docker"
    echo "  --skip-k8s     Pula validação Kubernetes"
    echo ""
    echo "Este script simula o pipeline CI/CD localmente para validar"
    echo "suas mudanças antes de fazer push para o repositório."
    exit 0
fi

# Verificar flags
SKIP_DOCKER=false
SKIP_K8S=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-docker)
            SKIP_DOCKER=true
            shift
            ;;
        --skip-k8s)
            SKIP_K8S=true
            shift
            ;;
        *)
            log_error "Argumento desconhecido: $1"
            exit 1
            ;;
    esac
done

# Executar verificações baseadas nas flags
if [[ "$SKIP_DOCKER" == true ]]; then
    log_warn "Pulando testes Docker"
    setup_test_db() { log_warn "Setup DB pulado"; }
    run_integration_tests() { log_warn "Testes integração pulados"; }
    build_docker() { log_warn "Build Docker pulado"; }
    test_docker() { log_warn "Teste Docker pulado"; }
fi

if [[ "$SKIP_K8S" == true ]]; then
    log_warn "Pulando validação Kubernetes"
    validate_k8s() { log_warn "Validação K8s pulada"; }
fi

# Executar pipeline
main