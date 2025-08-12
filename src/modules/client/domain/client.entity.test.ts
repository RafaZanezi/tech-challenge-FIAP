import { Client, ClientProps } from './client.entity';
import { ValidationError } from '../../../shared/domain/errors/domain-errors';

describe('Client Entity', () => {
    const validCPF = '11144477735'; // CPF válido para testes

    describe('Valid Client Creation', () => {
        it('should create a client with valid properties', () => {
            const clientProps: ClientProps = {
                name: 'João Silva',
                identifier: validCPF
            };

            const client = new Client(clientProps, 1);

            expect(client.name).toBe('João Silva');
            expect(client.identifier).toBe(validCPF);
        });

        it('should throw ValidationError when name is empty', () => {
            const clientProps: ClientProps = {
                name: '',
                identifier: validCPF
            };

            expect(() => new Client(clientProps)).toThrow(new ValidationError('Nome do cliente é obrigatório'));
        });

        it('should throw ValidationError when name is whitespace only', () => {
            const clientProps: ClientProps = {
                name: '   ',
                identifier: validCPF
            };

            expect(() => new Client(clientProps)).toThrow(new ValidationError('Nome do cliente é obrigatório'));
        });

        it('should throw ValidationError when identifier is empty', () => {
            const clientProps: ClientProps = {
                name: 'João Silva',
                identifier: ''
            };

            expect(() => new Client(clientProps)).toThrow(new ValidationError('Identificador do cliente é obrigatório'));
        });

        it('should throw ValidationError when identifier is whitespace only', () => {
            const clientProps: ClientProps = {
                name: 'João Silva',
                identifier: '   '
            };

            expect(() => new Client(clientProps)).toThrow(new ValidationError('Identificador do cliente é obrigatório'));
        });

        it('should throw ValidationError when identifier format is invalid', () => {
            const clientProps: ClientProps = {
                name: 'João Silva',
                identifier: '12345678901' // CPF inválido
            };

            expect(() => new Client(clientProps)).toThrow(new ValidationError('Formato do identificador do cliente inválido'));
        });

        it('should throw ValidationError when identifier has all same digits', () => {
            const clientProps: ClientProps = {
                name: 'João Silva',
                identifier: '11111111111' // CPF com todos os dígitos iguais
            };

            expect(() => new Client(clientProps)).toThrow(new ValidationError('Formato do identificador do cliente inválido'));
        });

        it('should throw ValidationError when identifier has less than 11 digits', () => {
            const clientProps: ClientProps = {
                name: 'João Silva',
                identifier: '123456789' // Menos de 11 dígitos
            };

            expect(() => new Client(clientProps)).toThrow(new ValidationError('Formato do identificador do cliente inválido'));
        });

        it('should throw ValidationError when identifier has wrong check digits', () => {
            const clientProps: ClientProps = {
                name: 'João Silva',
                identifier: '11144477700' // Dígitos verificadores incorretos
            };

            expect(() => new Client(clientProps)).toThrow(new ValidationError('Formato do identificador do cliente inválido'));
        });
    });

    describe('Update Methods', () => {
        let client: Client;

        beforeEach(() => {
            const clientProps: ClientProps = {
                name: 'João Silva',
                identifier: validCPF
            };
            client = new Client(clientProps, 1);
        });

        it('should update name successfully', () => {
            const newName = 'Maria Silva';
            client.updateName(newName);
            
            expect(client.name).toBe(newName);
        });

        it('should throw ValidationError when updating name with empty string', () => {
            const updateWithEmpty = () => client.updateName('');
            expect(updateWithEmpty).toThrow(ValidationError);
        });

        it('should throw ValidationError when updating name with whitespace', () => {
            const updateWithWhitespace = () => client.updateName('   ');
            expect(updateWithWhitespace).toThrow(ValidationError);
        });

        it('should update identifier successfully with valid CPF', () => {
            const newCPF = '52998224725'; // Outro CPF válido
            client.updateIdentifier(newCPF);
            
            expect(client.identifier).toBe(newCPF);
        });

        it('should throw ValidationError when updating identifier with invalid CPF', () => {
            const invalidCPF = '12345678901';
            const updateWithInvalid = () => client.updateIdentifier(invalidCPF);
            expect(updateWithInvalid).toThrow(ValidationError);
        });

        it('should throw ValidationError when updating identifier with empty string', () => {
            const updateWithEmpty = () => client.updateIdentifier('');
            expect(updateWithEmpty).toThrow(ValidationError);
        });

        it('should throw ValidationError when updating identifier with whitespace only', () => {
            const updateWithWhitespace = () => client.updateIdentifier('   ');
            expect(updateWithWhitespace).toThrow(ValidationError);
        });

        it('should throw ValidationError when updating identifier with invalid format', () => {
            const updateWithInvalid = () => client.updateIdentifier('123');
            expect(updateWithInvalid).toThrow(ValidationError);
        });
    });

    describe('toJSON', () => {
        it('should return correct JSON representation', () => {
            const clientProps: ClientProps = {
                name: 'João Silva',
                identifier: validCPF
            };

            const client = new Client(clientProps, 1);
            const json = client.toJSON();

            expect(json.name).toBe('João Silva');
            expect(json.identifier).toBe(validCPF);
        });
    });
});
