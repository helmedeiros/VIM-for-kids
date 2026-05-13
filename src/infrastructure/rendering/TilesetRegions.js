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
  // Path now reads as warm pale sand to lighten up the hidden-area floor.
  path: { sx: 40, sy: 2208, sw: 16, sh: 16 },
  dirt: { sx: 32, sy: 2576, sw: 16, sh: 16 },
  sand: { sx: 40, sy: 2208, sw: 16, sh: 16 },
  stone: { sx: 130, sy: 3184, sw: 16, sh: 16 },
  // Small clean grey rock — single 32x32 cell from row 1 of the rocks
  // page, third from the left. Used for the inline `R` tiles that
  // scatter across the hidden-area floor.
  rock: { sx: 64, sy: 6240, sw: 32, sh: 32 },
  // Chunky pale-green boulder — first cell of the big-rocks row of the
  // rocks page. Drawn as a 2x2 decoration so it's a true 64x64 obstacle
  // on the map; transparent background, composes over whatever floor
  // sits beneath it.
  rock_2x2: { sx: 0, sy: 6272, sw: 32, sh: 32 },
  // Multi-tile decorations (drawn via TileRenderer.drawDecoration, not drawTile).
  // 2x2 footprint, 64x64 source = 1:1 with destination at renderSize 32 → crisp pixels.
  tree_2x2: { sx: 0, sy: 0, sw: 64, sh: 64 },
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
