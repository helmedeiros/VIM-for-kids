import { EntityIndex } from '../../../src/infrastructure/rendering/EntityIndex.js';

describe('EntityIndex', () => {
  let index;

  beforeEach(() => {
    index = new EntityIndex();
  });

  function createMockGameState(overrides = {}) {
    return {
      availableKeys: overrides.availableKeys || [],
      availableCollectibleKeys: overrides.availableCollectibleKeys || [],
      npcs: overrides.npcs || [],
      textLabels: overrides.textLabels || [],
      gate: overrides.gate || null,
      secondaryGates: overrides.secondaryGates || [],
    };
  }

  describe('rebuild', () => {
    it('indexes VIM keys by position', () => {
      const gameState = createMockGameState({
        availableKeys: [{ position: { x: 5, y: 10 }, key: 'h' }],
      });
      index.rebuild(gameState);
      expect(index.getKeyAt(5, 10)).toEqual({ position: { x: 5, y: 10 }, key: 'h' });
    });

    it('indexes collectible keys by position', () => {
      const gameState = createMockGameState({
        availableCollectibleKeys: [{ position: { x: 3, y: 7 }, keyId: 'maze_key', color: 'gold' }],
      });
      index.rebuild(gameState);
      expect(index.getCollectibleAt(3, 7).keyId).toBe('maze_key');
    });

    it('indexes NPCs by array position', () => {
      const gameState = createMockGameState({
        npcs: [{ id: 'caret_spirit', position: [8, 12] }],
      });
      index.rebuild(gameState);
      expect(index.getNPCAt(8, 12).id).toBe('caret_spirit');
    });

    it('skips NPCs without valid position', () => {
      const gameState = createMockGameState({
        npcs: [{ id: 'broken', position: null }],
      });
      index.rebuild(gameState);
      expect(index.getNPCAt(0, 0)).toBeNull();
    });

    it('indexes text labels by position', () => {
      const gameState = createMockGameState({
        textLabels: [{ position: { x: 2, y: 3 }, text: 'H', color: '#fff' }],
      });
      index.rebuild(gameState);
      expect(index.getTextLabelAt(2, 3).text).toBe('H');
    });

    it('indexes main gate', () => {
      const gameState = createMockGameState({
        gate: { position: { x: 15, y: 5 }, isOpen: false },
      });
      index.rebuild(gameState);
      expect(index.getGateAt(15, 5)).not.toBeNull();
      expect(index.getGateAt(15, 5).isOpen).toBe(false);
    });

    it('indexes closed secondary gates only', () => {
      const gameState = createMockGameState({
        secondaryGates: [
          { position: { x: 10, y: 8 }, isOpen: false },
          { position: { x: 12, y: 8 }, isOpen: true },
        ],
      });
      index.rebuild(gameState);
      expect(index.getSecondaryGateAt(10, 8)).not.toBeNull();
      expect(index.getSecondaryGateAt(12, 8)).toBeNull(); // open gates not indexed
    });

    it('clears previous data on rebuild', () => {
      index.rebuild(
        createMockGameState({
          availableKeys: [{ position: { x: 1, y: 1 }, key: 'h' }],
        })
      );
      index.rebuild(createMockGameState());
      expect(index.getKeyAt(1, 1)).toBeNull();
    });
  });

  describe('lookup methods', () => {
    it('returns null for empty positions', () => {
      index.rebuild(createMockGameState());
      expect(index.getKeyAt(0, 0)).toBeNull();
      expect(index.getCollectibleAt(0, 0)).toBeNull();
      expect(index.getNPCAt(0, 0)).toBeNull();
      expect(index.getTextLabelAt(0, 0)).toBeNull();
      expect(index.getGateAt(0, 0)).toBeNull();
      expect(index.getSecondaryGateAt(0, 0)).toBeNull();
    });

    it('returns null for gate when no gate exists', () => {
      index.rebuild(createMockGameState());
      expect(index.getGateAt(0, 0)).toBeNull();
    });

    it('returns null for gate at wrong position', () => {
      index.rebuild(
        createMockGameState({
          gate: { position: { x: 5, y: 5 }, isOpen: false },
        })
      );
      expect(index.getGateAt(6, 5)).toBeNull();
    });
  });

  describe('handles missing properties gracefully', () => {
    it('handles gameState with undefined properties', () => {
      index.rebuild({});
      expect(index.getKeyAt(0, 0)).toBeNull();
    });

    it('handles null availableKeys', () => {
      index.rebuild({ availableKeys: null });
      expect(index.getKeyAt(0, 0)).toBeNull();
    });
  });
});
