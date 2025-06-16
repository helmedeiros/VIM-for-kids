import { WelcomeMeadow } from '../../../src/domain/entities/WelcomeMeadow.js';
import { Position } from '../../../src/domain/value-objects/Position.js';
import { TileType } from '../../../src/domain/value-objects/TileType.js';

describe('WelcomeMeadow - Zone A', () => {
  let welcomeMeadow;

  beforeEach(() => {
    welcomeMeadow = new WelcomeMeadow();
  });

  describe('Grid Layout', () => {
    it('should have a 10x10 grid size', () => {
      expect(welcomeMeadow.size).toBe(10);
    });

    it('should be composed of grass and dirt areas', () => {
      let hasGrass = false;
      let hasDirt = false;

      for (let y = 0; y < welcomeMeadow.size; y++) {
        for (let x = 0; x < welcomeMeadow.size; x++) {
          const tile = welcomeMeadow.getTileAt(new Position(x, y));
          if (tile === TileType.GRASS) hasGrass = true;
          if (tile === TileType.DIRT) hasDirt = true;
        }
      }

      expect(hasGrass).toBe(true);
      expect(hasDirt).toBe(true);
    });

    it('should have water borders on top, left, and right edges only', () => {
      const size = welcomeMeadow.size;

      // Test top, left, and right borders (should be water - not walkable)
      expect(welcomeMeadow.isWalkable(new Position(0, 0))).toBe(false); // top-left
      expect(welcomeMeadow.isWalkable(new Position(size - 1, 0))).toBe(false); // top-right
      expect(welcomeMeadow.isWalkable(new Position(0, size - 1))).toBe(false); // bottom-left (left edge)
      expect(welcomeMeadow.isWalkable(new Position(size - 1, size - 1))).toBe(false); // bottom-right (right edge)

      // Test bottom edge (should be grass - walkable, except corners)
      expect(welcomeMeadow.isWalkable(new Position(1, size - 1))).toBe(true);
      expect(welcomeMeadow.isWalkable(new Position(size - 2, size - 1))).toBe(true);
    });
  });

  describe('Player Starting Position', () => {
    it('should start player in the dirt area as shown in image', () => {
      expect(welcomeMeadow.getPlayerStartPosition()).toEqual(new Position(6, 2));
    });

    it('should have walkable tile at center position', () => {
      const startPos = welcomeMeadow.getPlayerStartPosition();
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

      for (let y = 0; y < welcomeMeadow.size; y++) {
        for (let x = 0; x < welcomeMeadow.size; x++) {
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

      for (let y = 0; y < welcomeMeadow.size; y++) {
        for (let x = 0; x < welcomeMeadow.size; x++) {
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

  describe('Layout Validation', () => {
    it('should not have overlapping elements', () => {
      const keys = welcomeMeadow.getMovementKeys();
      const textLabels = welcomeMeadow.getTextLabels();
      const gate = welcomeMeadow.getGate();
      const playerStart = welcomeMeadow.getPlayerStartPosition();

      const positions = [];

      // Collect all positions
      keys.forEach((key) => positions.push(`${key.position.x},${key.position.y}`));
      textLabels.forEach((label) => positions.push(`${label.position.x},${label.position.y}`));
      positions.push(`${gate.position.x},${gate.position.y}`);
      positions.push(`${playerStart.x},${playerStart.y}`);

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
