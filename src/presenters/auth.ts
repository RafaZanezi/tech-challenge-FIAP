import { BasePresenter } from './base-presenter';
import { User } from '../entities/auth-user';

export class AuthPresenter extends BasePresenter {
    
    present(data: any): void {
        this.statusCode = 200;
        this.response = data;
    }

    presentLogin(user: User, token: string): void {
        this.statusCode = 200;
        this.response = {
            message: 'Login realizado com sucesso',
            data: {
                user: user.toJSON(),
                token: token
            }
        };
    }

    presentRegister(user: User, token: string): void {
        this.statusCode = 201;
        this.response = {
            message: 'Usuário criado com sucesso',
            data: {
                user: user.toJSON(),
                token: token
            }
        };
    }

    presentLogout(): void {
        this.statusCode = 200;
        this.response = {
            message: 'Logout realizado com sucesso'
        };
    }

    presentProfile(user: User): void {
        this.statusCode = 200;
        this.response = {
            message: 'Perfil do usuário',
            data: user.toJSON()
        };
    }

    presentBadRequest(message: string): void {
        this.statusCode = 400;
        this.response = {
            message: message
        };
    }

    presentUnauthorized(message: string): void {
        this.statusCode = 401;
        this.response = {
            message: message
        };
    }
}