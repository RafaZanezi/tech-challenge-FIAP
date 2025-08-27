import { Service } from './service.entity';

describe('Service Entity', () => {
    describe('constructor', () => {
        it('should create a valid service', () => {
            // Arrange & Act
            const service = new Service({ 
                name: 'Troca de Óleo', 
                description: 'Troca completa do óleo do motor',
                price: 120.50
            });

            // Assert
            expect(service.name).toBe('Troca de Óleo');
            expect(service.description).toBe('Troca completa do óleo do motor');
            expect(service.price).toBe(120.50);
        });

        it('should create a service with id', () => {
            // Arrange & Act
            const service = new Service({ 
                name: 'Alinhamento', 
                description: 'Alinhamento das rodas',
                price: 80.00
            }, 123);

            // Assert
            expect(service.id).toBe(123);
            expect(service.name).toBe('Alinhamento');
        });

        it('should throw error for empty name', () => {
            // Act & Assert
            expect(() => {
                new Service({ name: '', description: 'Valid description', price: 100 });
            }).toThrow('Nome do serviço é obrigatório');
        });

        it('should throw error for empty description', () => {
            // Act & Assert
            expect(() => {
                new Service({ name: 'Valid Name', description: '', price: 100 });
            }).toThrow('Descrição do serviço é obrigatória');
        });

        it('should throw error for invalid price', () => {
            // Act & Assert
            expect(() => {
                new Service({ name: 'Valid Name', description: 'Valid description', price: 0 });
            }).toThrow('Preço do serviço deve ser maior que zero');

            expect(() => {
                new Service({ name: 'Valid Name', description: 'Valid description', price: -10 });
            }).toThrow('Preço do serviço deve ser maior que zero');
        });
    });

    describe('updateName', () => {
        it('should update name successfully', () => {
            // Arrange
            const service = new Service({ name: 'Old Name', description: 'Description', price: 100 });

            // Act
            service.updateName('New Name');

            // Assert
            expect(service.name).toBe('New Name');
        });

        it('should throw error when updating to empty name', () => {
            // Arrange
            const service = new Service({ name: 'Valid Name', description: 'Description', price: 100 });

            // Act & Assert
            expect(() => {
                service.updateName('');
            }).toThrow('Nome do serviço não pode estar vazio');
        });
    });

    describe('updateDescription', () => {
        it('should update description successfully', () => {
            // Arrange
            const service = new Service({ name: 'Service', description: 'Old Description', price: 100 });

            // Act
            service.updateDescription('New Description');

            // Assert
            expect(service.description).toBe('New Description');
        });

        it('should throw error when updating to empty description', () => {
            // Arrange
            const service = new Service({ name: 'Service', description: 'Valid Description', price: 100 });

            // Act & Assert
            expect(() => {
                service.updateDescription('');
            }).toThrow('Descrição do serviço não pode estar vazia');
        });
    });

    describe('updatePrice', () => {
        it('should update price successfully', () => {
            // Arrange
            const service = new Service({ name: 'Service', description: 'Description', price: 100 });

            // Act
            service.updatePrice(150.75);

            // Assert
            expect(service.price).toBe(150.75);
        });

        it('should throw error when updating to invalid price', () => {
            // Arrange
            const service = new Service({ name: 'Service', description: 'Description', price: 100 });

            // Act & Assert
            expect(() => {
                service.updatePrice(0);
            }).toThrow('Preço do serviço deve ser maior que zero');

            expect(() => {
                service.updatePrice(-50);
            }).toThrow('Preço do serviço deve ser maior que zero');
        });
    });

    describe('toJSON', () => {
        it('should return correct JSON representation', () => {
            // Arrange
            const service = new Service({ 
                name: 'Test Service', 
                description: 'Test Description',
                price: 99.99
            }, 456);

            // Act
            const json = service.toJSON();

            // Assert
            expect(json).toEqual({
                id: 456,
                name: 'Test Service',
                description: 'Test Description',
                price: 99.99
            });
        });
    });
});
