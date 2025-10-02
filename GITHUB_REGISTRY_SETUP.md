# Configuração do GitHub Container Registry (GHCR)

## Problema Identificado
O erro `denied: installation not allowed to Create organization package` ocorre quando o GitHub Actions não tem permissões adequadas para push de imagens Docker no GitHub Container Registry.

## Soluções Implementadas no Workflow

### 1. Permissões Adicionadas
- Adicionadas permissões globais no workflow: `contents: read`, `packages: write`, `security-events: write`
- Adicionadas permissões específicas no job `build-docker`

### 2. Configurações Ajustadas
- Username alterado de `github.actor` para `github.repository_owner`
- Nome da imagem ajustado para evitar problemas de case sensitivity

## Configurações Necessárias no GitHub

### 1. Configurações do Repositório

#### A. Habilitar GitHub Container Registry
1. Vá para: **Settings** → **Actions** → **General**
2. Em "Workflow permissions", selecione: **Read and write permissions**
3. Marque: **Allow GitHub Actions to create and approve pull requests**

#### B. Configurar Package Settings
1. Vá para: **Settings** → **Actions** → **General**
2. Em "Fork pull request workflows", habilite as opções necessárias

### 2. Configurações de Package Visibility (Após primeiro push bem-sucedido)

Após o primeiro push bem-sucedido, você precisará configurar a visibilidade do package:

1. Vá para: **Packages** (na sua página do GitHub)
2. Encontre o package `tech-challenge-fiap`
3. Clique em **Package settings**
4. Configure a visibilidade conforme necessário (Public/Private)
5. Em **Manage Actions access**, certifique-se de que o repositório tem permissão de escrita

### 3. Verificações de Permissões

#### Verificar se o token tem as permissões corretas:
```bash
# O GITHUB_TOKEN deve ter estas permissões:
# - contents: read
# - packages: write
# - metadata: read
```

### 4. Comandos para Teste Local (Opcional)

Para testar localmente, você pode usar:

```bash
# 1. Fazer login no GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 2. Build da imagem
docker build -t ghcr.io/rafazanezi/tech-challenge-fiap:teste .

# 3. Push da imagem
docker push ghcr.io/rafazanezi/tech-challenge-fiap:teste
```

### 5. Solução Alternativa (Se o problema persistir)

Se as configurações acima não resolverem, considere criar um Personal Access Token:

1. Vá para: **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. Crie um token com as seguintes permissões:
   - Repository access: Selected repositories (seu repo)
   - Repository permissions: Contents (Read), Metadata (Read), Packages (Write)
3. Adicione o token como secret no repositório: `Settings` → `Secrets and variables` → `Actions`
4. Use o token no lugar do `GITHUB_TOKEN`:

```yaml
- name: Log in to Container Registry
  uses: docker/login-action@v3
  with:
    registry: ${{ env.REGISTRY }}
    username: ${{ github.repository_owner }}
    password: ${{ secrets.PERSONAL_GITHUB_TOKEN }}  # Use seu token personalizado
```

## Verificação de Sucesso

Após aplicar essas configurações, o workflow deve:
1. ✅ Fazer login no GHCR com sucesso
2. ✅ Fazer build da imagem Docker
3. ✅ Fazer push da imagem para `ghcr.io/rafazanezi/tech-challenge-fiap:fase-2`

## Troubleshooting Adicional

### Se ainda houver problemas:

1. **Verifique os logs detalhados** do GitHub Actions
2. **Confirme que o repositório não está em uma organização** que bloqueia packages
3. **Teste com uma branch diferente** para descartar problemas específicos da branch
4. **Verifique se há policies organizacionais** que podem estar bloqueando

### Logs úteis para debug:
```bash
# No step de login, adicione debug:
- name: Debug GitHub Context
  run: |
    echo "Actor: ${{ github.actor }}"
    echo "Repository Owner: ${{ github.repository_owner }}"
    echo "Repository: ${{ github.repository }}"
    echo "Event Name: ${{ github.event_name }}"
```