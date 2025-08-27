import { Supply } from './supply.entity';

describe('Supply Entity', () => {
    describe('constructor', () => {
        it('should create a valid supply', () => {
            // Arrange & Act
            const supply = new Supply({ 
                name: 'Óleo Motor 5W30', 
                quantity: 50,
                price: 25.90
            });

            // Assert
            expect(supply.name).toBe('Óleo Motor 5W30');
            expect(supply.quantity).toBe(50);
            expect(supply.price).toBe(25.90);
        });

        it('should create a supply with id', () => {
            // Arrange & Act
            const supply = new Supply({ 
                name: 'Filtro de Ar', 
                quantity: 30,
                price: 15.50
            }, 123);

            // Assert
            expect(supply.id).toBe(123);
            expect(supply.name).toBe('Filtro de Ar');
        });

        it('should throw error for empty name', () => {
            // Act & Assert
            expect(() => {
                new Supply({ name: '', quantity: 10, price: 100 });
            }).toThrow('Nome do insumo é obrigatório');
        });

        it('should throw error for negative quantity', () => {
            // Act & Assert
            expect(() => {
                new Supply({ name: 'Valid Name', quantity: -1, price: 100 });
            }).toThrow('Quantidade do insumo não pode ser negativa');
        });

        it('should throw error for negative price', () => {
            // Act & Assert
            expect(() => {
                new Supply({ name: 'Valid Name', quantity: 10, price: -5 });
            }).toThrow('Preço do insumo não pode ser negativo');
        });

        it('should allow zero quantity and price', () => {
            // Act
            const supply = new Supply({ name: 'Test Supply', quantity: 0, price: 0 });

            // Assert
            expect(supply.quantity).toBe(0);
            expect(supply.price).toBe(0);
        });
    });

    describe('updateName', () => {
        it('should update name successfully', () => {
            // Arrange
            const supply = new Supply({ name: 'Old Name', quantity: 10, price: 100 });

            // Act
            supply.updateName('New Name');

            // Assert
            expect(supply.name).toBe('New Name');
        });

        it('should throw error when updating to empty name', () => {
            // Arrange
            const supply = new Supply({ name: 'Valid Name', quantity: 10, price: 100 });

            // Act & Assert
            expect(() => {
                supply.updateName('');
            }).toThrow('Nome do insumo não pode estar vazio');
        });
    });

    describe('updateQuantity', () => {
        it('should update quantity successfully', () => {
            // Arrange
            const supply = new Supply({ name: 'Supply', quantity: 10, price: 100 });

            // Act
            supply.updateQuantity(25);

            // Assert
            expect(supply.quantity).toBe(25);
        });

        it('should allow updating to zero quantity', () => {
            // Arrange
            const supply = new Supply({ name: 'Supply', quantity: 10, price: 100 });

            // Act
            supply.updateQuantity(0);

            // Assert
            expect(supply.quantity).toBe(0);
        });

        it('should throw error when updating to negative quantity', () => {
            // Arrange
            const supply = new Supply({ name: 'Supply', quantity: 10, price: 100 });

            // Act & Assert
            expect(() => {
                supply.updateQuantity(-5);
            }).toThrow('Quantidade do insumo não pode ser negativa');
        });
    });

    describe('updatePrice', () => {
        it('should update price successfully', () => {
            // Arrange
            const supply = new Supply({ name: 'Supply', quantity: 10, price: 100 });

            // Act
            supply.updatePrice(150.75);

            // Assert
            expect(supply.price).toBe(150.75);
        });

        it('should allow updating to zero price', () => {
            // Arrange
            const supply = new Supply({ name: 'Supply', quantity: 10, price: 100 });

            // Act
            supply.updatePrice(0);

            // Assert
            expect(supply.price).toBe(0);
        });

        it('should throw error when updating to negative price', () => {
            // Arrange
            const supply = new Supply({ name: 'Supply', quantity: 10, price: 100 });

            // Act & Assert
            expect(() => {
                supply.updatePrice(-50);
            }).toThrow('Preço do insumo não pode ser negativo');
        });
    });

    describe('toJSON', () => {
        it('should return correct JSON representation', () => {
            // Arrange
            const supply = new Supply({ 
                name: 'Test Supply', 
                quantity: 15,
                price: 99.99
            }, 456);

            // Act
            const json = supply.toJSON();

            // Assert
            expect(json).toEqual({
                id: 456,
                name: 'Test Supply',
                quantity: 15,
                price: 99.99
            });
        });
    });
});
