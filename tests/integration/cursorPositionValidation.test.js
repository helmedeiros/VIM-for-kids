import fs from 'fs';
import path from 'path';

// Jest-compatible validation functions
const getZoneFiles = () => {
  // Use relative path from project root
  const zonesDir = './src/infrastructure/data/zones';
  return fs
    .readdirSync(zonesDir)
    .filter((file) => file.endsWith('Zone.js'))
    .map((file) => path.join(zonesDir, file));
};

const parseZoneFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract zone name
    const nameMatch = content.match(/name:\s*['"`]([^'"`]+)['"`]/);
    const zoneName = nameMatch ? nameMatch[1] : path.basename(filePath, '.js');

    // Extract cursor position
    const cursorMatch = content.match(/cursorStartPosition:\s*new\s+Position\((\d+),\s*(\d+)\)/);
    if (!cursorMatch) {
      return {
        valid: false,
        error: 'No cursor start position found',
        zone: zoneName,
        filePath,
      };
    }

    const cursorX = parseInt(cursorMatch[1]);
    const cursorY = parseInt(cursorMatch[2]);

    // Extract layout
    const layoutMatch = content.match(/layout:\s*\[([\s\S]*?)\]/);
    if (!layoutMatch) {
      return {
        valid: false,
        error: 'No layout found',
        zone: zoneName,
        filePath,
      };
    }

    const layoutContent = layoutMatch[1];
    const rowMatches = layoutContent.match(/['"`][^'"`]*['"`]/g);
    if (!rowMatches) {
      return {
        valid: false,
        error: 'Could not parse layout rows',
        zone: zoneName,
        filePath,
      };
    }

    const layout = rowMatches.map((row) => row.slice(1, -1));

    // Extract legend
    const legendMatch = content.match(/legend:\s*\{([\s\S]*?)\}/);
    if (!legendMatch) {
      return {
        valid: false,
        error: 'No legend found',
        zone: zoneName,
        filePath,
      };
    }

    const legendContent = legendMatch[1];
    const legend = {};
    const legendEntries = legendContent.match(/(['"`]?[^'"`:\s]+['"`]?):\s*['"`]([^'"`]+)['"`]/g);
    if (legendEntries) {
      legendEntries.forEach((entry) => {
        const match = entry.match(/(['"`]?[^'"`:\s]+['"`]?):\s*['"`]([^'"`]+)['"`]/);
        if (match) {
          // Remove quotes from key if present
          const key = match[1].replace(/['"`]/g, '');
          legend[key] = match[2];
        }
      });
    }

    return {
      valid: true,
      zone: zoneName,
      filePath,
      cursorPosition: { x: cursorX, y: cursorY },
      layout,
      legend,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to parse file: ${error.message}`,
      zone: path.basename(filePath, '.js'),
      filePath,
    };
  }
};

const getWalkableTileTypes = () => {
  // Known walkable tile types from TileType.js
  return ['path', 'dirt', 'field', 'bridge', 'sand', 'test_ground', 'boss_area', 'grass'];
};

const validateZonePosition = (zoneData, walkableTileTypes) => {
  if (!zoneData.valid) {
    return zoneData;
  }

  const { cursorPosition, layout, legend, zone } = zoneData;
  const x = cursorPosition.x;
  const y = cursorPosition.y;

  // Check bounds
  if (y < 0 || y >= layout.length) {
    return {
      valid: false,
      error: `Position (${x},${y}) Y coordinate out of bounds. Layout has ${layout.length} rows (0-${layout.length - 1})`,
      zone,
    };
  }

  const row = layout[y];
  if (x < 0 || x >= row.length) {
    return {
      valid: false,
      error: `Position (${x},${y}) X coordinate out of bounds. Row ${y} has ${row.length} characters (0-${row.length - 1})`,
      zone,
    };
  }

  // Get tile character and type
  const tileChar = row[x];
  const tileType = legend[tileChar];

  if (!tileType) {
    return {
      valid: false,
      error: `Unknown tile character '${tileChar}' at position (${x},${y})`,
      zone,
    };
  }

  // Check walkability
  const isWalkable = walkableTileTypes.includes(tileType);

  if (!isWalkable) {
    return {
      valid: false,
      error: `Tile type '${tileType}' at position (${x},${y}) is not walkable`,
      zone,
    };
  }

  return {
    valid: true,
    zone,
    position: [x, y],
    tileChar,
    tileType,
  };
};

describe('Cursor Position Validation Integration', () => {
  let walkableTileTypes;
  let zones;

  beforeAll(() => {
    // Load data for all tests
    walkableTileTypes = getWalkableTileTypes();
    const zoneFiles = getZoneFiles();
    zones = zoneFiles.map(parseZoneFile);
  });

  describe('Zone Discovery', () => {
    it('should discover all zone files automatically', () => {
      expect(zones).toBeDefined();
      expect(zones.length).toBeGreaterThan(0);

      // Verify we have the expected zones (at least the core ones)
      const zoneNames = zones.map((z) => z.zone);
      expect(zoneNames).toContain('1. Blinking Grove');
      expect(zoneNames).toContain('2. Maze of Modes');
      expect(zoneNames).toContain('3. Swamp of Words');
    });

    it('should successfully parse all zone files', () => {
      const invalidZones = zones.filter((zone) => !zone.valid);

      if (invalidZones.length > 0) {
        const errors = invalidZones.map((z) => `${z.zone}: ${z.error}`).join('\n');
        throw new Error(`Failed to parse zone files:\n${errors}`);
      }

      expect(zones.every((zone) => zone.valid)).toBe(true);
    });
  });

  describe('Walkable Tile Types', () => {
    it('should have walkable tile types defined', () => {
      expect(walkableTileTypes).toBeDefined();
      expect(Array.isArray(walkableTileTypes)).toBe(true);
      expect(walkableTileTypes.length).toBeGreaterThan(0);

      // Should include common walkable types
      expect(walkableTileTypes).toContain('path');
    });
  });

  describe('Individual Zone Validation', () => {
    it('should have valid cursor positions for all zones', () => {
      const validZones = zones.filter((z) => z.valid);

      validZones.forEach((zoneData) => {
        const result = validateZonePosition(zoneData, walkableTileTypes);

        if (!result.valid) {
          throw new Error(`${result.zone}: ${result.error}`);
        }

        expect(result.valid).toBe(true);
        expect(result.position).toBeDefined();
        expect(result.tileType).toBeDefined();
        expect(walkableTileTypes).toContain(result.tileType);
      });
    });
  });

  describe('Game Integration Requirements', () => {
    it('should ensure all zones have cursor positions suitable for game start', () => {
      const validZones = zones.filter((z) => z.valid);

      for (const zoneData of validZones) {
        const { cursorPosition } = zoneData;

        // Cursor should be positioned for zone entry (typically near edges or designated start areas)
        expect(cursorPosition.x).toBeGreaterThanOrEqual(0);
        expect(cursorPosition.y).toBeGreaterThanOrEqual(0);
      }
    });

    it('should validate that no zone has cursor on water or impassable terrain', () => {
      const validZones = zones.filter((z) => z.valid);
      const impassableTypes = ['water', 'wall', 'void', 'tree', 'rock'];

      for (const zoneData of validZones) {
        const result = validateZonePosition(zoneData, walkableTileTypes);
        expect(result.valid).toBe(true);
        expect(impassableTypes).not.toContain(result.tileType);
      }
    });
  });

  describe('Comprehensive Validation', () => {
    it('should pass validation for all zones', () => {
      const results = zones.map((zoneData) => validateZonePosition(zoneData, walkableTileTypes));
      const allValid = results.every((r) => r.valid);

      if (!allValid) {
        const errors = results.filter((r) => !r.valid).map((r) => `${r.zone}: ${r.error}`);
        throw new Error(`Cursor position validation failed:\n${errors.join('\n')}`);
      }

      expect(allValid).toBe(true);
    });

    it('should maintain validation when new zones are added', () => {
      // This test ensures the system scales automatically
      const currentZoneCount = zones.length;
      expect(currentZoneCount).toBeGreaterThanOrEqual(10); // We currently have 10 zones

      // If this test fails after adding zones, it means the new zone has invalid cursor position
      const validZoneCount = zones.filter((z) => z.valid).length;
      expect(validZoneCount).toBe(currentZoneCount); // All discovered zones should be valid
    });
  });

  describe('Error Reporting', () => {
    it('should provide clear error messages for any invalid positions', () => {
      const invalidZones = zones.filter((zone) => !zone.valid);

      // If there are invalid zones, their errors should be descriptive
      invalidZones.forEach((zone) => {
        expect(zone.error).toBeDefined();
        expect(typeof zone.error).toBe('string');
        expect(zone.error.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('should validate all zones within reasonable time', () => {
      const startTime = Date.now();

      zones.forEach((zoneData) => validateZonePosition(zoneData, walkableTileTypes));

      const endTime = Date.now();
      const validationTime = endTime - startTime;
      expect(validationTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
