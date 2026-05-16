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
          'SSWWWWSSWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWWWWWWWWWSSSSSSSSSSSSSWWWWWWWWWWWWWWWWWWWWWWWWSSSSSSSSSSSSWWWWWWWWWSSWWWWWWWWWWWWSSSSSSSSSSSSSSWWSSSSWWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWWWSWWWWWSSSSSSSSSSSSSWWWWWWWWWWWWW',
          'SSSSWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWSWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWW',
          'SSSSSSWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWSS',
          'SSSSSSSSWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'SSSSSSSSSSSSSSRSSSRSSSSSSSSSSSSSSSSSSSSSRSSSRSSSSSSSSSSSSSSSSSSSSSRSSSRSSSSSSSSWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCCCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCGCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCCCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCCCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCGCCCGCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCCCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCCCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCGCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSCCCCCCCCCS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'WWWWSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWSSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSWWWWSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
          'WWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWSSSSSSSSSSWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSWWWWWWSSSSSSSSS',
          'WWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWWWWWWWWWSSSSSSSSSWWWWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWW',
          'WWWWWWWWSSSSSSSSSSSSSSSSSSWWWWWWWWWSWWWWWWWWWWWWSSSSSSSSSSWWWWWWWWWWWWWWWWWWWWWWWWSSSSSSSWWWWWWWWWWWWWWWWWWWWWSSSSSSSSSSWWWWWWWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWWWSSSSSSSSSSSSSSSSSSWWWWWWWWWWWWWWSWWWWWWWSSSSSSSSSSWWWWWWWWWWWWWWWWW',
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
          { regionName: 'dead_tree',     position: [74,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          // South-side palms and cacti below the gem row.
          { regionName: 'palm_tree',     position: [ 4, 18], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'cactus',        position: [10, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'dead_pine',     position: [18, 11], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'palm_tree_alt', position: [30, 15], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'cactus',        position: [38,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'palm_tree',     position: [46, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'dead_tree',     position: [56,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'cactus',        position: [64, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'palm_tree_alt', position: [72, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },

          // ----- Tree labyrinth (middle band, cols 84-156) ----------
          // Five horizontal hedge rows at anchor rows 1, 5, 9, 13, 17.
          // Variants cycle through the round-tree palette so the
          // forest looks lived-in. Every tree uses collisionFootprintH:
          // 1 — the trunk row blocks but the canopy row is walkable,
          // so the cursor slips behind the leaves (rendered over it)
          // before bumping the trunk. The maze comes from the offset
          // gap pattern: each hedge stands at different cols, forcing
          // the player to weave between trunks.
          // Hedge 1 — anchor row 3 (top of sand mass in this band).
          { regionName: 'tree_round_green',   position: [ 84,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dark',    position: [ 90,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_layered', position: [ 96,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dense',   position: [104,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_shadow',  position: [110,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_green',   position: [118,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dark',    position: [124,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dense',   position: [132,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_layered', position: [140,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_shadow',  position: [146,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dark',    position: [154,  3], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          // Hedge 2 — anchor row 5 (offset cols), trunks block row 6.
          { regionName: 'tree_round_dense',   position: [ 86,  5], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_shadow',  position: [ 94,  5], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_green',   position: [100,  5], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_layered', position: [108,  5], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dark',    position: [114,  5], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_green',   position: [122,  5], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dense',   position: [130,  5], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_shadow',  position: [136,  5], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dark',    position: [144,  5], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_layered', position: [152,  5], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          // Hedge 3 — anchor row 9, trunks block row 10.
          { regionName: 'tree_round_shadow',  position: [ 84,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_green',   position: [ 92,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dense',   position: [100,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dark',    position: [106,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_layered', position: [116,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_green',   position: [126,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_shadow',  position: [134,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dark',    position: [142,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dense',   position: [150,  9], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          // Hedge 4 — anchor row 13 (offset cols), trunks block row 14.
          { regionName: 'tree_round_layered', position: [ 88, 13], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dark',    position: [ 96, 13], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_shadow',  position: [104, 13], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_green',   position: [112, 13], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dense',   position: [120, 13], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_layered', position: [128, 13], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dark',    position: [138, 13], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_shadow',  position: [146, 13], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_green',   position: [154, 13], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          // Hedge 5 — anchor row 17, trunks block row 18.
          { regionName: 'tree_round_dense',   position: [ 86, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_green',   position: [ 92, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dark',    position: [100, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_layered', position: [108, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_shadow',  position: [116, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dense',   position: [124, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_dark',    position: [132, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_green',   position: [140, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_layered', position: [148, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },
          { regionName: 'tree_round_shadow',  position: [156, 17], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1 },

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
