import { TilePainter } from '../../../src/infrastructure/rendering/TilePainter.js';

describe('TilePainter', () => {
  let painter;
  let mockCtx;

  beforeEach(() => {
    mockCtx = {
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      arc: jest.fn(),
      ellipse: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      closePath: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      createLinearGradient: jest.fn().mockReturnValue({ addColorStop: jest.fn() }),
      createRadialGradient: jest.fn().mockReturnValue({ addColorStop: jest.fn() }),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      globalAlpha: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
    };

    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockCtx);
    painter = new TilePainter(32, 17);
  });

  describe('constructor', () => {
    it('uses default tile size and columns', () => {
      const p = new TilePainter();
      expect(p._ts).toBe(32);
      expect(p._columns).toBe(19);
    });

    it('accepts custom tile size and columns', () => {
      const p = new TilePainter(64, 8);
      expect(p._ts).toBe(64);
      expect(p._columns).toBe(8);
    });
  });

  describe('createTilesetCanvas', () => {
    it('returns a canvas element', () => {
      const canvas = painter.createTilesetCanvas();
      expect(canvas.tagName).toBe('CANVAS');
    });

    it('creates canvas with correct dimensions', () => {
      const canvas = painter.createTilesetCanvas();
      expect(canvas.width).toBe(17 * 32);
      expect(canvas.height).toBe(32);
    });

    it('paints all 19 tile types', () => {
      painter.createTilesetCanvas();
      expect(mockCtx.drawImage).toHaveBeenCalledTimes(19);
    });

    it('positions tiles sequentially', () => {
      painter.createTilesetCanvas();
      const calls = mockCtx.drawImage.mock.calls;
      expect(calls[0][1]).toBe(0);
      expect(calls[1][1]).toBe(32);
      expect(calls[2][1]).toBe(64);
    });
  });

  describe('createCharacterCanvas', () => {
    it('returns a canvas element', () => {
      const canvas = painter.createCharacterCanvas();
      expect(canvas.tagName).toBe('CANVAS');
    });

    it('creates canvas with correct dimensions', () => {
      const canvas = painter.createCharacterCanvas();
      expect(canvas.width).toBe(10 * 32);
      expect(canvas.height).toBe(2 * 32);
    });

    it('paints character sprites (skipping null slots)', () => {
      painter.createCharacterCanvas();
      // 17 painters out of 20 slots (3 null at indices 7, 8, 9)
      expect(mockCtx.drawImage).toHaveBeenCalledTimes(17);
    });
  });

  describe('tile painters', () => {
    it('paints water with gradients and hatch lines', () => {
      painter._paintWater(mockCtx);
      expect(mockCtx.createLinearGradient).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('paints grass with base and blade details', () => {
      painter._paintGrass(mockCtx);
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('paints dirt with gradient and 3D pebbles', () => {
      painter._paintDirt(mockCtx);
      // Uses createLinearGradient for base and _sphere (createRadialGradient) for pebbles
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('paints tree with layered canopy and trunk', () => {
      painter._paintTree(mockCtx);
      expect(mockCtx.ellipse).toHaveBeenCalled();
      expect(mockCtx.createRadialGradient).toHaveBeenCalled();
    });

    it('paints stone with brick pattern and per-brick shading', () => {
      painter._paintStone(mockCtx);
      expect(mockCtx.createLinearGradient).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('paints wall with 3D depth faces', () => {
      painter._paintWall(mockCtx);
      expect(mockCtx.createLinearGradient).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });
  });

  describe('character painters', () => {
    it('paints cursor with opacity and resets globalAlpha', () => {
      painter._paintCursor(mockCtx, 0.5);
      expect(mockCtx.globalAlpha).toBe(1);
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });

    it('paints vim key with keycap gradient', () => {
      painter._paintVimKey(mockCtx);
      expect(mockCtx.createLinearGradient).toHaveBeenCalled();
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });

    it('paints collectible key with ring and shaft', () => {
      painter._paintCollectibleKey(mockCtx);
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('paints caret spirit with flame layers and eyes', () => {
      painter._paintCaretSpirit(mockCtx);
      expect(mockCtx.createRadialGradient).toHaveBeenCalled();
      expect(mockCtx.ellipse).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('paints bug king with crown, jewels, and eyes', () => {
      painter._paintBugKing(mockCtx);
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('paints deletion echo ghost with wavy bottom', () => {
      painter._paintDeletionEcho(mockCtx);
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.lineTo).toHaveBeenCalled();
    });

    it('paints maze scribe as robed figure with scroll', () => {
      painter._paintMazeScribe(mockCtx);
      expect(mockCtx.quadraticCurveTo).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('paints practice buddy as star with face', () => {
      painter._paintPracticeBuddy(mockCtx);
      expect(mockCtx.lineTo).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('paints mirror sprite as droplet with specular', () => {
      painter._paintMirrorSprite(mockCtx);
      expect(mockCtx.quadraticCurveTo).toHaveBeenCalled();
      expect(mockCtx.ellipse).toHaveBeenCalled();
    });
  });

  describe('_sphere helper', () => {
    it('draws a sphere with gradient, outline, and specular', () => {
      painter._sphere(mockCtx, 16, 16, 8, '#888', '#ccc', '#444');
      expect(mockCtx.createRadialGradient).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });
  });
});
