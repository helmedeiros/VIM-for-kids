import { TileAtlas } from '../../../src/infrastructure/rendering/TileAtlas.js';

describe('TileAtlas', () => {
  let atlas;

  beforeEach(() => {
    atlas = new TileAtlas();
  });

  describe('getFrameIndex', () => {
    it('returns correct index for water', () => {
      expect(atlas.getFrameIndex('water')).toBe(0);
    });

    it('returns correct index for grass', () => {
      expect(atlas.getFrameIndex('grass')).toBe(1);
    });

    it('returns correct index for dirt', () => {
      expect(atlas.getFrameIndex('dirt')).toBe(2);
    });

    it('returns correct index for tree', () => {
      expect(atlas.getFrameIndex('tree')).toBe(3);
    });

    it('returns correct index for wall', () => {
      expect(atlas.getFrameIndex('wall')).toBe(6);
    });

    it('returns correct index for boss_area', () => {
      expect(atlas.getFrameIndex('boss_area')).toBe(12);
    });

    it('returns correct index for ramp tiles', () => {
      expect(atlas.getFrameIndex('ramp_right')).toBe(13);
      expect(atlas.getFrameIndex('ramp_left')).toBe(14);
    });

    it('falls back to water for unknown tile', () => {
      expect(atlas.getFrameIndex('lava')).toBe(0);
    });
  });

  describe('hasTile', () => {
    it('returns true for known tiles', () => {
      expect(atlas.hasTile('grass')).toBe(true);
      expect(atlas.hasTile('water')).toBe(true);
      expect(atlas.hasTile('void')).toBe(true);
    });

    it('returns false for unknown tiles', () => {
      expect(atlas.hasTile('lava')).toBe(false);
      expect(atlas.hasTile('')).toBe(false);
    });
  });

  describe('tileCount', () => {
    it('returns 17 tile types', () => {
      expect(atlas.tileCount).toBe(17);
    });
  });

  describe('getAllMappings', () => {
    it('returns a copy of mappings', () => {
      const mappings = atlas.getAllMappings();
      expect(Object.keys(mappings)).toHaveLength(17);
      mappings.water = 999;
      expect(atlas.getFrameIndex('water')).toBe(0);
    });
  });

  describe('no index collisions', () => {
    it('all indices are unique', () => {
      const mappings = atlas.getAllMappings();
      const indices = Object.values(mappings);
      const uniqueIndices = new Set(indices);
      expect(uniqueIndices.size).toBe(indices.length);
    });
  });

  describe('region lookup', () => {
    it('returns null when no region is registered for a tile', () => {
      expect(atlas.getRegion('grass')).toBeNull();
    });

    it('registers and returns a region with image + pixel bounds', () => {
      const image = { width: 256, height: 256 };
      atlas.registerRegion('grass', { image, sx: 96, sy: 2272, sw: 32, sh: 32 });

      expect(atlas.getRegion('grass')).toEqual({
        image,
        sx: 96,
        sy: 2272,
        sw: 32,
        sh: 32,
      });
    });

    it('registering a region does not affect the legacy frame index', () => {
      const image = { width: 256, height: 256 };
      atlas.registerRegion('grass', { image, sx: 0, sy: 0, sw: 32, sh: 32 });
      expect(atlas.getFrameIndex('grass')).toBe(1);
    });

    it('overwrites a previously registered region for the same tile', () => {
      const imageA = { width: 16, height: 16 };
      const imageB = { width: 32, height: 32 };
      atlas.registerRegion('grass', { image: imageA, sx: 0, sy: 0, sw: 16, sh: 16 });
      atlas.registerRegion('grass', { image: imageB, sx: 8, sy: 8, sw: 16, sh: 16 });

      const region = atlas.getRegion('grass');
      expect(region.image).toBe(imageB);
      expect(region.sx).toBe(8);
    });

    it('throws when registering an invalid region', () => {
      expect(() => atlas.registerRegion('grass', null)).toThrow();
      expect(() => atlas.registerRegion('grass', { sx: 0, sy: 0, sw: 32, sh: 32 })).toThrow(
        /image/
      );
      expect(() => atlas.registerRegion('grass', { image: {} })).toThrow(/sx|sy|sw|sh/);
    });

    it('throws when registering a region with a non-string tile name', () => {
      expect(() => atlas.registerRegion(null, { image: {}, sx: 0, sy: 0, sw: 1, sh: 1 })).toThrow();
    });
  });
});
