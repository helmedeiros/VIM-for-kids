import { DynamicZoneMap } from '../../../src/domain/entities/DynamicZoneMap.js';
import { Position } from '../../../src/domain/value-objects/Position.js';
import { TileType } from '../../../src/domain/value-objects/TileType.js';

describe('DynamicZoneMap', () => {
  let dynamicMap;

  afterEach(() => {
    // Clean up after each test
    if (dynamicMap && dynamicMap.cleanup) {
      dynamicMap.cleanup();
    }
  });

  describe('Constructor and Basic Properties', () => {
    test('should create map with default dimensions', () => {
      dynamicMap = new DynamicZoneMap();

      expect(dynamicMap._zoneWidth).toBe(12);
      expect(dynamicMap._zoneHeight).toBe(8);
      expect(dynamicMap.width).toBeGreaterThanOrEqual(24); // 12 + 12 minimum
      expect(dynamicMap.height).toBeGreaterThanOrEqual(16); // 8 + 8 minimum
    });

    test('should create map with custom dimensions', () => {
      dynamicMap = new DynamicZoneMap(16, 10);

      expect(dynamicMap._zoneWidth).toBe(16);
      expect(dynamicMap._zoneHeight).toBe(10);
    });

    test('should provide size property for backwards compatibility', () => {
      dynamicMap = new DynamicZoneMap();
      expect(dynamicMap.size).toBe(dynamicMap.width);
    });
  });

  describe('Zone Boundaries', () => {
    beforeEach(() => {
      dynamicMap = new DynamicZoneMap(12, 8);
    });

    test('should calculate zone boundaries correctly', () => {
      const expectedStartX = Math.floor((dynamicMap.width - 12) / 2);
      const expectedStartY = Math.floor((dynamicMap.height - 8) / 2);

      expect(dynamicMap.zoneStartX).toBe(expectedStartX);
      expect(dynamicMap.zoneStartY).toBe(expectedStartY);
      expect(dynamicMap.zoneEndX).toBe(expectedStartX + 12);
      expect(dynamicMap.zoneEndY).toBe(expectedStartY + 8);
    });
  });

  describe('Test Dimensions', () => {
    test('should use test dimensions when provided', () => {
      dynamicMap = new DynamicZoneMap(12, 8);
      dynamicMap._setTestDimensions(640, 480);

      // Should calculate based on 640x480 screen
      const expectedCols = Math.ceil(640 / 32) + 2; // tileSize + padding
      const expectedRows = Math.ceil(480 / 32) + 2;

      expect(dynamicMap.width).toBe(Math.max(expectedCols, 24)); // 12 + 12 minimum
      expect(dynamicMap.height).toBe(Math.max(expectedRows, 16)); // 8 + 8 minimum
    });

    test('should enforce minimum size for gameplay', () => {
      dynamicMap = new DynamicZoneMap(20, 15); // Large zone
      dynamicMap._setTestDimensions(100, 100); // Very small screen

      // Should enforce minimum size
      expect(dynamicMap.width).toBeGreaterThanOrEqual(32); // 20 + 12
      expect(dynamicMap.height).toBeGreaterThanOrEqual(23); // 15 + 8
    });
  });

  describe('Map Initialization', () => {
    beforeEach(() => {
      dynamicMap = new DynamicZoneMap(4, 3); // Small zone for testing
    });

    test('should initialize map with water and grass', () => {
      // Check water tiles outside zone
      const waterPos = new Position(0, 0);
      expect(dynamicMap.getTileAt(waterPos)).toBe(TileType.WATER);

      // Check grass tiles inside zone
      const grassPos = new Position(dynamicMap.zoneStartX, dynamicMap.zoneStartY);
      expect(dynamicMap.getTileAt(grassPos)).toBe(TileType.GRASS);
    });

    test('should create proper zone boundaries', () => {
      // Test all corners of the zone
      const topLeft = new Position(dynamicMap.zoneStartX, dynamicMap.zoneStartY);
      const topRight = new Position(dynamicMap.zoneEndX - 1, dynamicMap.zoneStartY);
      const bottomLeft = new Position(dynamicMap.zoneStartX, dynamicMap.zoneEndY - 1);
      const bottomRight = new Position(dynamicMap.zoneEndX - 1, dynamicMap.zoneEndY - 1);

      expect(dynamicMap.getTileAt(topLeft)).toBe(TileType.GRASS);
      expect(dynamicMap.getTileAt(topRight)).toBe(TileType.GRASS);
      expect(dynamicMap.getTileAt(bottomLeft)).toBe(TileType.GRASS);
      expect(dynamicMap.getTileAt(bottomRight)).toBe(TileType.GRASS);

      // Test outside zone boundaries
      const outsideLeft = new Position(dynamicMap.zoneStartX - 1, dynamicMap.zoneStartY);
      const outsideRight = new Position(dynamicMap.zoneEndX, dynamicMap.zoneStartY);

      expect(dynamicMap.getTileAt(outsideLeft)).toBe(TileType.WATER);
      expect(dynamicMap.getTileAt(outsideRight)).toBe(TileType.WATER);
    });
  });

  describe('Tile Operations', () => {
    beforeEach(() => {
      dynamicMap = new DynamicZoneMap(12, 8);
    });

    test('should get tile at valid position', () => {
      const pos = new Position(dynamicMap.zoneStartX, dynamicMap.zoneStartY);
      const tile = dynamicMap.getTileAt(pos);

      expect(tile).toBeDefined();
      expect(tile).toBe(TileType.GRASS);
    });

    test('should return water for invalid position', () => {
      const invalidPos = new Position(-1, -1);
      const tile = dynamicMap.getTileAt(invalidPos);

      expect(tile).toBe(TileType.WATER);
    });

    test('should set tile at valid position', () => {
      const pos = new Position(dynamicMap.zoneStartX, dynamicMap.zoneStartY);
      dynamicMap.setTileAt(pos, TileType.DIRT);

      expect(dynamicMap.getTileAt(pos)).toBe(TileType.DIRT);
    });

    test('should not set tile at invalid position', () => {
      const invalidPos = new Position(-1, -1);

      // Should not throw
      expect(() => dynamicMap.setTileAt(invalidPos, TileType.DIRT)).not.toThrow();

      // Should still return water (unchanged)
      expect(dynamicMap.getTileAt(invalidPos)).toBe(TileType.WATER);
    });
  });

  describe('Position Validation', () => {
    beforeEach(() => {
      dynamicMap = new DynamicZoneMap(12, 8);
    });

    test('should validate positions correctly', () => {
      // Valid positions
      expect(dynamicMap.isValidPosition(new Position(0, 0))).toBe(true);
      expect(
        dynamicMap.isValidPosition(new Position(dynamicMap.width - 1, dynamicMap.height - 1))
      ).toBe(true);

      // Invalid positions
      expect(dynamicMap.isValidPosition(new Position(-1, 0))).toBe(false);
      expect(dynamicMap.isValidPosition(new Position(0, -1))).toBe(false);
      expect(dynamicMap.isValidPosition(new Position(dynamicMap.width, 0))).toBe(false);
      expect(dynamicMap.isValidPosition(new Position(0, dynamicMap.height))).toBe(false);
    });

    test('should check walkability correctly', () => {
      // Grass (walkable)
      const grassPos = new Position(dynamicMap.zoneStartX, dynamicMap.zoneStartY);
      expect(dynamicMap.isWalkable(grassPos)).toBe(true);

      // Water (not walkable)
      const waterPos = new Position(0, 0);
      expect(dynamicMap.isWalkable(waterPos)).toBe(false);

      // Invalid position (not walkable)
      const invalidPos = new Position(-1, -1);
      expect(dynamicMap.isWalkable(invalidPos)).toBe(false);
    });
  });

  describe('Zone Coordinate Conversion', () => {
    beforeEach(() => {
      dynamicMap = new DynamicZoneMap(12, 8);
    });

    test('should convert zone-relative coordinates to absolute coordinates', () => {
      const zonePos = dynamicMap.zoneToAbsolute(5, 3);

      expect(zonePos).toBeInstanceOf(Position);
      expect(zonePos.x).toBe(dynamicMap.zoneStartX + 5);
      expect(zonePos.y).toBe(dynamicMap.zoneStartY + 3);
    });

    test('should check if position is in zone area', () => {
      // Inside zone
      const insidePos = new Position(dynamicMap.zoneStartX + 2, dynamicMap.zoneStartY + 2);
      expect(dynamicMap.isInZoneArea(insidePos)).toBe(true);

      // Outside zone
      const outsidePos = new Position(0, 0);
      expect(dynamicMap.isInZoneArea(outsidePos)).toBe(false);

      // On zone boundary (should be inside)
      const boundaryPos = new Position(dynamicMap.zoneStartX, dynamicMap.zoneStartY);
      expect(dynamicMap.isInZoneArea(boundaryPos)).toBe(true);

      // Just outside zone boundary
      const outsideBoundaryPos = new Position(dynamicMap.zoneEndX, dynamicMap.zoneEndY);
      expect(dynamicMap.isInZoneArea(outsideBoundaryPos)).toBe(false);
    });
  });

  describe('Cleanup', () => {
    test('should handle cleanup gracefully', () => {
      dynamicMap = new DynamicZoneMap();

      expect(() => dynamicMap.cleanup()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle very small zone dimensions', () => {
      dynamicMap = new DynamicZoneMap(1, 1);

      expect(dynamicMap._zoneWidth).toBe(1);
      expect(dynamicMap._zoneHeight).toBe(1);
      expect(dynamicMap.width).toBeGreaterThanOrEqual(13); // 1 + 12 minimum
      expect(dynamicMap.height).toBeGreaterThanOrEqual(9); // 1 + 8 minimum
    });

    test('should handle zero zone dimensions', () => {
      dynamicMap = new DynamicZoneMap(0, 0);

      expect(dynamicMap._zoneWidth).toBe(0);
      expect(dynamicMap._zoneHeight).toBe(0);
      expect(dynamicMap.width).toBeGreaterThanOrEqual(12); // 0 + 12 minimum
      expect(dynamicMap.height).toBeGreaterThanOrEqual(8); // 0 + 8 minimum
    });
  });
});
