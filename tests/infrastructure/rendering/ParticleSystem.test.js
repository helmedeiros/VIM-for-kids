import { ParticleSystem } from '../../../src/infrastructure/rendering/ParticleSystem.js';

describe('ParticleSystem', () => {
  let system;

  beforeEach(() => {
    system = new ParticleSystem(100);
  });

  describe('constructor', () => {
    it('initializes with zero particles', () => {
      expect(system.particleCount).toBe(0);
    });
  });

  describe('emit', () => {
    it('creates sparkle particles', () => {
      system.emit('sparkle', 100, 100, 5);
      expect(system.particleCount).toBe(5);
    });

    it('creates ripple particle', () => {
      system.emit('ripple', 100, 100);
      expect(system.particleCount).toBe(1);
    });

    it('respects max particle limit', () => {
      const small = new ParticleSystem(3);
      small.emit('sparkle', 100, 100, 10);
      expect(small.particleCount).toBe(3);
    });

    it('does nothing for unknown type', () => {
      system.emit('unknown', 100, 100);
      expect(system.particleCount).toBe(0);
    });
  });

  describe('update', () => {
    it('advances particle age', () => {
      system.emit('sparkle', 100, 100, 1);
      system.update(0.1);
      expect(system._particles[0].age).toBeCloseTo(0.1);
    });

    it('moves particles by velocity', () => {
      system.emit('sparkle', 100, 100, 1);
      const p = system._particles[0];
      const startX = p.x;
      system.update(0.1);
      expect(p.x).not.toBe(startX);
    });

    it('removes particles past lifetime', () => {
      system.emit('sparkle', 100, 100, 3);
      system.update(2.0); // well past any lifetime
      expect(system.particleCount).toBe(0);
    });

    it('applies gravity', () => {
      system.emit('sparkle', 100, 100, 1);
      const p = system._particles[0];
      const startVy = p.vy;
      system.update(0.1);
      expect(p.vy).toBeGreaterThan(startVy);
    });
  });

  describe('draw', () => {
    it('draws circle particles', () => {
      const mockCtx = {
        globalAlpha: 1,
        fillStyle: '',
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        fillRect: jest.fn(),
      };
      system.emit('ripple', 100, 100);
      system.draw(mockCtx);
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.globalAlpha).toBe(1); // restored
    });

    it('draws square particles', () => {
      const mockCtx = {
        globalAlpha: 1,
        fillStyle: '',
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        fillRect: jest.fn(),
      };
      system.emit('sparkle', 100, 100, 1);
      // Force shape to square for testing
      system._particles[0].shape = 'square';
      system.draw(mockCtx);
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('removes all particles', () => {
      system.emit('sparkle', 100, 100, 10);
      system.clear();
      expect(system.particleCount).toBe(0);
    });
  });
});
