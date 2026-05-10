import { TileRenderer } from '../../../src/infrastructure/rendering/TileRenderer.js';

describe('TileRenderer', () => {
  let renderer;
  let mockSpriteSheet;
  let mockTileAtlas;
  let mockCtx;

  beforeEach(() => {
    const mockImage = { width: 160, height: 32 };

    mockSpriteSheet = {
      getFrame: jest.fn().mockReturnValue({
        image: mockImage,
        sx: 16,
        sy: 0,
        sw: 16,
        sh: 16,
      }),
    };

    mockTileAtlas = {
      getFrameIndex: jest.fn().mockReturnValue(1),
    };

    mockCtx = {
      drawImage: jest.fn(),
    };

    renderer = new TileRenderer(mockSpriteSheet, mockTileAtlas, 32);
  });

  describe('constructor', () => {
    it('creates renderer with valid parameters', () => {
      expect(renderer.renderSize).toBe(32);
    });

    it('throws if spriteSheet is null', () => {
      expect(() => new TileRenderer(null, mockTileAtlas)).toThrow('SpriteSheet');
    });

    it('throws if tileAtlas is null', () => {
      expect(() => new TileRenderer(mockSpriteSheet, null)).toThrow('TileAtlas');
    });

    it('defaults renderSize to 32', () => {
      const r = new TileRenderer(mockSpriteSheet, mockTileAtlas);
      expect(r.renderSize).toBe(32);
    });
  });

  describe('drawTile', () => {
    it('looks up frame index from atlas', () => {
      renderer.drawTile(mockCtx, 'grass', 64, 128);
      expect(mockTileAtlas.getFrameIndex).toHaveBeenCalledWith('grass');
    });

    it('gets frame from sprite sheet', () => {
      mockTileAtlas.getFrameIndex.mockReturnValue(3);
      renderer.drawTile(mockCtx, 'tree', 0, 0);
      expect(mockSpriteSheet.getFrame).toHaveBeenCalledWith(3);
    });

    it('calls ctx.drawImage with correct parameters', () => {
      const mockImage = { width: 160, height: 32 };
      mockSpriteSheet.getFrame.mockReturnValue({
        image: mockImage,
        sx: 32,
        sy: 0,
        sw: 16,
        sh: 16,
      });

      renderer.drawTile(mockCtx, 'dirt', 96, 64);

      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockImage,
        32,
        0,
        16,
        16,
        96,
        64,
        32,
        32
      );
    });

    it('scales sprite to render size', () => {
      const smallRenderer = new TileRenderer(mockSpriteSheet, mockTileAtlas, 48);
      smallRenderer.drawTile(mockCtx, 'grass', 0, 0);

      const call = mockCtx.drawImage.mock.calls[0];
      expect(call[7]).toBe(48); // destination width
      expect(call[8]).toBe(48); // destination height
    });
  });
});
