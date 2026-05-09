import { Camera } from '../../../src/infrastructure/rendering/Camera.js';

describe('Camera', () => {
  let camera;
  const mapBounds = { width: 80, height: 40 };

  beforeEach(() => {
    camera = new Camera(32);
  });

  describe('constructor', () => {
    it('initializes with default values', () => {
      expect(camera.x).toBe(0);
      expect(camera.y).toBe(0);
      expect(camera.tileSize).toBe(32);
      expect(camera.viewportWidth).toBe(15);
      expect(camera.viewportHeight).toBe(10);
      expect(camera.isInitialized).toBe(false);
    });
  });

  describe('setViewportSize', () => {
    it('calculates viewport dimensions from screen size', () => {
      camera.setViewportSize(960, 600);
      expect(camera.viewportWidth).toBe(30); // 960/32
      expect(camera.viewportHeight).toBe(15); // (600-120)/32
    });

    it('enforces minimum viewport size', () => {
      camera.setViewportSize(100, 100);
      expect(camera.viewportWidth).toBe(15);
      expect(camera.viewportHeight).toBe(10);
    });

    it('uses custom UI offset', () => {
      camera.setViewportSize(960, 600, 200);
      expect(camera.viewportHeight).toBe(12); // (600-200)/32 = 12.5 -> 12
    });
  });

  describe('update', () => {
    it('centers on first call (not initialized)', () => {
      const result = camera.update({ x: 40, y: 20 }, mapBounds);
      expect(result).toBe(true); // centered
      expect(camera.isInitialized).toBe(true);
    });

    it('centers when cursor jumps more than 5 tiles', () => {
      camera.update({ x: 10, y: 10 }, mapBounds);
      const result = camera.update({ x: 50, y: 10 }, mapBounds);
      expect(result).toBe(true); // re-centered
    });

    it('scrolls when cursor moves within normal range', () => {
      camera.update({ x: 10, y: 10 }, mapBounds);
      const result = camera.update({ x: 11, y: 10 }, mapBounds);
      expect(result).toBe(false); // scrolled, not centered
    });

    it('does not change when cursor has not moved', () => {
      camera.update({ x: 10, y: 10 }, mapBounds);
      const result = camera.update({ x: 10, y: 10 }, mapBounds);
      expect(result).toBe(false);
    });

    it('uses zone bounds for centering when provided', () => {
      const zoneBounds = { minX: 20, minY: 5, maxX: 60, maxY: 30 };
      camera.update({ x: 30, y: 15 }, mapBounds, zoneBounds);
      // Camera x should be based on zone minX, not cursor
      expect(camera.x).toBe(zoneBounds.minX - Math.floor(camera.viewportWidth / 2));
    });
  });

  describe('interpolate', () => {
    it('returns false when already at target', () => {
      const result = camera.interpolate();
      expect(result).toBe(false);
    });

    it('returns true when still moving toward target', () => {
      camera.update({ x: 40, y: 20 }, mapBounds);
      // Force target different from current
      camera._targetX = camera._x + 10;
      const result = camera.interpolate();
      expect(result).toBe(true);
    });

    it('moves toward target with smoothing factor', () => {
      camera._x = 0;
      camera._targetX = 10;
      camera.interpolate();
      expect(camera.x).toBeCloseTo(1.5, 1); // 10 * 0.15
    });

    it('snaps to target when very close', () => {
      camera._x = 9.95;
      camera._targetX = 10;
      camera.interpolate();
      expect(camera.x).toBe(10);
    });
  });

  describe('getVisibleBounds', () => {
    it('returns viewport bounds based on camera position', () => {
      camera._x = 5;
      camera._y = 3;
      const bounds = camera.getVisibleBounds();
      expect(bounds.startX).toBe(5);
      expect(bounds.startY).toBe(3);
      expect(bounds.endX).toBe(5 + camera.viewportWidth);
      expect(bounds.endY).toBe(3 + camera.viewportHeight);
    });

    it('floors fractional camera positions', () => {
      camera._x = 5.7;
      camera._y = 3.2;
      const bounds = camera.getVisibleBounds();
      expect(bounds.startX).toBe(5);
      expect(bounds.startY).toBe(3);
    });
  });

  describe('worldToScreen', () => {
    it('converts world coordinates to screen pixels', () => {
      camera._x = 5;
      camera._y = 3;
      const screen = camera.worldToScreen(7, 5);
      expect(screen.x).toBe((7 - 5) * 32); // 64
      expect(screen.y).toBe((5 - 3) * 32); // 64
    });

    it('handles fractional camera position', () => {
      camera._x = 5.5;
      camera._y = 0;
      const screen = camera.worldToScreen(6, 0);
      expect(screen.x).toBeCloseTo(16, 0); // (6-5.5)*32 = 16
    });
  });

  describe('reset', () => {
    it('resets all camera state', () => {
      camera.update({ x: 40, y: 20 }, mapBounds);
      camera.reset();
      expect(camera.x).toBe(0);
      expect(camera.y).toBe(0);
      expect(camera.isInitialized).toBe(false);
    });
  });

  describe('_shouldCenterOnZone', () => {
    it('returns true when not initialized', () => {
      expect(camera._shouldCenterOnZone('10,10', { x: 10, y: 10 })).toBe(true);
    });

    it('returns false when cursor has not moved', () => {
      camera._isInitialized = true;
      camera._lastCursorKey = '10,10';
      expect(camera._shouldCenterOnZone('10,10', { x: 10, y: 10 })).toBe(false);
    });

    it('returns true when cursor jumps far', () => {
      camera._isInitialized = true;
      camera._lastCursorKey = '10,10';
      expect(camera._shouldCenterOnZone('20,20', { x: 20, y: 20 })).toBe(true);
    });

    it('returns false when cursor moves small amount', () => {
      camera._isInitialized = true;
      camera._lastCursorKey = '10,10';
      expect(camera._shouldCenterOnZone('11,10', { x: 11, y: 10 })).toBe(false);
    });
  });

  describe('_updateScrolling', () => {
    it('clamps target to map bounds', () => {
      camera._isInitialized = true;
      camera._lastCursorKey = '1,1';
      camera.update({ x: 2, y: 1 }, { width: 20, height: 15 });
      // Target should not exceed map bounds
      expect(camera._targetY).toBeGreaterThanOrEqual(0);
      expect(camera._targetX).toBeLessThanOrEqual(20 - camera.viewportWidth);
    });
  });
});
