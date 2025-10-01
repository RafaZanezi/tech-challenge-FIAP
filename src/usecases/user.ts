import jwt from 'jsonwebtoken';
import { User, UserRole } from "../entities/auth-user";
import { UserGatewayInterface } from "../interfaces/gateways";
import { ConflictError, ValidationError } from "./errors/errors";
import { NotFoundHttpError, UnauthorizedError } from "../api/errors/http-errors";

export class UserUseCases {
    constructor(private userGateway: UserGatewayInterface) {}

    async registerUser(name: string, password: string, role: string): Promise<{ user: User; token: string }> {
        // Validar role
        if (!Object.values(UserRole).includes(role as UserRole)) {
            throw new ValidationError('Função do usuário inválida');
        }

        // Verificar se usuário já existe
        const existingUser = await this.userGateway.findByName(name);
        if (existingUser) {
            throw new ConflictError('Usuário com este nome já existe');
        }

        // Criar novo usuário
        const user = new User({
            name,
            password,
            role: role as UserRole
        });

        // Hash da senha
        await user.hashPassword();

        // Salvar no banco
        const savedUserDTO = await this.userGateway.insert(user);
        
        // Criar instância do usuário com ID
        const newUser = new User({
            name: savedUserDTO.name,
            password: savedUserDTO.password,
            role: savedUserDTO.role as UserRole
        }, savedUserDTO.id);

        // Gerar token JWT
        const token = this.generateToken(newUser);

        return { user: newUser, token };
    }

    async loginUser(name: string, password: string): Promise<{ user: User; token: string }> {
        // Buscar usuário
        const userDTO = await this.userGateway.findByName(name);
        if (!userDTO) {
            throw new UnauthorizedError('Credenciais inválidas');
        }

        // Criar instância do usuário
        const user = new User({
            name: userDTO.name,
            password: userDTO.password,
            role: userDTO.role as UserRole
        }, userDTO.id);

        // Verificar senha
        const isPasswordValid = await user.verifyPassword(password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Credenciais inválidas');
        }

        // Gerar token JWT
        const token = this.generateToken(user);

        return { user, token };
    }

    async getUserById(id: number): Promise<User> {
        const userDTO = await this.userGateway.findById(id);
        if (!userDTO) {
            throw new NotFoundHttpError('Usuário');
        }

        return new User({
            name: userDTO.name,
            password: userDTO.password,
            role: userDTO.role as UserRole
        }, userDTO.id);
    }

    private generateToken(user: User): string {
        const payload = {
            id: user.id,
            role: user.role
        };

        return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
            expiresIn: '24h'
        });
    }
}