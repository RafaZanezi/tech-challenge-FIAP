# Sistema de Erros HTTP Personalizados

## 📋 Resumo

Implementei um sistema completo de erros HTTP personalizados para o seu projeto que permite:

1. **Erros com status code e mensagem personalizados**
2. **Manipulação centralizada de erros**
3. **Conversão automática de erros de domínio para HTTP**
4. **Respostas JSON estruturadas**

## 🔧 Como Usar

### 1. Nos Use Cases

```typescript
import { BadRequestError, ConflictHttpError } from '../../../shared/domain/errors/http-errors';

export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Validação - lança erro 400
    if (!request.name) {
      throw new BadRequestError('Name is required');
    }

    // Conflito - lança erro 409
    const existingUser = await this.repository.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictHttpError('User already exists');
    }

    // ... resto da lógica
  }
}
```

### 2. Nos Controllers

```typescript
import { Request, Response, NextFunction } from 'express';

export class AuthController {
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      // Automaticamente encaminha para o error handler global
      next(error);
    }
  }
}
```

### 3. Usando AsyncResult (Opcional)

```typescript
import { AsyncResult } from '../../../shared/domain/utils/async-result';

export class SomeService {
  async createSomething(data: any) {
    const result = await AsyncResult.execute(
      this.repository.create(data)
    );

    if (!result.success) {
      // result.error é um HttpError com statusCode e message
      throw result.error;
    }

    return result.data;
  }
}
```

## 📤 Formato das Respostas de Erro

Todas as respostas de erro seguem este formato padronizado:

```json
{
  "error": {
    "name": "BadRequestError",
    "message": "Name is required",
    "statusCode": 400,
    "timestamp": "2025-07-19T10:30:00.000Z",
    "path": "/api/users"
  }
}
```

## 🎯 Tipos de Erro Disponíveis

| Classe | Status Code | Quando Usar |
|--------|-------------|-------------|
| `BadRequestError` | 400 | Dados de entrada inválidos |
| `UnauthorizedError` | 401 | Usuário não autenticado |
| `ForbiddenError` | 403 | Usuário sem permissão |
| `NotFoundHttpError` | 404 | Recurso não encontrado |
| `ConflictHttpError` | 409 | Conflito (ex: email já existe) |
| `UnprocessableEntityError` | 422 | Dados válidos mas não processáveis |
| `InternalServerError` | 500 | Erro interno do servidor |

## 🔄 Conversão Automática

Erros de domínio são automaticamente convertidos para HTTP:

```typescript
// Erro de domínio
throw new ValidationError('Invalid email format');

// Automaticamente vira BadRequestError (400)
```

## ✅ Exemplo Completo Funcionando

No seu `create-user.use-case.ts`:

```typescript
import { BadRequestError, ConflictHttpError } from '../../../../../shared/domain/errors/http-errors';

export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const { name, role, password } = request;

    // Lança erro 400 se dados inválidos
    if (!name || !role || !password) {
      throw new BadRequestError('Name, role, and password are required');
    }

    // Simular verificação de conflito
    // throw new ConflictHttpError('User already exists');

    // ... resto da implementação
  }
}
```

## 🚀 Testando

Faça uma requisição POST para `/api/users` sem os campos obrigatórios:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{}'
```

Resposta esperada:
```json
{
  "error": {
    "name": "BadRequestError",
    "message": "Name, role, and password are required",
    "statusCode": 400,
    "timestamp": "2025-07-19T10:30:00.000Z",
    "path": "/api/users"
  }
}
```

## 🔧 Configuração

O error handler está configurado automaticamente no `app.ts` como último middleware.
