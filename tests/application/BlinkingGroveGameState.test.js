import { BlinkingGroveGameState } from '../../src/application/BlinkingGroveGameState.js';
import { Cursor } from '../../src/domain/entities/Cursor.js';
import { VimKey } from '../../src/domain/entities/VimKey.js';
import { Position } from '../../src/domain/value-objects/Position.js';

describe('BlinkingGroveGameState', () => {
  let gameState;

  beforeEach(() => {
    gameState = new BlinkingGroveGameState();
  });

  afterEach(() => {
    // Clean up after each test
    if (gameState && gameState.cleanup) {
      gameState.cleanup();
    }
  });

  describe('Constructor', () => {
    test('should initialize with zone, map, cursor, and keys', () => {
      expect(gameState.zone).toBeDefined();
      expect(gameState.map).toBeDefined();
      expect(gameState.cursor).toBeInstanceOf(Cursor);
      expect(gameState.availableKeys).toHaveLength(4);
      expect(gameState.collectedKeys).toBeInstanceOf(Set);
      expect(gameState.collectedKeys.size).toBe(0);
    });

    test('should initialize cursor at zone start position', () => {
      const expectedPosition = gameState.zone.getCursorStartPosition();
      expect(gameState.cursor.position).toEqual(expectedPosition);
    });

    test('should initialize with all VIM movement keys', () => {
      const keyLetters = gameState.availableKeys.map((key) => key.key).sort();
      expect(keyLetters).toEqual(['h', 'j', 'k', 'l']);
    });
  });

  describe('Key Collection', () => {
    test('should collect available keys', () => {
      const hKey = gameState.availableKeys.find((key) => key.key === 'h');
      const initialKeyCount = gameState.availableKeys.length;

      gameState.collectKey(hKey);

      expect(gameState.collectedKeys.has('h')).toBe(true);
      expect(gameState.availableKeys).toHaveLength(initialKeyCount - 1);
      expect(gameState.availableKeys).not.toContain(hKey);
    });

    test('should not collect keys that are not available', () => {
      const fakeKey = new VimKey(new Position(0, 0), 'x', 'Fake key');
      const initialKeyCount = gameState.availableKeys.length;

      gameState.collectKey(fakeKey);

      expect(gameState.collectedKeys.has('x')).toBe(false);
      expect(gameState.availableKeys).toHaveLength(initialKeyCount);
    });

    test('should notify zone about key collection', () => {
      const hKey = gameState.availableKeys.find((key) => key.key === 'h');
      const zoneCollectKeySpy = jest.spyOn(gameState.zone, 'collectKey');

      gameState.collectKey(hKey);

      expect(zoneCollectKeySpy).toHaveBeenCalledWith(hKey);
    });

    test('should collect multiple keys correctly', () => {
      const hKey = gameState.availableKeys.find((key) => key.key === 'h');
      const jKey = gameState.availableKeys.find((key) => key.key === 'j');

      gameState.collectKey(hKey);
      gameState.collectKey(jKey);

      expect(gameState.collectedKeys.has('h')).toBe(true);
      expect(gameState.collectedKeys.has('j')).toBe(true);
      expect(gameState.availableKeys).toHaveLength(2);
    });
  });

  describe('Current State', () => {
    test('should return complete current state', () => {
      const currentState = gameState.getCurrentState();

      expect(currentState).toHaveProperty('map');
      expect(currentState).toHaveProperty('cursor');
      expect(currentState).toHaveProperty('availableKeys');
      expect(currentState).toHaveProperty('collectedKeys');
      expect(currentState).toHaveProperty('textLabels');
      expect(currentState).toHaveProperty('gate');
      expect(currentState).toHaveProperty('npcs');

      expect(currentState.map).toBe(gameState.map);
      expect(currentState.cursor).toBe(gameState.cursor);
      expect(currentState.availableKeys).toBe(gameState.availableKeys);
      expect(currentState.collectedKeys).toBe(gameState.collectedKeys);
    });

    test('should include zone-specific data in current state', () => {
      const currentState = gameState.getCurrentState();

      expect(currentState.textLabels).toEqual(gameState.zone.textLabels);
      expect(currentState.gate).toBe(gameState.zone.gate);
      expect(currentState.npcs).toEqual(gameState.zone.getActiveNPCs());
    });
  });

  describe('Zone Data Access', () => {
    test('should provide access to text labels', () => {
      const textLabels = gameState.getTextLabels();

      expect(textLabels).toBeDefined();
      expect(textLabels).toEqual(gameState.zone.textLabels);
    });

    test('should provide access to gate', () => {
      const gate = gameState.getGate();

      expect(gate).toBeDefined();
      expect(gate).toBe(gameState.zone.gate);
    });

    test('should provide access to NPCs', () => {
      const npcs = gameState.getNPCs();

      expect(npcs).toBeDefined();
      expect(npcs).toEqual(gameState.zone.getActiveNPCs());
    });
  });

  describe('Level Completion', () => {
    test('should not be complete initially', () => {
      expect(gameState.isLevelComplete()).toBe(false);
    });

    test('should be complete after collecting all keys', () => {
      const keys = [...gameState.availableKeys];

      keys.forEach((key) => {
        gameState.collectKey(key);
      });

      expect(gameState.isLevelComplete()).toBe(true);
    });

    test('should provide completion message when complete', () => {
      const keys = [...gameState.availableKeys];

      keys.forEach((key) => {
        gameState.collectKey(key);
      });

      const message = gameState.getCompletionMessage();
      expect(message).toContain('Blinking Grove completed');
      expect(message).toContain('h, j, k, l');
    });

    test('should provide empty completion message when not complete', () => {
      const message = gameState.getCompletionMessage();
      expect(message).toBe('');
    });
  });

  describe('Cleanup', () => {
    test('should cleanup zone resources', () => {
      // Mock the zone cleanup method
      gameState.zone.cleanup = jest.fn();

      gameState.cleanup();

      expect(gameState.zone.cleanup).toHaveBeenCalled();
    });

    test('should handle cleanup when zone has no cleanup method', () => {
      // Remove cleanup method from zone
      delete gameState.zone.cleanup;

      expect(() => gameState.cleanup()).not.toThrow();
    });

    test('should handle cleanup when zone is null', () => {
      gameState.zone = null;

      expect(() => gameState.cleanup()).not.toThrow();
    });
  });

  describe('Integration with Zone', () => {
    test('should reflect zone state changes', () => {
      const keys = [...gameState.availableKeys];

      // Collect all keys
      keys.forEach((key) => {
        gameState.collectKey(key);
      });

      // Zone should be complete
      expect(gameState.zone.isComplete()).toBe(true);
      expect(gameState.isLevelComplete()).toBe(true);

      // Gate should be open
      expect(gameState.zone.gate.isOpen).toBe(true);

      // NPCs should be active
      const activeNPCs = gameState.zone.getActiveNPCs();
      expect(activeNPCs).toHaveLength(1);
      expect(activeNPCs[0].id).toBe('caret_stone');
    });

    test('should maintain consistency between gameState and zone', () => {
      const hKey = gameState.availableKeys.find((key) => key.key === 'h');

      gameState.collectKey(hKey);

      // Both should reflect the same collected keys
      expect(gameState.collectedKeys.has('h')).toBe(true);
      expect(gameState.zone.getCollectedKeys().has('h')).toBe(true);
    });
  });

  describe('State Mutations', () => {
    test('should handle cursor position changes', () => {
      const newPosition = new Position(10, 10);
      gameState.cursor = gameState.cursor.moveTo(newPosition);

      const currentState = gameState.getCurrentState();
      expect(currentState.cursor.position).toEqual(newPosition);
    });

    test('should handle multiple state changes', () => {
      const hKey = gameState.availableKeys.find((key) => key.key === 'h');
      const jKey = gameState.availableKeys.find((key) => key.key === 'j');
      const newPosition = new Position(5, 5);

      // Multiple state changes
      gameState.collectKey(hKey);
      gameState.collectKey(jKey);
      gameState.cursor = gameState.cursor.moveTo(newPosition);

      const currentState = gameState.getCurrentState();
      expect(currentState.collectedKeys.size).toBe(2);
      expect(currentState.availableKeys).toHaveLength(2);
      expect(currentState.cursor.position).toEqual(newPosition);
    });
  });
});
