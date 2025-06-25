import { WelcomeMeadow } from '../../../src/domain/entities/WelcomeMeadow.js';
import { Position } from '../../../src/domain/value-objects/Position.js';
import { TileType } from '../../../src/domain/value-objects/TileType.js';

describe('WelcomeMeadow - Zone A', () => {
  let welcomeMeadow;

  beforeEach(() => {
    welcomeMeadow = new WelcomeMeadow();
  });

  describe('Grid Layout', () => {
    it('should have dynamic grid size based on screen dimensions', () => {
      // Test environment uses default dimensions (1024x768)
      // ceil(1024/32) + 2 = 32 + 2 = 34
      // ceil(768/32) + 2 = 24 + 2 = 26
      expect(welcomeMeadow.width).toBe(34); // ceil(1024/32) + 2 = 32 + 2
      expect(welcomeMeadow.height).toBe(26); // ceil(768/32) + 2 = 24 + 2
    });

    it('should have width and height properties for rectangular grid support', () => {
      // These properties are needed for the DOMGameRenderer to handle rectangular grids
      expect(welcomeMeadow).toHaveProperty('width');
      expect(welcomeMeadow).toHaveProperty('height');
      expect(typeof welcomeMeadow.width).toBe('number');
      expect(typeof welcomeMeadow.height).toBe('number');
      expect(welcomeMeadow.width).toBeGreaterThan(0);
      expect(welcomeMeadow.height).toBeGreaterThan(0);
    });

    it('should adapt grid size to different screen dimensions', () => {
      // Test with smaller screen (1366x768)
      welcomeMeadow._setTestDimensions(1366, 768);
      expect(welcomeMeadow.width).toBe(Math.ceil(1366 / 32) + 2); // 43 + 2 = 45
      expect(welcomeMeadow.height).toBe(Math.ceil(768 / 32) + 2); // 24 + 2 = 26

      // Test with mobile screen (390x844)
      welcomeMeadow._setTestDimensions(390, 844);
      expect(welcomeMeadow.width).toBe(Math.max(Math.ceil(390 / 32) + 2, 24)); // max(14, 24) = 24
      expect(welcomeMeadow.height).toBe(Math.max(Math.ceil(844 / 32) + 2, 16)); // max(28, 16) = 28

      // Test with large screen (2560x1440)
      welcomeMeadow._setTestDimensions(2560, 1440);
      expect(welcomeMeadow.width).toBe(Math.ceil(2560 / 32) + 2); // 80 + 2 = 82
      expect(welcomeMeadow.height).toBe(Math.ceil(1440 / 32) + 2); // 45 + 2 = 47

      // Restore default for other tests
      welcomeMeadow._setTestDimensions(1920, 1080);
    });

    it('should be composed of water, grass and dirt areas', () => {
      let hasWater = false;
      let hasGrass = false;
      let hasDirt = false;

      for (let y = 0; y < welcomeMeadow.height; y++) {
        for (let x = 0; x < welcomeMeadow.width; x++) {
          const tile = welcomeMeadow.getTileAt(new Position(x, y));
          if (tile === TileType.WATER) hasWater = true;
          if (tile === TileType.GRASS) hasGrass = true;
          if (tile === TileType.DIRT) hasDirt = true;
        }
      }

      expect(hasWater).toBe(true);
      expect(hasGrass).toBe(true);
      expect(hasDirt).toBe(true);
    });

    it('should have water filling entire screen with centered grass area', () => {
      // Test corners should be water
      expect(welcomeMeadow.isWalkable(new Position(0, 0))).toBe(false); // top-left
      expect(welcomeMeadow.isWalkable(new Position(welcomeMeadow.width - 1, 0))).toBe(false); // top-right
      expect(welcomeMeadow.isWalkable(new Position(0, welcomeMeadow.height - 1))).toBe(false); // bottom-left
      expect(
        welcomeMeadow.isWalkable(new Position(welcomeMeadow.width - 1, welcomeMeadow.height - 1))
      ).toBe(false); // bottom-right

      // Test that there's a grass area in the center
      const centerX = Math.floor(welcomeMeadow.width / 2);
      const centerY = Math.floor(welcomeMeadow.height / 2);
      const tile = welcomeMeadow.getTileAt(new Position(centerX, centerY));
      expect(tile === TileType.GRASS || tile === TileType.DIRT).toBe(true);
    });

    it('should have precisely centered 12x8 grass area within dynamic grid', () => {
      // Calculate expected grass area bounds based on current grid size
      const grassWidth = 12;
      const grassHeight = 8;
      const grassStartX = Math.floor((welcomeMeadow.width - grassWidth) / 2);
      const grassStartY = Math.floor((welcomeMeadow.height - grassHeight) / 2);

      // For 34x26 grid: (34-12)/2 = 11, (26-8)/2 = 9
      expect(grassStartX).toBe(11);
      expect(grassStartY).toBe(9);

      // Test grass area bounds (accounting for tree and stone areas)
      for (let y = grassStartY; y < grassStartY + grassHeight; y++) {
        for (let x = grassStartX; x < grassStartX + grassWidth; x++) {
          const tile = welcomeMeadow.getTileAt(new Position(x, y));
          // Should be grass, dirt, tree, or stone (since these overlay the grass area)
          expect(
            [TileType.GRASS, TileType.DIRT, TileType.TREE, TileType.STONE].includes(tile)
          ).toBe(true);
        }
      }

      // Test areas outside grass bounds should be water
      expect(welcomeMeadow.getTileAt(new Position(grassStartX - 1, grassStartY))).toBe(
        TileType.WATER
      );
      expect(welcomeMeadow.getTileAt(new Position(grassStartX + grassWidth, grassStartY))).toBe(
        TileType.WATER
      );
    });

    it('should have 3x3 dirt starting area positioned correctly', () => {
      // Expected dirt area should be at left side of grass area
      const grassWidth = 12;
      const grassHeight = 8;
      const grassStartX = Math.floor((welcomeMeadow.width - grassWidth) / 2);
      const grassStartY = Math.floor((welcomeMeadow.height - grassHeight) / 2);
      const dirtStartX = grassStartX;
      const dirtStartY = grassStartY + 1; // Offset from top of grass

      // Test all 9 positions of the 3x3 dirt area
      for (let y = dirtStartY; y < dirtStartY + 3; y++) {
        for (let x = dirtStartX; x < dirtStartX + 3; x++) {
          const tile = welcomeMeadow.getTileAt(new Position(x, y));
          expect(tile).toBe(TileType.DIRT);
        }
      }
    });

    it('should have horizontal dirt path connecting starting area to stone area', () => {
      const grassWidth = 12;
      const grassHeight = 8;
      const grassStartX = Math.floor((welcomeMeadow.width - grassWidth) / 2);
      const grassStartY = Math.floor((welcomeMeadow.height - grassHeight) / 2);
      const dirtStartY = grassStartY + 1;
      const pathY = dirtStartY + 1; // Middle of 3x3 dirt area

      // Test horizontal path from dirt area to stone area
      for (let x = grassStartX + 3; x < grassStartX + 12 - 2; x++) {
        const tile = welcomeMeadow.getTileAt(new Position(x, pathY));
        expect(tile).toBe(TileType.DIRT);
      }
    });
  });

  describe('Cursor Starting Position', () => {
    it('should start cursor in the center of 3x3 dirt area', () => {
      const startPos = welcomeMeadow.getCursorStartPosition();
      const tile = welcomeMeadow.getTileAt(startPos);
      expect(tile).toBe(TileType.DIRT);
    });

    it('should have walkable tile at center position', () => {
      const startPos = welcomeMeadow.getCursorStartPosition();
      expect(welcomeMeadow.isWalkable(startPos)).toBe(true);
    });
  });

  describe('Movement Keys Placement', () => {
    it('should have exactly 4 collectable movement keys', () => {
      const keys = welcomeMeadow.getMovementKeys();
      expect(keys).toHaveLength(4);

      const keyLetters = keys.map((key) => key.key);
      expect(keyLetters).toContain('h');
      expect(keyLetters).toContain('j');
      expect(keyLetters).toContain('k');
      expect(keyLetters).toContain('l');
    });

    it('should place all movement keys on dirt tiles', () => {
      const keys = welcomeMeadow.getMovementKeys();

      keys.forEach((key) => {
        const tile = welcomeMeadow.getTileAt(key.position);
        expect(tile).toBe(TileType.DIRT);
      });
    });

    it('should have movement keys at accessible positions', () => {
      const keys = welcomeMeadow.getMovementKeys();

      keys.forEach((key) => {
        expect(welcomeMeadow.isWalkable(key.position)).toBe(true);
      });
    });

    it('should have proper descriptions for movement keys', () => {
      const keys = welcomeMeadow.getMovementKeys();

      const hKey = keys.find((k) => k.key === 'h');
      const jKey = keys.find((k) => k.key === 'j');
      const kKey = keys.find((k) => k.key === 'k');
      const lKey = keys.find((k) => k.key === 'l');

      expect(hKey.description).toBe('Move left');
      expect(jKey.description).toBe('Move down');
      expect(kKey.description).toBe('Move up');
      expect(lKey.description).toBe('Move right');
    });
  });

  describe('Hello World Text Display', () => {
    it('should have "Hello world!" text labels placed on the ground', () => {
      const textLabels = welcomeMeadow.getTextLabels();

      // Should have letters to spell "Hello world!"
      const expectedLetters = ['H', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd', '!'];
      expect(textLabels).toHaveLength(expectedLetters.length);

      const labelTexts = textLabels.map((label) => label.text);
      expectedLetters.forEach((letter) => {
        expect(labelTexts).toContain(letter);
      });
    });

    it('should place text labels on walkable tiles', () => {
      const textLabels = welcomeMeadow.getTextLabels();

      textLabels.forEach((label) => {
        expect(welcomeMeadow.isWalkable(label.position)).toBe(true);
      });
    });

    it('should have text labels in proper sequence', () => {
      const textLabels = welcomeMeadow.getTextLabels();

      // Sort by position to check sequence
      const sortedLabels = textLabels.sort((a, b) => {
        if (a.position.y !== b.position.y) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      });

      const message = sortedLabels.map((label) => label.text).join('');
      expect(message).toBe('Hello world!');
    });
  });

  describe('Tree Obstacle', () => {
    it('should have exactly 1 tree in the meadow', () => {
      let treeCount = 0;

      for (let y = 0; y < welcomeMeadow.height; y++) {
        for (let x = 0; x < welcomeMeadow.width; x++) {
          const tile = welcomeMeadow.getTileAt(new Position(x, y));
          if (tile === TileType.TREE) {
            treeCount++;
          }
        }
      }

      expect(treeCount).toBe(1);
    });

    it('should have tree as non-walkable obstacle', () => {
      let treePosition = null;

      for (let y = 0; y < welcomeMeadow.height; y++) {
        for (let x = 0; x < welcomeMeadow.width; x++) {
          const pos = new Position(x, y);
          const tile = welcomeMeadow.getTileAt(pos);
          if (tile === TileType.TREE) {
            treePosition = pos;
            break;
          }
        }
        if (treePosition) break;
      }

      expect(treePosition).toBeTruthy();
      expect(welcomeMeadow.isWalkable(treePosition)).toBe(false);
    });

    it('should have tree positioned correctly in grass area', () => {
      const grassWidth = 12;
      const grassHeight = 8;
      const grassStartX = Math.floor((welcomeMeadow.width - grassWidth) / 2);
      const grassStartY = Math.floor((welcomeMeadow.height - grassHeight) / 2);
      const expectedTreePosition = new Position(grassStartX + 1, grassStartY + 5);

      const tile = welcomeMeadow.getTileAt(expectedTreePosition);
      expect(tile).toBe(TileType.TREE);
    });
  });

  describe('Gate System', () => {
    it('should have a gate in the meadow', () => {
      const gate = welcomeMeadow.getGate();
      expect(gate).toBeTruthy();
      expect(gate.position).toBeInstanceOf(Position);
    });

    it('should have gate initially closed', () => {
      const gate = welcomeMeadow.getGate();
      expect(gate.isOpen).toBe(false);
    });

    it('should have gate as non-walkable when closed', () => {
      const gate = welcomeMeadow.getGate();
      expect(welcomeMeadow.isWalkable(gate.position)).toBe(false);
    });

    it('should open gate after collecting all 4 movement keys', () => {
      const keys = welcomeMeadow.getMovementKeys();
      const gate = welcomeMeadow.getGate();

      // Initially closed
      expect(gate.isOpen).toBe(false);

      // Collect all keys
      keys.forEach((key) => {
        welcomeMeadow.collectKey(key);
      });

      // Gate should now be open
      expect(gate.isOpen).toBe(true);
    });

    it('should make gate walkable after opening', () => {
      const keys = welcomeMeadow.getMovementKeys();
      const gate = welcomeMeadow.getGate();

      // Collect all keys
      keys.forEach((key) => {
        welcomeMeadow.collectKey(key);
      });

      expect(welcomeMeadow.isWalkable(gate.position)).toBe(true);
    });

    it('should not open gate with partial key collection', () => {
      const keys = welcomeMeadow.getMovementKeys();
      const gate = welcomeMeadow.getGate();

      // Collect only first 3 keys
      for (let i = 0; i < 3; i++) {
        welcomeMeadow.collectKey(keys[i]);
      }

      expect(gate.isOpen).toBe(false);
    });
  });

  describe('Stone Area', () => {
    it('should have stone area positioned at the right edge of grass area', () => {
      const grassWidth = 12;
      const grassHeight = 8;
      const grassStartX = Math.floor((welcomeMeadow.width - grassWidth) / 2);
      const grassStartY = Math.floor((welcomeMeadow.height - grassHeight) / 2);
      const stoneStartX = grassStartX + grassWidth; // Should be 37 for 62x36 grid
      const stoneStartY = grassStartY + 2; // Should be 16 for 62x36 grid

      // Test stone area bounds (2x4 area)
      for (let y = stoneStartY; y < stoneStartY + 4; y++) {
        for (let x = stoneStartX; x < stoneStartX + 2; x++) {
          if (x < welcomeMeadow.width && y < welcomeMeadow.height) {
            const tile = welcomeMeadow.getTileAt(new Position(x, y));
            expect(tile).toBe(TileType.STONE);
          }
        }
      }
    });

    it('should have gate positioned within stone area', () => {
      const gate = welcomeMeadow.getGate();
      const tile = welcomeMeadow.getTileAt(gate.position);
      expect(tile).toBe(TileType.STONE);
    });

    it('should have stone area positioned well within grid bounds', () => {
      const grassWidth = 12;
      const grassHeight = 8;
      const grassStartX = Math.floor((welcomeMeadow.width - grassWidth) / 2);
      const grassStartY = Math.floor((welcomeMeadow.height - grassHeight) / 2);
      const stoneStartX = grassStartX + grassWidth; // 37 for 62x36 grid
      const stoneStartY = grassStartY + 2; // 16 for 62x36 grid

      // Test that stone positions exist within bounds
      expect(welcomeMeadow.getTileAt(new Position(stoneStartX, stoneStartY))).toBe(TileType.STONE);
      expect(welcomeMeadow.getTileAt(new Position(stoneStartX + 1, stoneStartY))).toBe(
        TileType.STONE
      );

      // Test positions beyond stone area should be water (back to grass/water)
      if (stoneStartX + 2 < welcomeMeadow.width) {
        expect(welcomeMeadow.getTileAt(new Position(stoneStartX + 2, stoneStartY))).toBe(
          TileType.WATER
        );
      }
    });
  });

  describe('Layout Validation', () => {
    it('should not have overlapping elements', () => {
      const keys = welcomeMeadow.getMovementKeys();
      const textLabels = welcomeMeadow.getTextLabels();
      const gate = welcomeMeadow.getGate();
      const cursorStart = welcomeMeadow.getCursorStartPosition();

      const positions = [];

      // Collect all positions
      keys.forEach((key) => positions.push(`${key.position.x},${key.position.y}`));
      textLabels.forEach((label) => positions.push(`${label.position.x},${label.position.y}`));
      positions.push(`${gate.position.x},${gate.position.y}`);
      positions.push(`${cursorStart.x},${cursorStart.y}`);

      // Check for duplicates
      const uniquePositions = new Set(positions);
      expect(positions.length).toBe(uniquePositions.size);
    });

    it('should have all interactive elements within grid bounds', () => {
      const keys = welcomeMeadow.getMovementKeys();
      const textLabels = welcomeMeadow.getTextLabels();
      const gate = welcomeMeadow.getGate();

      const allElements = [...keys, ...textLabels, gate];

      allElements.forEach((element) => {
        expect(welcomeMeadow.isValidPosition(element.position)).toBe(true);
      });
    });
  });

  describe('Game Progression', () => {
    it('should track collected keys', () => {
      const keys = welcomeMeadow.getMovementKeys();

      expect(welcomeMeadow.getCollectedKeysCount()).toBe(0);

      welcomeMeadow.collectKey(keys[0]);
      expect(welcomeMeadow.getCollectedKeysCount()).toBe(1);

      welcomeMeadow.collectKey(keys[1]);
      expect(welcomeMeadow.getCollectedKeysCount()).toBe(2);
    });

    it('should indicate completion when all keys collected and gate opened', () => {
      const keys = welcomeMeadow.getMovementKeys();

      expect(welcomeMeadow.isComplete()).toBe(false);

      // Collect all keys
      keys.forEach((key) => {
        welcomeMeadow.collectKey(key);
      });

      expect(welcomeMeadow.isComplete()).toBe(true);
    });
  });
});
