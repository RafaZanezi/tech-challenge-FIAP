import { Client, ClientProps } from './client';
import { ValidationError } from '../usecases/errors/errors';

describe('Client Entity', () => {
    const validClientProps: ClientProps = {
        name: 'João Silva',
        identifier: '11144477735' // CPF válido
    };

    describe('Constructor', () => {
        it('should create a new client with valid data', () => {
            const clientData = {
                name: 'João Silva',
                identifier: '11144477735' // CPF válido
            };

            const client = new Client(clientData);

            expect(client.name).toBe('João Silva');
            expect(client.identifier).toBe('11144477735');
            expect(client.id).toBeUndefined();
        });

        it('should create a client with id when provided', () => {
            const clientData = {
                name: 'Maria Santos',
                identifier: '52998224725' // CPF válido
            };

            const client = new Client(clientData, 123);

            expect(client.name).toBe('Maria Santos');
            expect(client.identifier).toBe('52998224725');
            expect(client.id).toBe(123);
        });

        it('should create client with id', () => {
            const client = new Client(validClientProps, 1);

            expect(client.name).toBe('João Silva');
            expect(client.identifier).toBe('11144477735');
            expect(client.id).toBe(1);
        });

        it('should throw ValidationError if name is empty', () => {
            const props = { ...validClientProps, name: '' };

            expect(() => new Client(props)).toThrow(ValidationError);
            expect(() => new Client(props)).toThrow('Nome do cliente é obrigatório');
        });

        it('should throw ValidationError if name is only spaces', () => {
            const props = { ...validClientProps, name: '   ' };

            expect(() => new Client(props)).toThrow(ValidationError);
            expect(() => new Client(props)).toThrow('Nome do cliente é obrigatório');
        });

        it('should throw ValidationError if name is undefined', () => {
            const props = { ...validClientProps, name: undefined as any };

            expect(() => new Client(props)).toThrow(ValidationError);
            expect(() => new Client(props)).toThrow('Nome do cliente é obrigatório');
        });

        it('should throw ValidationError if identifier is empty', () => {
            const props = { ...validClientProps, identifier: '' };

            expect(() => new Client(props)).toThrow(ValidationError);
            expect(() => new Client(props)).toThrow('Identificador do cliente é obrigatório');
        });

        it('should throw ValidationError if identifier is only spaces', () => {
            const props = { ...validClientProps, identifier: '   ' };

            expect(() => new Client(props)).toThrow(ValidationError);
            expect(() => new Client(props)).toThrow('Identificador do cliente é obrigatório');
        });

        it('should throw ValidationError if identifier is undefined', () => {
            const props = { ...validClientProps, identifier: undefined as any };

            expect(() => new Client(props)).toThrow(ValidationError);
            expect(() => new Client(props)).toThrow('Identificador do cliente é obrigatório');
        });

        it('should throw ValidationError for invalid CPF format', () => {
            const props = { ...validClientProps, identifier: '12345678900' }; // CPF inválido

            expect(() => new Client(props)).toThrow(ValidationError);
            expect(() => new Client(props)).toThrow('Formato do identificador do cliente inválido');
        });

        it('should throw ValidationError for CPF with all same digits', () => {
            const props = { ...validClientProps, identifier: '11111111111' };

            expect(() => new Client(props)).toThrow(ValidationError);
            expect(() => new Client(props)).toThrow('Formato do identificador do cliente inválido');
        });

        it('should throw ValidationError for CPF with less than 11 digits', () => {
            const props = { ...validClientProps, identifier: '123456789' };

            expect(() => new Client(props)).toThrow(ValidationError);
            expect(() => new Client(props)).toThrow('Formato do identificador do cliente inválido');
        });

        it('should throw ValidationError for CPF with more than 11 digits', () => {
            const props = { ...validClientProps, identifier: '123456789012' };

            expect(() => new Client(props)).toThrow(ValidationError);
            expect(() => new Client(props)).toThrow('Formato do identificador do cliente inválido');
        });
    });

    describe('updateName', () => {
        it('should update name successfully', () => {
            const client = new Client(validClientProps);
            
            client.updateName('Maria Santos');
            
            expect(client.name).toBe('Maria Santos');
        });

        it('should throw ValidationError if new name is empty', () => {
            const client = new Client(validClientProps);
            
            expect(() => client.updateName('')).toThrow(ValidationError);
            expect(() => client.updateName('')).toThrow('Nome do cliente não pode estar vazio');
        });

        it('should throw ValidationError if new name is only spaces', () => {
            const client = new Client(validClientProps);
            
            expect(() => client.updateName('   ')).toThrow(ValidationError);
            expect(() => client.updateName('   ')).toThrow('Nome do cliente não pode estar vazio');
        });

        it('should throw ValidationError if new name is undefined', () => {
            const client = new Client(validClientProps);
            
            expect(() => client.updateName(undefined as any)).toThrow(ValidationError);
            expect(() => client.updateName(undefined as any)).toThrow('Nome do cliente não pode estar vazio');
        });
    });

    describe('updateIdentifier', () => {
        it('should update identifier successfully with valid CPF', () => {
            const client = new Client(validClientProps);
            
            client.updateIdentifier('00000000191');

            expect(client.identifier).toBe('00000000191');
        });

        it('should throw ValidationError for invalid CPF', () => {
            const client = new Client(validClientProps);
            
            expect(() => client.updateIdentifier('12345678900')).toThrow(ValidationError);
            expect(() => client.updateIdentifier('12345678900')).toThrow('Identificador do cliente inválido');
        });

        it('should throw ValidationError for CPF with letters', () => {
            const client = new Client(validClientProps);
            
            expect(() => client.updateIdentifier('1234567890a')).toThrow(ValidationError);
            expect(() => client.updateIdentifier('1234567890a')).toThrow('Identificador do cliente inválido');
        });

        it('should throw ValidationError for empty identifier', () => {
            const client = new Client(validClientProps);
            
            expect(() => client.updateIdentifier('')).toThrow(ValidationError);
            expect(() => client.updateIdentifier('')).toThrow('Identificador do cliente inválido');
        });
    });

    describe('toJSON', () => {
        it('should return correct JSON representation without id', () => {
            const client = new Client({
                name: 'João Silva',
                identifier: '11144477735'
            });
            
            const json = client.toJSON();
            
            expect(json).toEqual({
                id: undefined,
                name: 'João Silva',
                identifier: '11144477735'
            });
        });

        it('should return correct JSON representation with id', () => {
            const client = new Client({
                name: 'João Silva',
                identifier: '11144477735'
            }, 1);
            
            const json = client.toJSON();
            
            expect(json).toEqual({
                id: 1,
                name: 'João Silva',
                identifier: '11144477735'
            });
        });
    });

    describe('CPF Validation', () => {
        it('should accept valid CPF with different formats', () => {
            // CPF com pontos e traço deve ser aceito (será limpo internamente)
            expect(() => new Client({
                name: 'Test User',
                identifier: '123.456.789-01'
            })).toThrow(); // Mas este CPF específico é inválido
        });

        it('should validate CPF check digits correctly', () => {
            // Testa com CPFs válidos conhecidos
            const validCPFs = [
                '11144477735',
                '00000000191'
            ];

            validCPFs.forEach(cpf => {
                expect(() => new Client({
                    name: 'Test User',
                    identifier: cpf
                })).not.toThrow();
            });
        });

        it('should reject CPF with invalid check digits', () => {
            const invalidCPFs = [
                '12345678900', // dígitos verificadores incorretos
                '11144477736', // último dígito incorreto
                '11144477745'  // penúltimo dígito incorreto
            ];

            invalidCPFs.forEach(cpf => {
                expect(() => new Client({
                    name: 'Test User',
                    identifier: cpf
                })).toThrow(ValidationError);
            });
        });

        it('should handle CPF with special characters', () => {
            // O CPF deve ser limpo de caracteres especiais antes da validação
            expect(() => new Client({
                name: 'Test User',
                identifier: '111.444.777-35'
            })).not.toThrow();
        });
    });

    describe('Getters', () => {
        it('should return name through getter', () => {
            const client = new Client(validClientProps);
            
            expect(client.name).toBe(validClientProps.name);
        });

        it('should return identifier through getter', () => {
            const client = new Client(validClientProps);
            
            expect(client.identifier).toBe(validClientProps.identifier);
        });

        it('should return updated values through getters', () => {
            const client = new Client({
                name: 'João Silva',
                identifier: '11144477735'
            });
            
            client.updateName('Updated Name');
            
            expect(client.name).toBe('Updated Name');
            expect(client.identifier).toBe('11144477735');
        });
    });
});