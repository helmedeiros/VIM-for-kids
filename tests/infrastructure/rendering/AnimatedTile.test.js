import { AnimatedTile } from '../../../src/infrastructure/rendering/AnimatedTile.js';

describe('AnimatedTile', () => {
  let animatedTile;

  beforeEach(() => {
    animatedTile = new AnimatedTile();
  });

  describe('isAnimated', () => {
    it('returns true for water', () => {
      expect(animatedTile.isAnimated('water')).toBe(true);
    });

    it('returns true for field', () => {
      expect(animatedTile.isAnimated('field')).toBe(true);
    });

    it('returns false for grass', () => {
      expect(animatedTile.isAnimated('grass')).toBe(false);
    });

    it('returns false for wall', () => {
      expect(animatedTile.isAnimated('wall')).toBe(false);
    });

    it('returns false for unknown tile', () => {
      expect(animatedTile.isAnimated('lava')).toBe(false);
    });
  });

  describe('getFrameOffset', () => {
    it('returns 0 for non-animated tiles', () => {
      expect(animatedTile.getFrameOffset('grass', 0)).toBe(0);
      expect(animatedTile.getFrameOffset('grass', 100)).toBe(0);
    });

    it('cycles through water frames', () => {
      expect(animatedTile.getFrameOffset('water', 0)).toBe(0);
      expect(animatedTile.getFrameOffset('water', 0.6)).toBe(1);
      expect(animatedTile.getFrameOffset('water', 1.2)).toBe(2);
      expect(animatedTile.getFrameOffset('water', 1.8)).toBe(0); // wraps
    });

    it('cycles through field frames', () => {
      expect(animatedTile.getFrameOffset('field', 0)).toBe(0);
      expect(animatedTile.getFrameOffset('field', 1.0)).toBe(1);
      expect(animatedTile.getFrameOffset('field', 2.0)).toBe(0); // wraps
    });
  });

  describe('getAnimatedTileNames', () => {
    it('returns list of animated tile names', () => {
      const names = animatedTile.getAnimatedTileNames();
      expect(names).toContain('water');
      expect(names).toContain('field');
      expect(names).not.toContain('grass');
    });
  });
});
