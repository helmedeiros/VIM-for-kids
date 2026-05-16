import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

/**
 * Factory for Zone Practice: Trials of the Sand
 *
 * Sits at the start of Level 2 and chains three connected challenges
 * horizontally inside one big zone:
 *
 *   1. **Sand area (west, cols ~1-79).** A wide sand floor with text
 *      labels for the player to hop with w/e/b. Three energy gems
 *      hide on letters tucked behind rocks, like the Blinking Grove
 *      hidden area. Irregular sand dunes give the border character.
 *   2. **Tree labyrinth (middle, cols ~80-159).** A maze whose walls
 *      are 2x2 tree decorations. The player threads through the
 *      canopy gaps to reach the east.
 *   3. **Boss arena (east, cols ~160-238).** An open sand pit with
 *      the Pixel Snake glaring at the entrance, three energy meters
 *      lined up against the east wall, and the final gate behind
 *      them that leads to the Maze of Modes.
 *
 * The chasing snake AI and timed gem spawns are deferred to follow-up
 * PRs — for now the snake is a static, blocking NPC that retreats
 * via an event once the three sand gems are collected.
 */
export class WordPracticeZone {
  static _getSharedConfig() {
    return {
      zoneId: 'zone_practice',
      name: '1.5 Trials of the Sand',
      biome: 'Sun-bleached dunes, a tree labyrinth, and a coiled-snake pit',
      skillFocus: ['w', 'e', 'b'],
      puzzleTheme:
        'Cross the sands to gather three gems, weave the tree maze, then face the Pixel Snake.',
      narration: [
        'Three trials before the maze. Three gems to collect.',
        '✦ Hop the rocks with w / e / b to reach the gems hidden on the letters.',
        '✦ Find the path through the trees.',
        '✦ Face the Pixel Snake. Charge the meters. Open the gate.',
      ],
    };
  }

  static _getCompleteConfig() {
    return {
      ...this._getSharedConfig(),

      cursorStartPosition: new Position(2, 11),
      tiles: {
        tileType: 'sand',
        // 240 cols x 22 rows. An island-shaped sand mass instead of a
        // tidy rectangle: irregular coastlines top and bottom, bays
        // pushed inward at the section seams (cols ~80 and ~160), and
        // a scatter of tiny offshore sand dunes peeking out of the
        // water. The east end fades into a cobblestone hallway holding
        // the three meters and the final exit gate.
        layout: [
          'SSWWWWSSWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWWWWWWWWWSSSSSSSSSSWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWWWSWWWWWSSSSSSSSSSSSSWWWWWWWWWWWWW',
          'SSSSWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWSWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWW',
          'SSSSSSWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWSS',
          'SSSSSSSSWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'SSSSSSSSSSSSSSRSSSRSSSSSSSSSSSSSSSSSSSSSRSSSRSSSSSSSSSSSSSSSSSSSSSRSSSRSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCCCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCGCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCCCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCCCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCGCCCGCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCCCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCCCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCGCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCCCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'WWWWSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'WWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWSSSSSSWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWSSSSSSSSS',
          'WWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWW',
          'WWWWWWWWSSSSSSSSSSSSSSSSSSWWWWWWWWWSWWWWWWWWWWWWSSSSSSSSSSWWWWWWWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWSWWWWWWWSSSSSSSSSSWWWWWWWWWWWWWWWWW',
        ],
        legend: {
          W: 'water',
          S: 'sand',
          C: 'cobblestone',
          G: 'gate',
          R: 'rock',
        },
        decorations: [
          // ----- Desert (sand area, cols 1-79) ----------------------
          // Palm clusters, lone cacti, and a few dried-out trees so
          // the western leg of the zone reads as a desert oasis
          // instead of an empty sand strip. Every plant uses
          // collisionFootprintH:1 so the canopy is a "walk behind"
          // tile (player slides under the leaves and stays visible
          // through the trunk). All positions vetted against the
          // organic sand mass — the coastline has irregular bays so
          // pick only x,y pairs whose 2x2 footprint sits on sand.
          // North-side palms and cacti above the gem row.
          { regionName: 'palm_tree',     position: [ 1,  2], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'palm_tree_alt', position: [16,  1], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'cactus',        position: [ 6,  8], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'dead_tree',     position: [21,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'cactus',        position: [28,  1], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'palm_tree',     position: [34,  1], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'dead_pine',     position: [50,  2], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'palm_tree_alt', position: [56,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'cactus',        position: [60,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'dead_tree',     position: [74, 5], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          // South-side palms and cacti below the gem row.
          { regionName: 'palm_tree',     position: [ 4, 16], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'cactus',        position: [10, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'dead_pine',     position: [18, 11], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'palm_tree_alt', position: [30, 15], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'cactus',        position: [38,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'palm_tree',     position: [46, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'dead_tree',     position: [56,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'cactus',        position: [64, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'palm_tree_alt', position: [72, 15], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          // ----- Tree labyrinth (cols 80-156) ------------------------
          // Recursive-backtracker maze on a 19-cell x 4-cell grid where
          // each maze cell and each wall is 2 game tiles wide. Trees
          // are 2x2 decorations that fully block (collisionFootprintH:
          // 2, the default) so the canopy and trunk together act as a
          // wall — the cursor must thread through the 2-tile-wide
          // corridors carved between them. regionName cycles through
          // five round-tree variants so the forest doesn't read as a
          // single repeated sprite. Entry from the desert sits at row
          // 11 (cursor row), exit east at row 11 into the boss arena.
          { regionName: 'tree_round_shadow', position: [ 80,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [ 82,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [ 84,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [ 86,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [ 88,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [ 90,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [ 92,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [ 94,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [ 96,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [ 98,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [100,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [102,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [104,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [106,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [108,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [110,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [112,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [114,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [116,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [118,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [120,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [122,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [124,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [126,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [128,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [130,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [132,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [134,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [136,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [138,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [140,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [142,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [144,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [146,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [148,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [150,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [152,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [154,  1], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [156, 2], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [ 80,  3], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [100,  3], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [128,  3], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [140,  3], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [156,  3], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [ 80,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [ 84,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [ 86,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [ 88,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [ 90,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [ 92,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [ 94,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [ 96,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [100,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [104,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [106,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [108,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [110,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [112,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [114,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [116,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [118,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [120,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [122,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [124,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [128,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [132,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [134,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [136,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [140,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [144,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [146,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [148,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [150,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [152,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [156,  5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [ 80,  7], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [ 88,  7], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [ 96,  7], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [100,  7], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [108,  7], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [124,  7], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [128,  7], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [136,  7], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [144,  7], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [152,  7], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [156,  7], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [ 80,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [ 82,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [ 84,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [ 88,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [ 92,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [ 96,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [100,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [102,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [104,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [108,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [112,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [114,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [116,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [118,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [120,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [122,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [124,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [128,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [130,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [132,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [134,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [136,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [138,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [140,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [142,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [144,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [148,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [152,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [156,  9], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [ 84, 11], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [ 88, 11], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [ 92, 11], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [100, 11], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [108, 11], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [116, 11], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [124, 11], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [132, 11], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [148, 11], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [152, 11], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [ 80, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [ 84, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [ 88, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [ 92, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [ 94, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [ 96, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [ 98, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [100, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [104, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [106, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [108, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [112, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [116, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [120, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [124, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [126, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [128, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [132, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [136, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [138, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [140, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [142, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [144, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [146, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [148, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [152, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [156, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [ 80, 15], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [ 88, 15], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [104, 15], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [112, 15], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [120, 15], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [136, 15], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [156, 15], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [ 80, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [ 82, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [ 84, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [ 86, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [ 88, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [ 90, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [ 92, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [ 94, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [ 96, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [ 98, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [100, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [102, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [104, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [106, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [108, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [110, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [112, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [114, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [116, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [118, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [120, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [122, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [124, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [126, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [128, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [130, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [132, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [134, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [136, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [138, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [140, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [142, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [144, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [146, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_layered', position: [148, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dark', position: [150, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_shadow', position: [152, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_green', position: [154, 17], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_round_dense', position: [156, 17], footprintW: 2, footprintH: 2, blocking: true },

          // ----- Boss-arena rocks ringing the snake's pit -----------
          { regionName: 'rock_2x2', position: [170, 4],  footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1, renderScale: 0.7 },
          { regionName: 'rock_2x2', position: [170, 16], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1, renderScale: 0.7 },
          { regionName: 'rock_2x2', position: [220, 4],  footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1, renderScale: 0.7 },
          { regionName: 'rock_2x2', position: [220, 16], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1, renderScale: 0.7 },
        ],
        specialTiles: [
          // Sand-area gems sit on letters tucked behind inline `R`
          // rocks (see layout). Player hops the rocks with w/e/b to
          // land on the gem letter.
          { type: 'collectible_key', keyId: 'sand_gem_orange', name: 'Orange Gem', color: '#FFD700', spriteRegion: 'gem_orange', position: [16, 5] },
          { type: 'collectible_key', keyId: 'sand_gem_green',  name: 'Green Gem',  color: '#C0C0C0', spriteRegion: 'gem_green',  position: [42, 5] },
          { type: 'collectible_key', keyId: 'sand_gem_bronze', name: 'Bronze Gem', color: '#CD7F32', spriteRegion: 'gem_bronze', position: [68, 5] },
        ],
        textLabels: [
          // Row-5 phrase that threads through the sand. The gem at
          // each color word sits on the bolded letter so the player
          // can `w`-hop directly to it.
          ...'hop'.split('').map((c, i) => ({ text: c, position: [8 + i, 5], color: '#1c1108', fontSize: '14px' })),
          ...'to'.split('').map((c, i) => ({ text: c, position: [12 + i, 5], color: '#1c1108', fontSize: '14px' })),
          ...'the'.split('').map((c, i) => ({ text: c, position: [17 + i, 5], color: '#1c1108', fontSize: '14px' })),
          ...'orange'.split('').map((c, i) => ({ text: c, position: [22 + i, 5], color: '#1c1108', fontSize: '14px' })),
          ...'leap'.split('').map((c, i) => ({ text: c, position: [34 + i, 5], color: '#1c1108', fontSize: '14px' })),
          ...'to'.split('').map((c, i) => ({ text: c, position: [39 + i, 5], color: '#1c1108', fontSize: '14px' })),
          ...'green'.split('').map((c, i) => ({ text: c, position: [46 + i, 5], color: '#1c1108', fontSize: '14px' })),
          ...'earn'.split('').map((c, i) => ({ text: c, position: [56 + i, 5], color: '#1c1108', fontSize: '14px' })),
          ...'bronze'.split('').map((c, i) => ({ text: c, position: [72 + i, 5], color: '#1c1108', fontSize: '14px' })),
        ],
        gate: {
          // Final exit at the east wall of the boss arena. Opens once
          // all three sand gems are collected (and at that point the
          // pixel-snake retreat event also fires).
          locked: true,
          unlocksWhen: {
            requiredCollectibleKeys: ['sand_gem_orange', 'sand_gem_green', 'sand_gem_bronze'],
          },
          position: [236, 11],
          leadsTo: 'zone_2',
        },
        secondaryGates: [
          // Three meters lined up against the east wall, just before
          // the final gate. Each consumes its matching sand gem and
          // visually swaps from empty (red) to charged (blue).
          {
            locked: true,
            unlocksWhen: { requiredCollectibleKeys: ['sand_gem_orange'] },
            position: [232, 8],
            leadsTo: 'boss_arena_orange',
            closedSpriteRegion: 'energy_meter_empty',
            openSpriteRegion: 'energy_meter_charged',
          },
          {
            locked: true,
            unlocksWhen: { requiredCollectibleKeys: ['sand_gem_green'] },
            position: [232, 11],
            leadsTo: 'boss_arena_green',
            closedSpriteRegion: 'energy_meter_empty',
            openSpriteRegion: 'energy_meter_charged',
          },
          {
            locked: true,
            unlocksWhen: { requiredCollectibleKeys: ['sand_gem_bronze'] },
            position: [232, 14],
            leadsTo: 'boss_arena_bronze',
            closedSpriteRegion: 'energy_meter_empty',
            openSpriteRegion: 'energy_meter_charged',
          },
        ],
      },
      npcs: [
        {
          id: 'pixel_snake',
          type: 'pixel_snake',
          appearsWhen: { zoneEntered: true },
          dialogue: [
            'Hsss... three trials, three gemsss.',
            'Brrring them all, or stay in my pit forever.',
          ],
          position: [195, 11], // Centre of the boss arena
          walkable: false,
        },
      ],
      events: [
        {
          id: 'zone_practice_intro',
          trigger: 'onZoneEnter',
          actions: [
            {
              type: 'showNarration',
              text:
                'Trials of the Sand: hop the rocks for gems, weave the trees, then charge the meters past the snake.',
            },
          ],
        },
        {
          // The pixel snake slithers away once all three gems are
          // collected and have charged the meters.
          id: 'zone_practice_snake_retreat',
          trigger: 'onCollectibleKeysCollected',
          conditions: {
            collectedCollectibleKeys: ['sand_gem_orange', 'sand_gem_green', 'sand_gem_bronze'],
          },
          actions: [
            { type: 'hideNPC', npcId: 'pixel_snake' },
            {
              type: 'showNarration',
              text: 'The Pixel Snake hisses one last time and slithers away into the dunes.',
            },
          ],
        },
      ],
    };
  }

  static create() {
    return new Zone(this._getCompleteConfig());
  }

  static getConfig() {
    return this._getCompleteConfig();
  }
}
