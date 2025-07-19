import jwt from 'jsonwebtoken';
import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';
import { BadRequestError } from '../../../../shared/domain/errors/http-errors';
import { PostgresAuthRepository } from '../../infrastructure/repositories/postgres-auth.repository';
import { LoginUserRequest, LoginUserResponse } from '../login.dto';

export class LoginUserUseCase implements UseCase<LoginUserRequest, LoginUserResponse> {
    constructor(private readonly userRepository: PostgresAuthRepository) { }

    public async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
        const { name, password } = request;

        if (!name || !password) {
            throw new BadRequestError('Informe nome e senha para fazer login');
        }

        const user = await this.userRepository.loginUser(name, password);

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: parseInt(process.env.JWT_EXPIRES)
        });

        return {
            ...user,
            token
        } as LoginUserResponse;
    }
}
