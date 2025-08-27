import { Entity } from './entity';

class TestEntity extends Entity<number> {
  private readonly value: string;

  constructor(value: string, id?: number) {
    super(id);
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}

describe('Entity', () => {
  describe('constructor', () => {
    it('should create entity with id', () => {
      const entity = new TestEntity('test', 1);

      expect(entity.id).toBe(1);
      expect(entity.getValue()).toBe('test');
    });

    it('should create entity without id', () => {
      const entity = new TestEntity('test');

      expect(entity.id).toBeUndefined();
      expect(entity.getValue()).toBe('test');
    });
  });

  describe('equals', () => {
    it('should return true when comparing same entity', () => {
      const entity = new TestEntity('test', 1);

      expect(entity.equals(entity)).toBe(true);
    });

    it('should return true when comparing entities with same id', () => {
      const entity1 = new TestEntity('test1', 1);
      const entity2 = new TestEntity('test2', 1);

      expect(entity1.equals(entity2)).toBe(true);
    });

    it('should return false when comparing entities with different ids', () => {
      const entity1 = new TestEntity('test', 1);
      const entity2 = new TestEntity('test', 2);

      expect(entity1.equals(entity2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const entity = new TestEntity('test', 1);

      expect(entity.equals(null as any)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const entity = new TestEntity('test', 1);

      expect(entity.equals(undefined as any)).toBe(false);
    });

    it('should return true when comparing entities with undefined ids', () => {
      const entity1 = new TestEntity('test1');
      const entity2 = new TestEntity('test2');

      expect(entity1.equals(entity2)).toBe(true);
    });

    it('should return true when both entities have same undefined id', () => {
      const entity1 = new TestEntity('test1');
      const entity2 = new TestEntity('test2');
      
      // Override the equals method behavior for undefined ids
      expect(entity1.id).toBeUndefined();
      expect(entity2.id).toBeUndefined();
      expect(entity1.equals(entity2)).toBe(true);
    });
  });
});
