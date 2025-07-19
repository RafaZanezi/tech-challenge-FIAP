# Arquitetura DDD com Camadas

Este projeto implementa uma arquitetura em camadas seguindo os padrões do Domain-Driven Design (DDD).

## Estrutura de Pastas

```
src/
├── shared/                 # Código compartilhado entre módulos
│   ├── domain/            # Conceitos de domínio compartilhados
│   │   ├── entities/      # Entidades base
│   │   ├── value-objects/ # Value Objects base
│   │   ├── enums/         # Enums compartilhados
│   │   └── errors/        # Erros de domínio
│   ├── infrastructure/    # Infraestrutura compartilhada
│   │   ├── database/      # Configuração de banco de dados
│   │   └── http/          # Configuração HTTP
│   └── application/       # Aplicação compartilhada
│       ├── dtos/          # DTOs compartilhados
│       └── interfaces/    # Interfaces compartilhadas (Repository, UseCase)
├── modules/               # Módulos de domínio
│   ├── auth/             # Módulo de autenticação
│   ├── client/           # Módulo de clientes
│   ├── vehicle/          # Módulo de veículos
│   ├── service/          # Módulo de serviços
│   ├── supply/           # Módulo de suprimentos
│   └── service-order/    # Módulo de ordens de serviço
└── main/                 # Configuração principal da aplicação
    ├── factories/        # Factories para injeção de dependência
    ├── adapters/         # Adaptadores (Express, etc.)
    └── config/           # Configurações da aplicação
```

## Estrutura de cada Módulo

Cada módulo segue a estrutura de 4 camadas:

```
module/
├── domain/               # Camada de Domínio
│   ├── entities/        # Entidades do domínio
│   ├── value-objects/   # Value Objects
│   ├── repositories/    # Interfaces de repositórios
│   └── services/        # Serviços de domínio
├── application/         # Camada de Aplicação
│   ├── use-cases/      # Casos de uso
│   ├── dtos/           # Data Transfer Objects
│   └── services/       # Serviços de aplicação
├── infrastructure/     # Camada de Infraestrutura
│   ├── repositories/   # Implementações de repositórios
│   ├── services/       # Implementações de serviços externos
│   └── adapters/       # Adaptadores para APIs externas
└── presentation/       # Camada de Apresentação
    ├── controllers/    # Controllers HTTP
    ├── routes/         # Definição de rotas
    └── middlewares/    # Middlewares específicos do módulo
```

## Princípios da Arquitetura

### 1. Inversão de Dependência
- As camadas internas não conhecem as externas
- Domain ← Application ← Infrastructure ← Presentation
- Uso de interfaces para desacoplar implementações

### 2. Separação de Responsabilidades

**Domain (Domínio):**
- Regras de negócio puras
- Entidades e Value Objects
- Não depende de nenhuma tecnologia

**Application (Aplicação):**
- Casos de uso do sistema
- Coordena o fluxo de dados
- Define interfaces para repositórios

**Infrastructure (Infraestrutura):**
- Implementações técnicas
- Persistência de dados
- Serviços externos

**Presentation (Apresentação):**
- Interface com o usuário
- Controllers HTTP
- Rotas e middlewares

### 3. Domain-Driven Design

**Entidades:**
- Objetos com identidade única
- Encapsulam regras de negócio
- Mantêm estado consistente

**Value Objects:**
- Objetos sem identidade
- Imutáveis
- Representam conceitos do domínio

**Repositories:**
- Abstraem o acesso a dados
- Definidos no domínio, implementados na infraestrutura

**Use Cases:**
- Representam casos de uso do sistema
- Orquestram a execução das regras de negócio

## Exemplo: Módulo Client

### Entidade (Domain)
```typescript
// src/modules/client/domain/client.entity.ts
export class Client extends Entity<string> {
  private readonly props: ClientProps;
  
  constructor(props: ClientProps, id?: string) {
    super(id);
    this.validate(props);
    this.props = props;
  }
  
  // Getters e métodos de negócio
  isValidIdentifier(): boolean {
    // Lógica de validação
  }
}
```

### Use Case (Application)
```typescript
// src/modules/client/application/use-cases/create-client.use-case.ts
export class CreateClientUseCase implements UseCase<CreateClientRequest, CreateClientResponse> {
  constructor(private readonly clientRepository: ClientRepository) {}
  
  async execute(request: CreateClientRequest): Promise<CreateClientResponse> {
    // Lógica do caso de uso
  }
}
```

### Repository (Infrastructure)
```typescript
// src/modules/client/infrastructure/repositories/postgres-client.repository.ts
export class PostgresClientRepository implements ClientRepository {
  async save(entity: Client): Promise<Client> {
    // Implementação específica do PostgreSQL
  }
}
```

### Controller (Presentation)
```typescript
// src/modules/client/presentation/controllers/client.controller.ts
export class ClientController {
  constructor(private readonly createClientUseCase: CreateClientUseCase) {}
  
  async create(req: Request, res: Response): Promise<void> {
    // Lógica do controller HTTP
  }
}
```

## Injeção de Dependência

Utilizamos o padrão Factory para criar as dependências:

```typescript
// src/main/factories/client-controller.factory.ts
export function makeClientController(): ClientController {
  const clientRepository = new PostgresClientRepository();
  const createClientUseCase = new CreateClientUseCase(clientRepository);
  const clientController = new ClientController(createClientUseCase);
  
  return clientController;
}
```

## Fluxo de Dados

1. **Request** → Controller (Presentation)
2. **Controller** → Use Case (Application)
3. **Use Case** → Repository/Domain Services
4. **Repository** → Database (Infrastructure)
5. **Response** ← Controller ← Use Case ← Repository

## Vantagens desta Arquitetura

1. **Testabilidade**: Cada camada pode ser testada isoladamente
2. **Flexibilidade**: Fácil troca de implementações (ex: banco de dados)
3. **Manutenibilidade**: Código organizado e responsabilidades bem definidas
4. **Escalabilidade**: Novos módulos seguem o mesmo padrão
5. **Independência de Framework**: O domínio não depende de tecnologias específicas

## Comandos para Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm start

# Compilar TypeScript
npm run compile

# Executar linting
npm run lint
```

## Próximos Passos

1. Implementar os demais módulos (vehicle, service, supply, service-order)
2. Adicionar testes unitários e de integração
3. Implementar middlewares de autenticação
4. Adicionar validação de entrada com bibliotecas como Joi ou Zod
5. Implementar logging estruturado
6. Adicionar documentação da API (Swagger/OpenAPI)
