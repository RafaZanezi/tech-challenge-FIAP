import * as bcrypt from 'bcrypt';
import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { BadRequestError, ConflictHttpError } from '../../../../shared/domain/errors/http-errors';
import { PostgresAuthRepository } from '../../infrastructure/repositories/postgres-auth.repository';
import { CreateUserRequest, CreateUserResponse } from '../dtos/create-user.dto';

export class CreateUserUseCase implements UseCase<CreateUserRequest, CreateUserResponse> {
    constructor(private readonly userRepository: PostgresAuthRepository) { }

    public async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
        const { name, role, password } = request;

        if (!name || !role || !password) {
            throw new BadRequestError('Nome, função e senha são obrigatórios');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        try {
            const user = await this.userRepository.registerUser(name, hashedPassword, role);
            return {
                id: user.id || 0,
                name: user.name || name,
                role: user.role || role
            };
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw new ConflictHttpError('Falha ao criar usuário');
        }
    }
}
