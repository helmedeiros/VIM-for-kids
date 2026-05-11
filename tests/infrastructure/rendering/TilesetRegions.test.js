import { TileAtlas } from '../../../src/infrastructure/rendering/TileAtlas.js';
import {
  TILESET_REGIONS,
  registerTilesetRegions,
} from '../../../src/infrastructure/rendering/TilesetRegions.js';

describe('TilesetRegions', () => {
  it('exports the grass region', () => {
    expect(TILESET_REGIONS.grass).toEqual({ sx: 96, sy: 2272, sw: 32, sh: 32 });
  });

  it.each([
    ['water', { sx: 32, sy: 3680, sw: 16, sh: 16 }],
    ['path', { sx: 128, sy: 2640, sw: 16, sh: 16 }],
    ['dirt', { sx: 32, sy: 2576, sw: 16, sh: 16 }],
    ['sand', { sx: 40, sy: 2208, sw: 16, sh: 16 }],
    ['stone', { sx: 130, sy: 3184, sw: 16, sh: 16 }],
    ['tree_2x2', { sx: 0, sy: 0, sw: 64, sh: 64 }],
  ])('exports the %s region', (name, region) => {
    expect(TILESET_REGIONS[name]).toEqual(region);
  });

  it('registers all regions on the atlas using the provided image', () => {
    const atlas = new TileAtlas();
    const image = { width: 256, height: 20832 };

    registerTilesetRegions(atlas, image);

    const grass = atlas.getRegion('grass');
    expect(grass.image).toBe(image);
    expect(grass.sx).toBe(96);
    expect(grass.sy).toBe(2272);
  });

  it('does not register regions for tiles not in the region map', () => {
    const atlas = new TileAtlas();
    registerTilesetRegions(atlas, { width: 1, height: 1 });
    // tree, wall, and void are not yet migrated to the PNG — they stay procedural.
    expect(atlas.getRegion('wall')).toBeNull();
    expect(atlas.getRegion('tree')).toBeNull();
    expect(atlas.getRegion('void')).toBeNull();
  });

  it('accepts a custom region map for testing', () => {
    const atlas = new TileAtlas();
    const image = {};
    registerTilesetRegions(atlas, image, {
      water: { sx: 0, sy: 0, sw: 32, sh: 32 },
    });
    expect(atlas.getRegion('water').sx).toBe(0);
    expect(atlas.getRegion('grass')).toBeNull();
  });

  it('throws when atlas is missing', () => {
    expect(() => registerTilesetRegions(null, {})).toThrow(/TileAtlas/);
  });

  it('throws when image is missing', () => {
    expect(() => registerTilesetRegions(new TileAtlas(), null)).toThrow(/image/);
  });
});
