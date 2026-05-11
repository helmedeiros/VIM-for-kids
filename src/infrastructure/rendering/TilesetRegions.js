/**
 * Pixel-region map for the external RPG tileset PNG.
 * Each entry is the {sx, sy, sw, sh} rectangle inside tileset-rpg.png
 * that should be drawn for a given TileType name.
 *
 * Tiles not listed here keep falling back to the procedural painter,
 * so we can migrate one tile at a time without breaking anything.
 */
export const TILESET_REGIONS = {
  grass: { sx: 96, sy: 2272, sw: 32, sh: 32 },
  water: { sx: 32, sy: 3680, sw: 16, sh: 16 },
  path: { sx: 128, sy: 2640, sw: 16, sh: 16 },
  dirt: { sx: 32, sy: 2576, sw: 16, sh: 16 },
  sand: { sx: 40, sy: 2208, sw: 16, sh: 16 },
  stone: { sx: 130, sy: 3184, sw: 16, sh: 16 },
};

export function registerTilesetRegions(atlas, image, regions = TILESET_REGIONS) {
  if (!atlas) {
    throw new Error('registerTilesetRegions requires a TileAtlas');
  }
  if (!image) {
    throw new Error('registerTilesetRegions requires a loaded image');
  }
  for (const [tileName, region] of Object.entries(regions)) {
    atlas.registerRegion(tileName, { image, ...region });
  }
}
