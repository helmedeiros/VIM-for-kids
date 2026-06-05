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
  // Ramp cells render the maze's dirt floor underneath, so the PNG
  // ramp triangle (rendered later by CanvasGameRenderer._drawRampSprites)
  // sits over a floor that matches the surrounding maze pavement.
  ramp_right: { sx: 32, sy: 2576, sw: 16, sh: 16 },
  ramp_left: { sx: 32, sy: 2576, sw: 16, sh: 16 },
  sand: { sx: 40, sy: 2208, sw: 16, sh: 16 },
  stone: { sx: 130, sy: 3184, sw: 16, sh: 16 },
  // === Rocks page catalog =================================================
  // Every cell is 32x32. Zones reference these by region name to pick the
  // variant that fits the biome. `rock` and `rock_2x2` are the in-use
  // defaults (small + 2x2 boulder); the rest are available for future use.

  // Small single rocks — row 1 of the rocks page (sy=6240).
  rock_small_green: { sx: 0, sy: 6240, sw: 32, sh: 32 },
  rock_small_grey_light: { sx: 32, sy: 6240, sw: 32, sh: 32 },
  rock_small_grey: { sx: 64, sy: 6240, sw: 32, sh: 32 },
  rock_small_grey_pair: { sx: 96, sy: 6240, sw: 32, sh: 32 },
  rock_small_teal: { sx: 128, sy: 6240, sw: 32, sh: 32 },
  rock_small_teal_light: { sx: 160, sy: 6240, sw: 32, sh: 32 },
  rock_small_teal_pair: { sx: 192, sy: 6240, sw: 32, sh: 32 },
  rock_small_brown_pair: { sx: 224, sy: 6240, sw: 32, sh: 32 },

  // Pile rocks without base (rounded clusters, sy=6208).
  rock_pile_sandy: { sx: 128, sy: 6208, sw: 32, sh: 32 },
  rock_pile_grey: { sx: 160, sy: 6208, sw: 32, sh: 32 },
  rock_pile_green: { sx: 192, sy: 6208, sw: 32, sh: 32 },
  rock_brown_round: { sx: 224, sy: 6208, sw: 32, sh: 32 },

  // Pile rocks with water base (sy=6176) — for shorelines / ponds.
  rock_pile_sandy_water: { sx: 128, sy: 6176, sw: 32, sh: 32 },
  rock_pile_grey_water: { sx: 160, sy: 6176, sw: 32, sh: 32 },
  rock_pile_green_water: { sx: 192, sy: 6176, sw: 32, sh: 32 },

  // Chunky / tall boulders — row 2 (sy=6272).
  rock_chunky_green: { sx: 0, sy: 6272, sw: 32, sh: 32 },
  rock_chunky_green_alt: { sx: 32, sy: 6272, sw: 32, sh: 32 },
  rock_chunky_green_small: { sx: 64, sy: 6272, sw: 32, sh: 32 },
  rock_tall_green: { sx: 96, sy: 6272, sw: 32, sh: 32 },
  rock_tall_green_alt: { sx: 128, sy: 6272, sw: 32, sh: 32 },
  rock_chunky_brown: { sx: 160, sy: 6272, sw: 32, sh: 32 },
  rock_chunky_blue: { sx: 192, sy: 6272, sw: 32, sh: 32 },
  rock_tall_blue: { sx: 224, sy: 6272, sw: 32, sh: 32 },

  // In-use defaults — point at warm/brown variants so the hidden area
  // reads natural and earthy. Swap by re-pointing these two entries.
  rock: { sx: 224, sy: 6208, sw: 32, sh: 32 },        // rock_brown_round
  rock_2x2: { sx: 128, sy: 6208, sw: 32, sh: 32 },    // rock_pile_sandy

  // === Forest trees (64x64 each, 2x2 footprint) ============================
  // Top 4x2 block of the tileset is a row of round leafy trees in five
  // shades. Use these to mix variants inside a tree labyrinth so it
  // doesn't read as a single repeated sprite.
  tree_round_green: { sx: 0, sy: 0, sw: 64, sh: 64 },
  tree_round_dark: { sx: 64, sy: 0, sw: 64, sh: 64 },
  tree_round_dense: { sx: 128, sy: 0, sw: 64, sh: 64 },
  tree_round_shadow: { sx: 192, sy: 0, sw: 64, sh: 64 },
  tree_round_layered: { sx: 0, sy: 64, sw: 64, sh: 64 },

  // === Desert flora (64x64, 2x2 footprint) =================================
  // Palms and dried-out trees in the y=1280..1536 band of the tileset.
  // Drop these onto sand tiles to read "desert oasis" instead of "blank
  // beach" — palms cluster, cacti/succulents stand alone, dead trees
  // litter the edges.
  palm_tree: { sx: 0, sy: 1344, sw: 64, sh: 64 },
  palm_tree_alt: { sx: 128, sy: 1344, sw: 64, sh: 64 },
  dead_tree: { sx: 64, sy: 1472, sw: 64, sh: 64 },
  dead_pine: { sx: 128, sy: 1472, sw: 64, sh: 64 },
  cactus: { sx: 192, sy: 1280, sw: 64, sh: 64 },

  // Legacy alias — kept so existing zones (BlinkingGrove, FieldOfInsertion)
  // keep rendering until they migrate to the named variants above.
  tree_2x2: { sx: 0, sy: 0, sw: 64, sh: 64 },

  // === Gems (24x24) — collectible-key overrides for the hidden area ======
  // Each gem sits in a small metal dish with a base/stem. The art lives
  // in the items strip near sy=9152 with irregular 24x24-ish packing.
  gem_orange: { sx: 164, sy: 9152, sw: 24, sh: 24 },
  gem_green: { sx: 196, sy: 9152, sw: 24, sh: 24 },
  gem_bronze: { sx: 228, sy: 9152, sw: 24, sh: 24 },

  // === Energy meters (16x24) — gate overrides for the hidden area =========
  // Tall pod-like devices with a colored dome. Red = empty (locked),
  // blue = charged (unlocked once the matching gem is collected).
  // Drawn at 32x48 destination with the foot anchored at the bottom of
  // the cell, so the dome overflows up into the cell above.
  energy_meter_empty: { sx: 208, sy: 9536, sw: 16, sh: 24 },
  energy_meter_charged: { sx: 224, sy: 9536, sw: 16, sh: 24 },

  // (No tileset region for the lever — drawn procedurally by
  // TileRenderer.drawDecoration when regionName === 'lever_stone'.
  // Locating the exact tile in tileset-rpg.png is fiddly, so the
  // renderer paints a 16x24 stone block + wooden handle directly.)

  // === Letter platforms (16x16, walkable stone block) =====================
  // Light-gray stone tile rendered as the floating letter platforms in
  // the water section between village and forest. Reuses the stone
  // sprite but registers it under the walkable `platform` TileType.
  platform: { sx: 130, sy: 3184, sw: 16, sh: 16 },

  // === Pier planks (16x16, used as the `bridge` tile override) ============
  // Horizontal wooden planks. Registering under the name `bridge` makes
  // any 'bridge' tile in a layout render as wooden planks — pier cells
  // over water visibly read as a wooden dock.
  bridge: { sx: 0, sy: 8800, sw: 16, sh: 16 },

  // === Village houses (96x96, 3x3 footprint) ==============================
  // Pokemon-style top-down houses with painted roofs and visible doors.
  // Three roof colors for visual mix in the same village.
  // Full Pokemon-style houses at 96x128 (3x4 footprint, 1:1 mapping).
  // Width narrowed from 128 to 96 because the 128-wide crop captured
  // 16 px of the neighbor house's left edge (green's content starts at
  // sx=112, so blue/orange crops at sw=128 picked up green's roof).
  //
  // Each color's full content fits in 96 wide:
  //   - taller back roof + smaller front roof (L-shape blue/green)
  //   - eave with upper window
  //   - brown body with door + window
  //   - foundation + own diagonal shadow
  //
  // sy shifted +16 below the grid-aligned house top to skip the
  // previous row's bottom-shadow strip (would otherwise show as a
  // stray dark band above each house). Green's sx stays at 112 to
  // include its door which lives left of the 128-grid line.
  house_orange: { sx: 0, sy: 13792, sw: 96, sh: 128 },
  house_blue: { sx: 0, sy: 13664, sw: 96, sh: 128 },
  house_green: { sx: 100, sy: 13664, sw: 96, sh: 128 },
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
