import { ErrorPresenter } from './error';

describe('ErrorPresenter', () => {
    let errorPresenter: ErrorPresenter;

    beforeEach(() => {
        errorPresenter = new ErrorPresenter();
    });

    describe('present', () => {
        it('should set status code to 500', () => {
            const error = new Error('Test error');

            errorPresenter.present(error);

            expect(errorPresenter.getStatusCode()).toBe(500);
        });

        it('should set response with error message', () => {
            const error = new Error('Test error message');

            errorPresenter.present(error);

            expect(errorPresenter.getResponse()).toEqual({
                success: false,
                message: 'Test error message'
            });
        });

        it('should handle error without message using empty string', () => {
            const error = new Error();

            errorPresenter.present(error);

            expect(errorPresenter.getResponse()).toEqual({
                success: false,
                message: ''
            });
        });

        it('should handle null message and use default', () => {
            const error = { message: null } as Error;

            errorPresenter.present(error);

            expect(errorPresenter.getResponse()).toEqual({
                success: false,
                message: 'Ocorreu um erro ao processar'
            });
        });

        it('should handle undefined message and use default', () => {
            const error = { message: undefined } as Error;

            errorPresenter.present(error);

            expect(errorPresenter.getResponse()).toEqual({
                success: false,
                message: 'Ocorreu um erro ao processar'
            });
        });

        it('should handle empty string message and use it', () => {
            const error = new Error('');

            errorPresenter.present(error);

            expect(errorPresenter.getResponse()).toEqual({
                success: false,
                message: ''
            });
        });

        it('should handle long error messages', () => {
            const longMessage = 'A'.repeat(1000);
            const error = new Error(longMessage);

            errorPresenter.present(error);

            expect(errorPresenter.getResponse()).toEqual({
                success: false,
                message: longMessage
            });
        });

        it('should handle special characters in error message', () => {
            const specialMessage = 'Error with special chars: ñáéíóú @#$%&*()';
            const error = new Error(specialMessage);

            errorPresenter.present(error);

            expect(errorPresenter.getResponse()).toEqual({
                success: false,
                message: specialMessage
            });
        });

        it('should be instance of BasePresenter', () => {
            expect(errorPresenter).toBeInstanceOf(ErrorPresenter);
            // Verifica herança através de propriedades disponíveis
            expect(typeof errorPresenter.getResponse).toBe('function');
            expect(typeof errorPresenter.getStatusCode).toBe('function');
        });
    });
});