import { LogoutUserUseCase } from './logout-user.use-case';

describe('LogoutUserUseCase', () => {
    let logoutUserUseCase: LogoutUserUseCase;

    beforeEach(() => {
        logoutUserUseCase = new LogoutUserUseCase();
        process.env.JWT_EXPIRES = '3600'; // 1 hour in seconds
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('execute', () => {
        it('should successfully logout user and add token to blacklist', async () => {
            // Arrange
            const mockRequest = {
                headers: {
                    authorization: 'Bearer test-token-123'
                }
            };

            // Act
            const result = await logoutUserUseCase.execute(mockRequest);

            // Assert
            expect(result).toBe('Logout realizado com sucesso');
        });

        it('should handle token without Bearer prefix', async () => {
            // Arrange
            const mockRequest = {
                headers: {
                    authorization: 'Bearer another-test-token'
                }
            };

            // Act
            const result = await logoutUserUseCase.execute(mockRequest);

            // Assert
            expect(result).toBe('Logout realizado com sucesso');
        });

        it('should set timeout to remove token from blacklist', async () => {
            // Arrange
            jest.useFakeTimers();
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
            const mockRequest = {
                headers: {
                    authorization: 'Bearer timeout-test-token'
                }
            };

            // Act
            await logoutUserUseCase.execute(mockRequest);

            // Assert
            expect(setTimeoutSpy).toHaveBeenCalledWith(
                expect.any(Function),
                3600 * 1000
            );

            // Fast-forward time to verify timeout behavior
            jest.advanceTimersByTime(3600 * 1000);
            setTimeoutSpy.mockRestore();
        });

        it('should handle different JWT_EXPIRES values', async () => {
            // Arrange
            jest.useFakeTimers();
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
            process.env.JWT_EXPIRES = '7200'; // 2 hours
            const mockRequest = {
                headers: {
                    authorization: 'Bearer expires-test-token'
                }
            };

            // Act
            await logoutUserUseCase.execute(mockRequest);

            // Assert
            expect(setTimeoutSpy).toHaveBeenCalledWith(
                expect.any(Function),
                7200 * 1000
            );
            setTimeoutSpy.mockRestore();
        });
    });
});
