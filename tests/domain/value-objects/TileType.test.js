import { TileType } from '../../../src/domain/value-objects/TileType.js';

describe('TileType', () => {
  describe('static instances', () => {
    it('should have GRASS tile type', () => {
      expect(TileType.GRASS).toBeInstanceOf(TileType);
      expect(TileType.GRASS.name).toBe('grass');
      expect(TileType.GRASS.walkable).toBe(true);
    });

    it('should have WATER tile type', () => {
      expect(TileType.WATER).toBeInstanceOf(TileType);
      expect(TileType.WATER.name).toBe('water');
      expect(TileType.WATER.walkable).toBe(false);
    });

    it('should have DIRT tile type', () => {
      expect(TileType.DIRT).toBeInstanceOf(TileType);
      expect(TileType.DIRT.name).toBe('dirt');
      expect(TileType.DIRT.walkable).toBe(true);
    });

    it('should have TREE tile type', () => {
      expect(TileType.TREE).toBeInstanceOf(TileType);
      expect(TileType.TREE.name).toBe('tree');
      expect(TileType.TREE.walkable).toBe(false);
    });
  });

  describe('properties', () => {
    it('should have immutable name property', () => {
      expect(() => {
        TileType.GRASS.name = 'modified';
      }).toThrow();
    });

    it('should have immutable walkable property', () => {
      expect(() => {
        TileType.GRASS.walkable = false;
      }).toThrow();
    });
  });

  describe('equals', () => {
    it('should return true for same tile types', () => {
      expect(TileType.GRASS.equals(TileType.GRASS)).toBe(true);
      expect(TileType.WATER.equals(TileType.WATER)).toBe(true);
    });

    it('should return false for different tile types', () => {
      expect(TileType.GRASS.equals(TileType.WATER)).toBe(false);
      expect(TileType.DIRT.equals(TileType.TREE)).toBe(false);
    });

    it('should return false for non-TileType objects', () => {
      expect(TileType.GRASS.equals({ name: 'grass', walkable: true })).toBe(false);
      expect(TileType.GRASS.equals(null)).toBe(false);
      expect(TileType.GRASS.equals('grass')).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return tile name as string', () => {
      expect(TileType.GRASS.toString()).toBe('grass');
      expect(TileType.WATER.toString()).toBe('water');
      expect(TileType.DIRT.toString()).toBe('dirt');
      expect(TileType.TREE.toString()).toBe('tree');
    });
  });

  describe('walkability', () => {
    it('should correctly identify walkable tiles', () => {
      expect(TileType.GRASS.walkable).toBe(true);
      expect(TileType.DIRT.walkable).toBe(true);
    });

    it('should correctly identify non-walkable tiles', () => {
      expect(TileType.WATER.walkable).toBe(false);
      expect(TileType.TREE.walkable).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should create new instances with proper values', () => {
      const customTile = new TileType('custom', true);
      expect(customTile.name).toBe('custom');
      expect(customTile.walkable).toBe(true);
    });

    it('should not allow modification of static instances', () => {
      const originalName = TileType.GRASS.name;
      const originalWalkable = TileType.GRASS.walkable;

      // Attempts to modify should fail silently or throw
      try {
        TileType.GRASS.name = 'modified';
        TileType.GRASS.walkable = false;
      } catch (e) {
        // Expected behavior in strict mode
      }

      expect(TileType.GRASS.name).toBe(originalName);
      expect(TileType.GRASS.walkable).toBe(originalWalkable);
    });
  });
});
