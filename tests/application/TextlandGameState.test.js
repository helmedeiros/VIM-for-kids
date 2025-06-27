/* eslint-env node, jest */
import { TextlandGameState } from '../../src/application/TextlandGameState.js';
import { Cursor } from '../../src/domain/entities/Cursor.js';
import { VimKey } from '../../src/domain/entities/VimKey.js';
import { Position } from '../../src/domain/value-objects/Position.js';

// Mock zone provider
class MockZoneProvider {
  createZone(zoneId) {
    if (zoneId === 'textland_exploration') {
      return {
        gameMap: {
          width: 12,
          height: 8,
          getTileAt: jest.fn(),
          isValidPosition: jest.fn(() => true),
          isWalkable: jest.fn(() => true),
        },
        getCursorStartPosition: () => new Position(2, 2),
        vimKeys: [
          new VimKey(new Position(2, 2), 'h', 'Move left'),
          new VimKey(new Position(8, 2), 'k', 'Move up'),
          new VimKey(new Position(5, 4), 'j', 'Move down'),
          new VimKey(new Position(2, 6), 'l', 'Move right'),
        ],
        textLabels: [
          { position: new Position(6, 1), text: 'Textland Exploration', style: 'title' },
        ],
        collectKey: jest.fn(),
        cleanup: jest.fn(),
      };
    }
    throw new Error(`Zone '${zoneId}' not found`);
  }
}

describe('TextlandGameState', () => {
  let textlandGameState;
  let mockZoneProvider;

  beforeEach(() => {
    mockZoneProvider = new MockZoneProvider();
    textlandGameState = new TextlandGameState(mockZoneProvider);
  });

  afterEach(() => {
    if (textlandGameState) {
      textlandGameState.cleanup();
    }
  });

  describe('constructor', () => {
    it('should create textland game state with zone provider', () => {
      expect(textlandGameState).toBeDefined();
      expect(textlandGameState.zone).toBeDefined();
      expect(textlandGameState.map).toBeDefined();
      expect(textlandGameState.cursor).toBeInstanceOf(Cursor);
    });

    it('should throw error without zone provider', () => {
      expect(() => new TextlandGameState()).toThrow('TextlandGameState requires a zone provider');
    });

    it('should load textland exploration zone', () => {
      expect(textlandGameState.zone).toBeDefined();
      expect(textlandGameState.availableKeys).toHaveLength(4);
      expect(textlandGameState.collectedKeys.size).toBe(0);
    });

    it('should initialize cursor at correct start position', () => {
      expect(textlandGameState.cursor.position.x).toBe(2);
      expect(textlandGameState.cursor.position.y).toBe(2);
    });
  });

  describe('key collection', () => {
    it('should collect keys when cursor is at key position', () => {
      const vimKey = textlandGameState.availableKeys[0];
      const initialKeyCount = textlandGameState.availableKeys.length;

      textlandGameState.collectKey(vimKey);

      expect(textlandGameState.collectedKeys.has(vimKey.key)).toBe(true);
      expect(textlandGameState.availableKeys.length).toBe(initialKeyCount - 1);
      expect(textlandGameState.zone.collectKey).toHaveBeenCalledWith(vimKey);
    });

    it('should not collect keys not in available keys', () => {
      const nonExistentKey = new VimKey(new Position(10, 10), 'x', 'Non-existent');
      const initialKeyCount = textlandGameState.availableKeys.length;

      textlandGameState.collectKey(nonExistentKey);

      expect(textlandGameState.collectedKeys.has('x')).toBe(false);
      expect(textlandGameState.availableKeys.length).toBe(initialKeyCount);
    });
  });

  describe('getCurrentState', () => {
    it('should return complete game state', () => {
      const state = textlandGameState.getCurrentState();

      expect(state).toHaveProperty('currentZone');
      expect(state).toHaveProperty('map');
      expect(state).toHaveProperty('cursor');
      expect(state).toHaveProperty('availableKeys');
      expect(state).toHaveProperty('collectedKeys');
      expect(state).toHaveProperty('textLabels');
      expect(state.gate).toBeNull(); // No gate in textland
      expect(state.npcs).toEqual([]); // No NPCs in textland
    });

    it('should have correct initial state', () => {
      const state = textlandGameState.getCurrentState();

      expect(state.availableKeys).toHaveLength(4);
      expect(state.collectedKeys.size).toBe(0);
      expect(state.textLabels).toHaveLength(1);
    });
  });

  describe('helper methods', () => {
    it('should return text labels', () => {
      const textLabels = textlandGameState.getTextLabels();
      expect(textLabels).toHaveLength(1);
      expect(textLabels[0].text).toBe('Textland Exploration');
    });

    it('should return null for gate', () => {
      const gate = textlandGameState.getGate();
      expect(gate).toBeNull();
    });

    it('should return empty array for NPCs', () => {
      const npcs = textlandGameState.getNPCs();
      expect(npcs).toEqual([]);
    });
  });

  describe('cleanup', () => {
    it('should cleanup zone resources', () => {
      textlandGameState.cleanup();
      expect(textlandGameState.zone.cleanup).toHaveBeenCalled();
    });

    it('should handle cleanup when zone has no cleanup method', () => {
      textlandGameState.zone.cleanup = undefined;
      expect(() => textlandGameState.cleanup()).not.toThrow();
    });
  });
});
