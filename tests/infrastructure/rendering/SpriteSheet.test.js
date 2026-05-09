import { SpriteSheet } from '../../../src/infrastructure/rendering/SpriteSheet.js';

describe('SpriteSheet', () => {
  let mockImage;

  beforeEach(() => {
    mockImage = { width: 160, height: 160, src: 'test.png' };
  });

  describe('constructor', () => {
    it('creates a sprite sheet with valid parameters', () => {
      const sheet = new SpriteSheet(mockImage, 16, 16, 10);
      expect(sheet.image).toBe(mockImage);
      expect(sheet.tileWidth).toBe(16);
      expect(sheet.tileHeight).toBe(16);
    });

    it('throws if image is null', () => {
      expect(() => new SpriteSheet(null, 16, 16, 10)).toThrow('valid image');
    });

    it('throws if tile dimensions are zero', () => {
      expect(() => new SpriteSheet(mockImage, 0, 16, 10)).toThrow('positive');
    });

    it('throws if tile dimensions are negative', () => {
      expect(() => new SpriteSheet(mockImage, -1, 16, 10)).toThrow('positive');
    });

    it('throws if columns is zero', () => {
      expect(() => new SpriteSheet(mockImage, 16, 16, 0)).toThrow('positive');
    });
  });

  describe('getFrame', () => {
    it('returns correct source rect for first frame', () => {
      const sheet = new SpriteSheet(mockImage, 16, 16, 10);
      const frame = sheet.getFrame(0);
      expect(frame).toEqual({
        image: mockImage,
        sx: 0,
        sy: 0,
        sw: 16,
        sh: 16,
      });
    });

    it('returns correct source rect for frame in first row', () => {
      const sheet = new SpriteSheet(mockImage, 16, 16, 10);
      const frame = sheet.getFrame(5);
      expect(frame).toEqual({
        image: mockImage,
        sx: 80, // 5 * 16
        sy: 0,
        sw: 16,
        sh: 16,
      });
    });

    it('wraps to next row correctly', () => {
      const sheet = new SpriteSheet(mockImage, 16, 16, 10);
      const frame = sheet.getFrame(15);
      expect(frame).toEqual({
        image: mockImage,
        sx: 80, // (15 % 10) * 16
        sy: 16, // floor(15 / 10) * 16
        sw: 16,
        sh: 16,
      });
    });

    it('handles non-square tiles', () => {
      const sheet = new SpriteSheet(mockImage, 32, 16, 5);
      const frame = sheet.getFrame(7);
      expect(frame).toEqual({
        image: mockImage,
        sx: 64, // (7 % 5) * 32
        sy: 16, // floor(7 / 5) * 16
        sw: 32,
        sh: 16,
      });
    });

    it('throws for negative index', () => {
      const sheet = new SpriteSheet(mockImage, 16, 16, 10);
      expect(() => sheet.getFrame(-1)).toThrow('non-negative');
    });
  });
});
