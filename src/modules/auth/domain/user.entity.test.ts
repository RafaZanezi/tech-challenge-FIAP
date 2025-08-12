import { User, UserProps } from './user.entity';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import { ValidationError } from '../../../shared/domain/errors/domain-errors';

describe('User Entity', () => {
    describe('Valid User Creation', () => {
        it('should create a user with valid properties', () => {
            const userProps: UserProps = {
                id: 1,
                name: 'João Silva',
                role: UserRole.MECHANIC
            };

            const user = new User(userProps);

            expect(user.id).toBe(1);
            expect(user.name).toBe('João Silva');
            expect(user.role).toBe(UserRole.MECHANIC);
        });

        it('should create an admin user', () => {
            const userProps: UserProps = {
                id: 2,
                name: 'Admin User',
                role: UserRole.ADMIN
            };

            const user = new User(userProps);

            expect(user.id).toBe(2);
            expect(user.name).toBe('Admin User');
            expect(user.role).toBe(UserRole.ADMIN);
        });

        it('should create user with optional id parameter', () => {
            const userProps: UserProps = {
                id: 1,
                name: 'Test User',
                role: UserRole.MECHANIC
            };

            const user = new User(userProps, 5);

            expect(user.id).toBe(1);
            expect(user.name).toBe('Test User');
            expect(user.role).toBe(UserRole.MECHANIC);
        });
    });

    describe('User Validation', () => {
        it('should throw ValidationError when name is empty', () => {
            const userProps: UserProps = {
                id: 1,
                name: '',
                role: UserRole.MECHANIC
            };

            expect(() => new User(userProps)).toThrow(ValidationError);
            expect(() => new User(userProps)).toThrow('Nome do usuário é obrigatório');
        });

        it('should throw ValidationError when name is null', () => {
            const userProps: UserProps = {
                id: 1,
                name: null as any,
                role: UserRole.MECHANIC
            };

            expect(() => new User(userProps)).toThrow(ValidationError);
            expect(() => new User(userProps)).toThrow('Nome do usuário é obrigatório');
        });

        it('should throw ValidationError when name is undefined', () => {
            const userProps: UserProps = {
                id: 1,
                name: undefined as any,
                role: UserRole.MECHANIC
            };

            expect(() => new User(userProps)).toThrow(ValidationError);
            expect(() => new User(userProps)).toThrow('Nome do usuário é obrigatório');
        });

        it('should throw ValidationError when name is only whitespace', () => {
            const userProps: UserProps = {
                id: 1,
                name: '   ',
                role: UserRole.MECHANIC
            };

            expect(() => new User(userProps)).toThrow(ValidationError);
            expect(() => new User(userProps)).toThrow('Nome do usuário é obrigatório');
        });

        it('should throw ValidationError when role is invalid', () => {
            const userProps: UserProps = {
                id: 1,
                name: 'Test User',
                role: 'INVALID_ROLE' as any
            };

            expect(() => new User(userProps)).toThrow(ValidationError);
            expect(() => new User(userProps)).toThrow('Função do usuário inválida');
        });

        it('should throw ValidationError when role is null', () => {
            const userProps: UserProps = {
                id: 1,
                name: 'Test User',
                role: null as any
            };

            expect(() => new User(userProps)).toThrow(ValidationError);
            expect(() => new User(userProps)).toThrow('Função do usuário inválida');
        });

        it('should throw ValidationError when role is undefined', () => {
            const userProps: UserProps = {
                id: 1,
                name: 'Test User',
                role: undefined as any
            };

            expect(() => new User(userProps)).toThrow(ValidationError);
            expect(() => new User(userProps)).toThrow('Função do usuário inválida');
        });
    });

    describe('toJSON', () => {
        it('should return correct JSON representation', () => {
            const userProps: UserProps = {
                id: 1,
                name: 'João Silva',
                role: UserRole.ADMIN
            };

            const user = new User(userProps, 1);
            const json = user.toJSON();

            expect(json).toEqual({
                id: 1,
                name: 'João Silva',
                role: UserRole.ADMIN
            });
        });

        it('should return JSON with all properties', () => {
            const userProps: UserProps = {
                id: 123,
                name: 'User Test',
                role: UserRole.MECHANIC
            };

            const user = new User(userProps, 123);
            const json = user.toJSON();

            expect(json.id).toBe(123);
            expect(json.name).toBe('User Test');
            expect(json.role).toBe(UserRole.MECHANIC);
            expect(Object.keys(json)).toHaveLength(3);
        });
    });
});
