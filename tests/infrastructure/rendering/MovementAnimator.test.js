import { MovementAnimator } from '../../../src/infrastructure/rendering/MovementAnimator.js';

describe('MovementAnimator', () => {
  let animator;

  beforeEach(() => {
    animator = new MovementAnimator(0.12);
  });

  describe('constructor', () => {
    it('initializes as not animating', () => {
      expect(animator.isAnimating).toBe(false);
    });

    it('accepts custom duration', () => {
      const a = new MovementAnimator(0.5);
      expect(a._duration).toBe(0.5);
    });
  });

  describe('startMove', () => {
    it('sets animating to true', () => {
      animator.startMove(0, 0, 1, 0);
      expect(animator.isAnimating).toBe(true);
    });

    it('resets elapsed time', () => {
      animator.startMove(0, 0, 1, 0);
      animator.update(0.06);
      animator.startMove(1, 0, 2, 0);
      expect(animator._elapsed).toBe(0);
    });
  });

  describe('update', () => {
    it('advances elapsed time', () => {
      animator.startMove(0, 0, 1, 0);
      animator.update(0.05);
      expect(animator._elapsed).toBeCloseTo(0.05);
    });

    it('stops animating when duration reached', () => {
      animator.startMove(0, 0, 1, 0);
      animator.update(0.12);
      expect(animator.isAnimating).toBe(false);
    });

    it('caps elapsed at duration', () => {
      animator.startMove(0, 0, 1, 0);
      animator.update(1.0);
      expect(animator._elapsed).toBe(0.12);
    });

    it('does nothing when not animating', () => {
      animator.update(0.05);
      expect(animator._elapsed).toBe(0);
    });
  });

  describe('getCurrentPosition', () => {
    it('returns from position at t=0', () => {
      animator.startMove(5, 10, 6, 10);
      const pos = animator.getCurrentPosition();
      expect(pos.x).toBeCloseTo(5);
      expect(pos.y).toBeCloseTo(10);
    });

    it('returns to position after animation completes', () => {
      animator.startMove(5, 10, 6, 10);
      animator.update(0.12);
      const pos = animator.getCurrentPosition();
      expect(pos.x).toBeCloseTo(6);
      expect(pos.y).toBeCloseTo(10);
    });

    it('returns intermediate position during animation', () => {
      animator.startMove(0, 0, 10, 0);
      animator.update(0.06); // halfway through duration
      const pos = animator.getCurrentPosition();
      expect(pos.x).toBeGreaterThan(0);
      expect(pos.x).toBeLessThan(10);
    });

    it('uses ease-out cubic curve', () => {
      animator.startMove(0, 0, 10, 0);
      animator.update(0.06); // t=0.5
      const pos = animator.getCurrentPosition();
      // Ease-out cubic at t=0.5: 1 - (1-0.5)^3 = 1 - 0.125 = 0.875
      expect(pos.x).toBeCloseTo(8.75, 1);
    });

    it('handles vertical movement', () => {
      animator.startMove(5, 0, 5, 10);
      animator.update(0.12);
      const pos = animator.getCurrentPosition();
      expect(pos.x).toBeCloseTo(5);
      expect(pos.y).toBeCloseTo(10);
    });

    it('handles diagonal movement', () => {
      animator.startMove(0, 0, 10, 10);
      animator.update(0.12);
      const pos = animator.getCurrentPosition();
      expect(pos.x).toBeCloseTo(10);
      expect(pos.y).toBeCloseTo(10);
    });
  });

  describe('getTargetPosition', () => {
    it('returns the target position', () => {
      animator.startMove(0, 0, 5, 8);
      const target = animator.getTargetPosition();
      expect(target.x).toBe(5);
      expect(target.y).toBe(8);
    });
  });
});
