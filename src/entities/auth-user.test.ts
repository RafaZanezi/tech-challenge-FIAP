import { User, UserRole } from '../entities/auth-user';
import bcrypt from 'bcrypt';

describe('Auth User Entity', () => {
    it('should create a user with valid data', () => {
        const userData = {
            name: 'Test User',
            password: 'password123',
            role: UserRole.ADMIN
        };

        const user = new User(userData, 1);

        expect(user.name).toBe(userData.name);
        expect(user.role).toBe(userData.role);
        expect(user.id).toBe(1);
    });

    it('should hash password correctly', async () => {
        const userData = {
            name: 'Test User',
            password: 'password123',
            role: UserRole.ADMIN
        };

        const user = new User(userData);
        const originalPassword = user.password;
        
        await user.hashPassword();
        
        expect(user.password).not.toBe(originalPassword);
        expect(user.password.length).toBeGreaterThan(originalPassword.length);
    });

    it('should verify password correctly', async () => {
        const userData = {
            name: 'Test User',
            password: 'password123',
            role: UserRole.ADMIN
        };

        const user = new User(userData);
        await user.hashPassword();
        
        const isValid = await user.verifyPassword('password123');
        const isInvalid = await user.verifyPassword('wrongpassword');
        
        expect(isValid).toBe(true);
        expect(isInvalid).toBe(false);
    });

    it('should throw error for invalid data', () => {
        expect(() => {
            new User({
                name: '',
                password: 'password123',
                role: UserRole.ADMIN
            });
        }).toThrow('Nome do usuário é obrigatório');

        expect(() => {
            new User({
                name: 'Test User',
                password: '123',
                role: UserRole.ADMIN
            });
        }).toThrow('Senha deve ter pelo menos 6 caracteres');
    });

    it('should not include password in JSON output', () => {
        const userData = {
            name: 'Test User',
            password: 'password123',
            role: UserRole.ADMIN
        };

        const user = new User(userData, 1);
        const json = user.toJSON();

        expect((json as any).password).toBeUndefined();
        expect(json.name).toBe(userData.name);
        expect(json.role).toBe(userData.role);
        expect(json.id).toBe(1);
    });
});