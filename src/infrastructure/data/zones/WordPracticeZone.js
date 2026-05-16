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
          // ----- Tree labyrinth (middle band, cols 84-156) ----------
          // Stagger 2x2 trees across the band so the player has to
          // weave around them. Each tree blocks normal movement but
          // word motion (w/e/b) still hops across them.
          { regionName: 'tree_2x2', position: [88, 3],  footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [96, 6],  footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [104, 4], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [112, 7], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [120, 3], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [128, 5], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [136, 8], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [144, 4], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [152, 6], footprintW: 2, footprintH: 2, blocking: true },

          { regionName: 'tree_2x2', position: [92, 12],  footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [100, 14], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [108, 12], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [116, 15], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [124, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [132, 16], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [140, 13], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [148, 15], footprintW: 2, footprintH: 2, blocking: true },
          { regionName: 'tree_2x2', position: [156, 12], footprintW: 2, footprintH: 2, blocking: true },

          // ----- Sand-area boulders (chunky cluster look) -----------
          // Decorative boulders scattered in the sand area so it
          // doesn't read as one empty stretch. Word motion already
          // treats blocking decorations as hoppable.
          { regionName: 'rock_2x2', position: [22, 14], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1, renderScale: 0.7 },
          { regionName: 'rock_2x2', position: [40, 16], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1, renderScale: 0.7 },
          { regionName: 'rock_2x2', position: [62, 14], footprintW: 2, footprintH: 2, blocking: true, collisionFootprintH: 1, renderScale: 0.7 },

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
