import { 
    verifyJWT, 
    requireAdmin, 
    addToBlacklist, 
    clearBlacklist, 
    AuthenticatedRequest 
} from './index';
import { UserRole } from '../../../domain/enums/user-role.enum';

describe('Middleware Index', () => {
    describe('Exports', () => {
        it('should export verifyJWT function', () => {
            expect(typeof verifyJWT).toBe('function');
        });

        it('should export requireAdmin function', () => {
            expect(typeof requireAdmin).toBe('function');
        });

        it('should export addToBlacklist function', () => {
            expect(typeof addToBlacklist).toBe('function');
        });

        it('should export clearBlacklist function', () => {
            expect(typeof clearBlacklist).toBe('function');
        });

        it('should export AuthenticatedRequest interface', () => {
            // Test that the interface exists by creating a mock object
            const mockRequest: Partial<AuthenticatedRequest> = {
                user: {
                    id: '1',
                    role: UserRole.ADMIN
                }
            };

            expect(mockRequest.user?.id).toBe('1');
            expect(mockRequest.user?.role).toBe(UserRole.ADMIN);
        });
    });

    describe('Functions exist and are callable', () => {
        it('should be able to call addToBlacklist', () => {
            expect(() => addToBlacklist('test-token')).not.toThrow();
        });

        it('should be able to call clearBlacklist', () => {
            expect(() => clearBlacklist()).not.toThrow();
        });
    });
});
