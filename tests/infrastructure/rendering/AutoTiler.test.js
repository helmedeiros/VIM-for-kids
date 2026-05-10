import { AutoTiler } from '../../../src/infrastructure/rendering/AutoTiler.js';

describe('AutoTiler', () => {
  let autoTiler;

  beforeEach(() => {
    autoTiler = new AutoTiler();
  });

  describe('getGroup', () => {
    it('returns water group for water', () => {
      expect(autoTiler.getGroup('water')).toBe('water');
    });

    it('returns land group for grass', () => {
      expect(autoTiler.getGroup('grass')).toBe('land');
    });

    it('returns obstacle group for wall', () => {
      expect(autoTiler.getGroup('wall')).toBe('obstacle');
    });

    it('returns land for unknown tiles', () => {
      expect(autoTiler.getGroup('unknown')).toBe('land');
    });
  });

  describe('needsTransition', () => {
    it('returns true for different groups', () => {
      expect(autoTiler.needsTransition('grass', 'water')).toBe(true);
      expect(autoTiler.needsTransition('grass', 'wall')).toBe(true);
    });

    it('returns false for same group', () => {
      expect(autoTiler.needsTransition('grass', 'dirt')).toBe(false);
      expect(autoTiler.needsTransition('grass', 'path')).toBe(false);
    });

    it('returns false for null tiles', () => {
      expect(autoTiler.needsTransition(null, 'grass')).toBe(false);
      expect(autoTiler.needsTransition('grass', null)).toBe(false);
    });
  });

  describe('computeMask', () => {
    it('returns 0 when all neighbors match', () => {
      expect(autoTiler.computeMask('grass', 'grass', 'dirt', 'path', 'grass')).toBe(0);
    });

    it('sets bit 0 for north transition', () => {
      expect(autoTiler.computeMask('grass', 'water', 'grass', 'grass', 'grass')).toBe(1);
    });

    it('sets bit 1 for east transition', () => {
      expect(autoTiler.computeMask('grass', 'grass', 'water', 'grass', 'grass')).toBe(2);
    });

    it('sets bit 2 for south transition', () => {
      expect(autoTiler.computeMask('grass', 'grass', 'grass', 'water', 'grass')).toBe(4);
    });

    it('sets bit 3 for west transition', () => {
      expect(autoTiler.computeMask('grass', 'grass', 'grass', 'grass', 'water')).toBe(8);
    });

    it('combines bits for multiple transitions', () => {
      expect(autoTiler.computeMask('grass', 'water', 'water', 'grass', 'grass')).toBe(3);
    });

    it('returns 15 when all neighbors differ', () => {
      expect(autoTiler.computeMask('grass', 'water', 'wall', 'water', 'wall')).toBe(15);
    });
  });

  describe('drawTransition', () => {
    let mockCtx;

    beforeEach(() => {
      mockCtx = { fillStyle: '', fillRect: jest.fn() };
    });

    it('does nothing for mask 0', () => {
      autoTiler.drawTransition(mockCtx, 0, 0, 0, 32, 'water');
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it('draws north edge for mask 1', () => {
      autoTiler.drawTransition(mockCtx, 1, 0, 0, 32, 'water');
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(1);
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 32, 6);
    });

    it('draws east edge for mask 2', () => {
      autoTiler.drawTransition(mockCtx, 2, 0, 0, 32, 'water');
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(1);
      expect(mockCtx.fillRect).toHaveBeenCalledWith(26, 0, 6, 32);
    });

    it('draws all edges for mask 15', () => {
      autoTiler.drawTransition(mockCtx, 15, 0, 0, 32, 'water');
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(4);
    });

    it('uses water shadow color for water neighbors', () => {
      autoTiler.drawTransition(mockCtx, 1, 0, 0, 32, 'water');
      expect(mockCtx.fillStyle).toBe('rgba(50, 100, 150, 0.3)');
    });

    it('uses default shadow for non-water neighbors', () => {
      autoTiler.drawTransition(mockCtx, 1, 0, 0, 32, 'obstacle');
      expect(mockCtx.fillStyle).toBe('rgba(0, 0, 0, 0.15)');
    });
  });
});
