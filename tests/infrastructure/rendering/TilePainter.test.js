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
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
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
      expect(p._columns).toBe(28);
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

    it('paints all 28 tile types', () => {
      painter.createTilesetCanvas();
      expect(mockCtx.drawImage).toHaveBeenCalledTimes(28);
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
      expect(canvas.width).toBe(11 * 32);
      expect(canvas.height).toBe(2 * 32);
    });

    it('paints all 21 character sprites', () => {
      painter.createCharacterCanvas();
      // 8 cursor frames + vim_key + collectible_key + gate_open + gate_closed + 9 NPCs
      expect(mockCtx.drawImage).toHaveBeenCalledTimes(21);
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

    it('paints cobblestone with rounded stones and grout lines', () => {
      painter._paintCobblestone(mockCtx);
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('paints stone with brick pattern and per-brick shading', () => {
      painter._paintStone(mockCtx);
      expect(mockCtx.createLinearGradient).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('paints rock as an irregular pebble silhouette, not a smooth sphere', () => {
      mockCtx.lineTo.mockClear();
      mockCtx.closePath.mockClear();
      painter._paintRock(mockCtx);
      // Natural pebble: silhouette is an 8-vertex polygon drawn twice (outline
      // + body) plus a 5-vertex highlight — so at least (7+7+4) = 18 lineTo
      // segments. The old smooth-sphere body had 8 lineTos for facet overlays.
      expect(mockCtx.lineTo.mock.calls.length).toBeGreaterThanOrEqual(15);
      expect(mockCtx.closePath).toHaveBeenCalled();
      // Drop shadow + body fill still required
      expect(mockCtx.ellipse).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('paints wall with 3D depth faces', () => {
      painter._paintWall(mockCtx);
      expect(mockCtx.createLinearGradient).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });
  });

  describe('character painters', () => {
    it('paints cursor kid avatar for each pose', () => {
      for (const pose of [0, 1, 2, 3]) {
        mockCtx.fillRect.mockClear();
        painter._paintCursor(mockCtx, pose);
        // Each pose paints multiple body parts (hair, face, eyes, shirt,
        // arms, pants, shoes) — many fillRect calls.
        expect(mockCtx.fillRect.mock.calls.length).toBeGreaterThan(8);
      }
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

    // All NPC painters now route through the shared _paintChibiNPC, so we
    // just confirm that each delegates: draws many fillRects (body parts)
    // and an ellipse for the drop shadow.
    it.each([
      ['bug king', '_paintBugKing'],
      ['deletion echo', '_paintDeletionEcho'],
      ['maze scribe', '_paintMazeScribe'],
      ['insert scribe', '_paintInsertScribe'],
      ['practice buddy', '_paintPracticeBuddy'],
      ['mirror sprite', '_paintMirrorSprite'],
      ['syntax wisp', '_paintSyntaxWisp'],
      ['caret stone', '_paintCaretStone'],
      ['caret spirit', '_paintCaretSpirit'],
    ])('paints %s as a chibi NPC', (_label, method) => {
      mockCtx.fillRect.mockClear();
      mockCtx.ellipse.mockClear();
      painter[method](mockCtx);
      expect(mockCtx.fillRect.mock.calls.length).toBeGreaterThan(10);
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
