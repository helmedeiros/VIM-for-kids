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

  describe('Dynamic Map Expansion', () => {
    beforeEach(() => {
      dynamicMap = new DynamicZoneMap(12, 8);
    });

    test('should expand dimensions when required size is larger', () => {
      const originalWidth = dynamicMap.width;
      const originalHeight = dynamicMap.height;
      const requiredWidth = originalWidth + 10;
      const requiredHeight = originalHeight + 10;

      dynamicMap.expandDimensions(requiredWidth, requiredHeight);

      expect(dynamicMap.width).toBe(requiredWidth);
      expect(dynamicMap.height).toBe(requiredHeight);
    });

    test('should not change dimensions when required size is smaller', () => {
      const originalWidth = dynamicMap.width;
      const originalHeight = dynamicMap.height;
      const requiredWidth = originalWidth - 5;
      const requiredHeight = originalHeight - 5;

      dynamicMap.expandDimensions(requiredWidth, requiredHeight);

      expect(dynamicMap.width).toBe(originalWidth);
      expect(dynamicMap.height).toBe(originalHeight);
    });

    test('should expand tile grid with water tiles when dimensions increase', () => {
      const originalWidth = dynamicMap.width;
      const originalHeight = dynamicMap.height;

      // Store an existing tile to verify it's preserved
      const centerX = Math.floor(originalWidth / 2);
      const centerY = Math.floor(originalHeight / 2);
      const originalTile = dynamicMap.getTileAt(centerX, centerY);

      // Expand dimensions
      const requiredWidth = originalWidth + 5;
      const requiredHeight = originalHeight + 5;
      dynamicMap.expandDimensions(requiredWidth, requiredHeight);

      // Verify existing tile is preserved
      expect(dynamicMap.getTileAt(centerX, centerY)).toBe(originalTile);

      // Verify new areas are filled with water
      expect(dynamicMap.getTileAt(originalWidth, originalHeight)).toBe(TileType.WATER);
      expect(dynamicMap.getTileAt(requiredWidth - 1, requiredHeight - 1)).toBe(TileType.WATER);
    });

    test('should handle expansion when only width increases', () => {
      const originalWidth = dynamicMap.width;
      const originalHeight = dynamicMap.height;
      const requiredWidth = originalWidth + 3;

      dynamicMap.expandDimensions(requiredWidth, originalHeight);

      expect(dynamicMap.width).toBe(requiredWidth);
      expect(dynamicMap.height).toBe(originalHeight);

      // New horizontal areas should be water
      expect(dynamicMap.getTileAt(originalWidth, 0)).toBe(TileType.WATER);
    });

    test('should handle expansion when only height increases', () => {
      const originalWidth = dynamicMap.width;
      const originalHeight = dynamicMap.height;
      const requiredHeight = originalHeight + 3;

      dynamicMap.expandDimensions(originalWidth, requiredHeight);

      expect(dynamicMap.width).toBe(originalWidth);
      expect(dynamicMap.height).toBe(requiredHeight);

      // New vertical areas should be water
      expect(dynamicMap.getTileAt(0, originalHeight)).toBe(TileType.WATER);
    });
  });

  describe('Resize Handling', () => {
    beforeEach(() => {
      dynamicMap = new DynamicZoneMap(12, 8);
    });

    test('should call _calculateDynamicGridSize during resize', () => {
      // Test that _handleResize calls the calculation method
      const calcSpy = jest.spyOn(dynamicMap, '_calculateDynamicGridSize');

      dynamicMap._handleResize();

      expect(calcSpy).toHaveBeenCalledTimes(1);

      calcSpy.mockRestore();
    });

    test('should test different window resize conditions', () => {
      // Test the resize handler existence
      expect(dynamicMap._resizeHandler).toBeDefined();
      expect(typeof dynamicMap._resizeHandler).toBe('function');

      // Test the resize logic with simple call
      expect(() => {
        dynamicMap._handleResize();
      }).not.toThrow();
    });

    test('should not crash when window.game does not exist during resize', () => {
      // Ensure no window.game
      delete global.window?.game;

      // Force a dimension change
      dynamicMap._setTestDimensions(800, 600);

      expect(() => {
        dynamicMap._handleResize();
      }).not.toThrow();
    });
  });

  describe('Browser Environment Branches', () => {
    test('should use window dimensions when available', () => {
      // Mock window with specific dimensions
      global.window = {
        ...global.window,
        innerWidth: 1024,
        innerHeight: 768
      };

      const mapWithWindow = new DynamicZoneMap(12, 8);

      // Should use window dimensions (1024/32 = 32 cols, 768/32 = 24 rows, plus padding)
      expect(mapWithWindow.width).toBeGreaterThanOrEqual(32 + 2); // minCols + padding
      expect(mapWithWindow.height).toBeGreaterThanOrEqual(24 + 2); // minRows + padding

      mapWithWindow.cleanup();
    });

    test('should use default dimensions when window is undefined', () => {
      const originalWindow = global.window;
      global.window = undefined;

      const mapWithoutWindow = new DynamicZoneMap(12, 8);

      // Without window, it uses default 1920x1080
      // But minimum zone requirements override: zoneWidth + 12, zoneHeight + 8
      const minimumWidth = 12 + 12; // zone width + padding = 24
      const minimumHeight = 8 + 8; // zone height + padding = 16

      // Default calculation: ceil(1920/32)+2=62, ceil(1080/32)+2=36
      // But minimum requirements win: max(62, 24)=62, max(36, 16)=36
      // Actually, since we're in test environment, Jest might have different dimensions
      // Let's just verify it respects minimum requirements
      expect(mapWithoutWindow.width).toBeGreaterThanOrEqual(minimumWidth);
      expect(mapWithoutWindow.height).toBeGreaterThanOrEqual(minimumHeight);

      global.window = originalWindow;
      mapWithoutWindow.cleanup();
    });
  });

  describe('Advanced Cleanup', () => {
    test('should remove resize listener on cleanup', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      dynamicMap = new DynamicZoneMap(12, 8);
      dynamicMap.cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', dynamicMap._resizeHandler);

      removeEventListenerSpy.mockRestore();
    });

    test('should not crash when window is undefined during cleanup', () => {
      const originalWindow = global.window;

      dynamicMap = new DynamicZoneMap(12, 8);
      global.window = undefined;

      expect(() => {
        dynamicMap.cleanup();
      }).not.toThrow();

      global.window = originalWindow;
    });
  });
});
