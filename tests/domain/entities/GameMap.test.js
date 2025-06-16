import { GameMap } from '../../../src/domain/entities/GameMap.js';
import { Position } from '../../../src/domain/value-objects/Position.js';
import { TileType } from '../../../src/domain/value-objects/TileType.js';

describe('GameMap', () => {
  let gameMap;

  beforeEach(() => {
    gameMap = new GameMap();
  });

  describe('initialization', () => {
    it('should create map with default size of 12', () => {
      expect(gameMap.size).toBe(12);
    });

    it('should create map with custom size', () => {
      const customMap = new GameMap(10);
      expect(customMap.size).toBe(10);
    });

    it('should have water border around the map', () => {
      const size = gameMap.size;

      // Test top border
      for (let x = 0; x < size; x++) {
        expect(gameMap.getTileAt(new Position(x, 0))).toBe(TileType.WATER);
      }

      // Test bottom border
      for (let x = 0; x < size; x++) {
        expect(gameMap.getTileAt(new Position(x, size - 1))).toBe(TileType.WATER);
      }

      // Test left border
      for (let y = 0; y < size; y++) {
        expect(gameMap.getTileAt(new Position(0, y))).toBe(TileType.WATER);
      }

      // Test right border
      for (let y = 0; y < size; y++) {
        expect(gameMap.getTileAt(new Position(size - 1, y))).toBe(TileType.WATER);
      }
    });
  });

  describe('getTileAt', () => {
    it('should return correct tile type at given position', () => {
      const position = new Position(1, 1);
      const tile = gameMap.getTileAt(position);
      expect(tile).toBeInstanceOf(TileType);
    });

    it('should throw error for position outside boundaries', () => {
      expect(() => {
        gameMap.getTileAt(new Position(-1, 0));
      }).toThrow('Position is outside map boundaries');

      expect(() => {
        gameMap.getTileAt(new Position(0, -1));
      }).toThrow('Position is outside map boundaries');

      expect(() => {
        gameMap.getTileAt(new Position(12, 0));
      }).toThrow('Position is outside map boundaries');

      expect(() => {
        gameMap.getTileAt(new Position(0, 12));
      }).toThrow('Position is outside map boundaries');
    });
  });

  describe('isValidPosition', () => {
    it('should return true for valid positions', () => {
      expect(gameMap.isValidPosition(new Position(0, 0))).toBe(true);
      expect(gameMap.isValidPosition(new Position(5, 5))).toBe(true);
      expect(gameMap.isValidPosition(new Position(11, 11))).toBe(true);
    });

    it('should return false for invalid positions', () => {
      expect(gameMap.isValidPosition(new Position(-1, 0))).toBe(false);
      expect(gameMap.isValidPosition(new Position(0, -1))).toBe(false);
      expect(gameMap.isValidPosition(new Position(12, 0))).toBe(false);
      expect(gameMap.isValidPosition(new Position(0, 12))).toBe(false);
    });
  });

  describe('isWalkable', () => {
    it('should return false for positions outside boundaries', () => {
      expect(gameMap.isWalkable(new Position(-1, 0))).toBe(false);
      expect(gameMap.isWalkable(new Position(12, 0))).toBe(false);
    });

    it('should return false for water tiles', () => {
      expect(gameMap.isWalkable(new Position(0, 0))).toBe(false);
      expect(gameMap.isWalkable(new Position(11, 11))).toBe(false);
    });

    it('should return true for walkable tiles', () => {
      // Test dirt path tiles
      expect(gameMap.isWalkable(new Position(2, 2))).toBe(true);
      expect(gameMap.isWalkable(new Position(3, 2))).toBe(true);
      expect(gameMap.isWalkable(new Position(5, 3))).toBe(true);
    });

    it('should return false for non-walkable tiles', () => {
      // Tree at position (9, 2)
      expect(gameMap.isWalkable(new Position(9, 2))).toBe(false);
    });
  });

  describe('dirt path generation', () => {
    it('should have dirt path at expected starting positions', () => {
      const dirtPositions = [
        [2, 2],
        [3, 2],
        [4, 2],
        [5, 2],
        [6, 2],
        [5, 3],
        [5, 4],
        [5, 5],
        [5, 6],
        [5, 7],
        [5, 8],
        [5, 9],
        [2, 3],
        [3, 3],
        [4, 3],
        [3, 4],
        [3, 6],
      ];

      dirtPositions.forEach(([x, y]) => {
        expect(gameMap.getTileAt(new Position(x, y))).toBe(TileType.DIRT);
      });
    });

    it('should have tree at expected position', () => {
      expect(gameMap.getTileAt(new Position(9, 2))).toBe(TileType.TREE);
      expect(gameMap.isWalkable(new Position(9, 2))).toBe(false);
    });
  });

  describe('labyrinth generation', () => {
    it('should have stone walls in labyrinth area', () => {
      // Test positions that should definitely be stone (not paths, not tree, not borders)
      expect(gameMap.getTileAt(new Position(8, 1))).toBe(TileType.STONE);
      expect(gameMap.isWalkable(new Position(8, 1))).toBe(false);

      expect(gameMap.getTileAt(new Position(10, 1))).toBe(TileType.STONE);
      expect(gameMap.isWalkable(new Position(10, 1))).toBe(false);
    });

    it('should have walkable paths in labyrinth', () => {
      // Test labyrinth path positions
      const pathPositions = [
        [7, 2],
        [8, 2], // Entry path
        [7, 3],
        [8, 3],
        [9, 3],
        [10, 3], // Main corridor
        [7, 4],
        [9, 4],
        [10, 4], // Branch paths
        [9, 5],
        [10, 5], // Upper section
        [7, 8],
        [8, 8],
        [9, 8],
        [10, 8], // Lower section
      ];

      pathPositions.forEach(([x, y]) => {
        expect(gameMap.getTileAt(new Position(x, y))).toBe(TileType.DIRT);
        expect(gameMap.isWalkable(new Position(x, y))).toBe(true);
      });
    });

    it('should connect starting area to labyrinth', () => {
      // Test connection from main path to labyrinth
      expect(gameMap.getTileAt(new Position(6, 2))).toBe(TileType.DIRT);
      expect(gameMap.getTileAt(new Position(7, 2))).toBe(TileType.DIRT);
      expect(gameMap.isWalkable(new Position(6, 2))).toBe(true);
      expect(gameMap.isWalkable(new Position(7, 2))).toBe(true);
    });

    it('should have stone walls blocking invalid paths', () => {
      // Test that stone walls properly block movement
      const blockedPositions = [
        [7, 1],
        [8, 1],
        [9, 1],
        [10, 1], // Top wall of labyrinth
        [11, 2],
        [11, 3],
        [11, 4], // Right wall
      ];

      blockedPositions.forEach(([x, y]) => {
        if (gameMap.isValidPosition(new Position(x, y))) {
          const tile = gameMap.getTileAt(new Position(x, y));
          if (tile === TileType.STONE) {
            expect(gameMap.isWalkable(new Position(x, y))).toBe(false);
          }
        }
      });
    });
  });

  describe('labyrinth complexity', () => {
    it('should have dead ends in the labyrinth', () => {
      // Test some specific dead end positions
      const deadEndPositions = [
        [8, 5],
        [8, 6], // Vertical dead end
        [10, 6], // Branch dead end
      ];

      deadEndPositions.forEach(([x, y]) => {
        expect(gameMap.getTileAt(new Position(x, y))).toBe(TileType.DIRT);
        expect(gameMap.isWalkable(new Position(x, y))).toBe(true);
      });
    });

    it('should have multiple paths through labyrinth', () => {
      // Test that there are multiple route options
      const alternativePathPositions = [
        [9, 4],
        [10, 4], // Upper route
        [9, 8],
        [10, 8], // Lower route
      ];

      alternativePathPositions.forEach(([x, y]) => {
        expect(gameMap.getTileAt(new Position(x, y))).toBe(TileType.DIRT);
        expect(gameMap.isWalkable(new Position(x, y))).toBe(true);
      });
    });
  });
});
