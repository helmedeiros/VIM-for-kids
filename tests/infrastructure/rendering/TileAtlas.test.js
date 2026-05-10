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
});
