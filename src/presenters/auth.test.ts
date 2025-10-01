import { AuthPresenter } from './auth';
import { User, UserRole } from '../entities/auth-user';

describe('AuthPresenter', () => {
    let presenter: AuthPresenter;

    beforeEach(() => {
        presenter = new AuthPresenter();
    });

    describe('presentLogin', () => {
        it('should present successful login with user and token', () => {
            const user = new User({
                name: 'testuser',
                password: 'hashedpassword',
                role: UserRole.ADMIN
            }, 1);
            const token = 'mock-jwt-token';

            presenter.presentLogin(user, token);

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toEqual({
                message: 'Login realizado com sucesso',
                data: {
                    user: {
                        id: 1,
                        name: 'testuser',
                        role: UserRole.ADMIN
                    },
                    token: 'mock-jwt-token'
                }
            });
        });

        it('should present successful login for mechanic user', () => {
            const user = new User({
                name: 'mechanic',
                password: 'hashedpassword',
                role: UserRole.MECHANIC
            });
            const token = 'mechanic-token';

            presenter.presentLogin(user, token);

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toEqual({
                message: 'Login realizado com sucesso',
                data: {
                    user: {
                        id: undefined,
                        name: 'mechanic',
                        role: UserRole.MECHANIC
                    },
                    token: 'mechanic-token'
                }
            });
        });
    });

    describe('presentRegister', () => {
        it('should present successful registration with user and token', () => {
            const user = new User({
                name: 'newuser',
                password: 'hashedpassword',
                role: UserRole.MECHANIC
            }, 2);
            const token = 'registration-token';

            presenter.presentRegister(user, token);

            expect(presenter.getStatusCode()).toBe(201);
            expect(presenter.getResponse()).toEqual({
                message: 'Usuário criado com sucesso',
                data: {
                    user: {
                        id: 2,
                        name: 'newuser',
                        role: UserRole.MECHANIC
                    },
                    token: 'registration-token'
                }
            });
        });

        it('should present successful registration for admin user', () => {
            const adminUser = new User({
                name: 'admin',
                password: 'hashedpassword',
                role: UserRole.ADMIN
            }, 1);
            const token = 'admin-token';

            presenter.presentRegister(adminUser, token);

            expect(presenter.getStatusCode()).toBe(201);
            expect(presenter.getResponse()).toEqual({
                message: 'Usuário criado com sucesso',
                data: {
                    user: {
                        id: 1,
                        name: 'admin',
                        role: UserRole.ADMIN
                    },
                    token: 'admin-token'
                }
            });
        });
    });

    describe('presentProfile', () => {
        it('should present user profile', () => {
            const user = new User({
                name: 'testuser',
                password: 'hashedpassword',
                role: UserRole.ADMIN
            }, 1);

            presenter.presentProfile(user);

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toEqual({
                message: 'Perfil do usuário',
                data: {
                    id: 1,
                    name: 'testuser',
                    role: UserRole.ADMIN
                }
            });
        });
    });

    describe('presentLogout', () => {
        it('should present successful logout', () => {
            presenter.presentLogout();

            expect(presenter.getStatusCode()).toBe(200);
            expect(presenter.getResponse()).toEqual({
                message: 'Logout realizado com sucesso'
            });
        });
    });

    describe('presentBadRequest', () => {
        it('should present bad request error', () => {
            const errorMessage = 'Dados inválidos';

            presenter.presentBadRequest(errorMessage);

            expect(presenter.getStatusCode()).toBe(400);
            expect(presenter.getResponse()).toEqual({
                message: 'Dados inválidos'
            });
        });
    });

    describe('presentUnauthorized', () => {
        it('should present unauthorized error', () => {
            const errorMessage = 'Acesso negado';

            presenter.presentUnauthorized(errorMessage);

            expect(presenter.getStatusCode()).toBe(401);
            expect(presenter.getResponse()).toEqual({
                message: 'Acesso negado'
            });
        });
    });
});