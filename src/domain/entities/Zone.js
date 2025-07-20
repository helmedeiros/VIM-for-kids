import { Position } from '../value-objects/Position.js';
import { DynamicZoneMap } from './DynamicZoneMap.js';
import { VimKey } from './VimKey.js';
import { CollectibleKey } from './CollectibleKey.js';
import { Gate } from './Gate.js';
import { TextLabel } from './TextLabel.js';
import { TileType } from '../value-objects/TileType.js';

export class Zone {
  constructor(zoneConfig) {
    this._zoneId = zoneConfig.zoneId;
    this._name = zoneConfig.name;
    this._biome = zoneConfig.biome;
    this._skillFocus = zoneConfig.skillFocus;
    this._puzzleTheme = zoneConfig.puzzleTheme;
    this._narration = zoneConfig.narration;
    this._collectedKeys = new Set(); // For VIM keys
    this._collectedCollectibleKeys = new Set(); // For CollectibleKeys

    // Store custom cursor start position if provided
    this._customCursorStartPosition = zoneConfig.cursorStartPosition || null;

    // Build the zone from configuration
    this._buildZone(zoneConfig);
  }

  get zoneId() {
    return this._zoneId;
  }

  get name() {
    return this._name;
  }

  get biome() {
    return this._biome;
  }

  get skillFocus() {
    return [...this._skillFocus];
  }

  get puzzleTheme() {
    return this._puzzleTheme;
  }

  get narration() {
    return [...this._narration];
  }

  get gameMap() {
    return this._gameMap;
  }

  get vimKeys() {
    return [...this._vimKeys];
  }

  get collectibleKeys() {
    return [...this._collectibleKeys];
  }

  get textLabels() {
    return [...this._textLabels];
  }

  get gate() {
    return this._gate;
  }

  get secondaryGates() {
    return [...(this._secondaryGates || [])];
  }

  get npcs() {
    return [...this._npcs];
  }

  get events() {
    return [...this._events];
  }

  _buildZone(config) {
    // Determine zone dimensions from layout or use defaults
    let zoneWidth = 12;
    let zoneHeight = 8;

    if (config.tiles && config.tiles.layout) {
      // Use layout dimensions
      zoneHeight = config.tiles.layout.length;
      zoneWidth = config.tiles.layout[0] ? config.tiles.layout[0].length : 12;
    }

    // Create dynamic zone map with full-screen water and centered zone area
    this._gameMap = new DynamicZoneMap(zoneWidth, zoneHeight);

    // Build zone-specific tiles
    this._buildTiles(config.tiles);

    // Create VIM keys from special tiles (converting to absolute coordinates)
    this._buildVimKeys(config.tiles.specialTiles);

    // Create CollectibleKeys from special tiles (converting to absolute coordinates)
    this._buildCollectibleKeys(config.tiles.specialTiles);

    // Create text labels (converting to absolute coordinates)
    this._buildTextLabels(config.tiles.textLabels);

    // Create gate (converting to absolute coordinates)
    this._buildGate(config.tiles.gate);

    // Create secondary gates (converting to absolute coordinates)
    this._buildSecondaryGates(config.tiles.secondaryGates);

    // Store NPCs configuration (for dynamic appearance)
    this._npcs = config.npcs || [];

    // Store events configuration
    this._events = config.events || [];
  }

  _buildTiles(tilesConfig) {
    // Build zone-specific tiles using the dynamic map
    if (tilesConfig && tilesConfig.layout && tilesConfig.legend) {
      // Process the layout array using the legend mapping
      this._processLayoutWithLegend(tilesConfig.layout, tilesConfig.legend);
    } else if (tilesConfig && tilesConfig.tileType) {
      // Fallback to old method for zones without layout
      this._createZoneSpecificTiles(tilesConfig.tileType);
    }
  }

  _processLayoutWithLegend(layout, legend) {
    // Process each row of the layout
    layout.forEach((row, rowIndex) => {
      // Process each character in the row
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const char = row[colIndex];
        const tileTypeName = legend[char];

        if (tileTypeName) {
          // Convert zone-relative coordinates to absolute coordinates
          const absolutePosition = this._gameMap.zoneToAbsolute(colIndex, rowIndex);

          // Map legend tile type names to TileType instances
          const tileType = this._getTileTypeFromName(tileTypeName);

          if (tileType && this._gameMap.isValidPosition(absolutePosition)) {
            this._gameMap.setTileAt(absolutePosition, tileType);
          }
        }
      }
    });
  }

  _getTileTypeFromName(typeName) {
    // Map tile type names from legend to TileType instances
    const typeMapping = {
      grass: TileType.GRASS,
      water: TileType.WATER,
      dirt: TileType.DIRT,
      tree: TileType.TREE,
      stone: TileType.STONE,
      path: TileType.PATH,
      wall: TileType.WALL,
      bridge: TileType.BRIDGE,
      sand: TileType.SAND,
      ruins: TileType.RUINS,
      field: TileType.FIELD,
      test_ground: TileType.TEST_GROUND,
      boss_area: TileType.BOSS_AREA,
      // Directional ramp tiles
      ramp_right: TileType.RAMP_RIGHT,
      ramp_left: TileType.RAMP_LEFT,
      // Special tiles that should be walkable paths
      vim_key_spot: TileType.PATH,
      gate: TileType.PATH,
      npc_spot: TileType.PATH,
      // Zone-specific variations
      forest_ground: TileType.GRASS,
      canyon_floor: TileType.SAND,
      cave_floor: TileType.STONE,
      temple_floor: TileType.STONE,
      swamp_ground: TileType.GRASS,
      spring_ground: TileType.GRASS,
      stone_garden: TileType.STONE,
      grass_field: TileType.FIELD,
      practice_ground: TileType.TEST_GROUND,
      stone_floor: TileType.STONE,
    };

    return typeMapping[typeName] || TileType.GRASS; // Default to grass if unknown
  }

  _createZoneSpecificTiles(tileType) {
    // Create zone-specific tile patterns
    if (tileType === 'forest_ground') {
      // Add some dirt paths and stone areas within the zone
      const centerX = this._gameMap.zoneStartX;
      const centerY = this._gameMap.zoneStartY;

      // Create dirt starting area (3x3)
      for (let y = centerY + 1; y < centerY + 4; y++) {
        for (let x = centerX + 1; x < centerX + 4; x++) {
          this._gameMap.setTileAt(new Position(x, y), TileType.DIRT);
        }
      }

      // Create stone gate area
      for (let y = centerY + 3; y < centerY + 5; y++) {
        for (let x = centerX + 9; x < centerX + 11; x++) {
          this._gameMap.setTileAt(new Position(x, y), TileType.STONE);
        }
      }

      // Add a tree in the forest clearing
      this._gameMap.setTileAt(new Position(centerX + 1, centerY + 6), TileType.TREE);
    }
  }

  _buildVimKeys(specialTiles) {
    this._vimKeys = [];

    if (specialTiles) {
      specialTiles.forEach((tile) => {
        if (tile.type === 'vim_key') {
          // Convert zone-relative coordinates to absolute coordinates
          const absolutePosition = this._gameMap.zoneToAbsolute(tile.position[0], tile.position[1]);
          const key = tile.value;
          const description = this._getKeyDescription(key);
          this._vimKeys.push(new VimKey(absolutePosition, key, description));
        }
      });
    }
  }

  _buildCollectibleKeys(specialTiles) {
    this._collectibleKeys = [];

    if (specialTiles) {
      specialTiles.forEach((tile) => {
        if (tile.type === 'collectible_key') {
          // Convert zone-relative coordinates to absolute coordinates
          const absolutePosition = this._gameMap.zoneToAbsolute(tile.position[0], tile.position[1]);
          const keyId = tile.keyId;
          const name = tile.name || 'Key';
          const color = tile.color || '#FFD700';
          this._collectibleKeys.push(new CollectibleKey(absolutePosition, keyId, name, color));
        }
      });
    }
  }

  _buildTextLabels(textLabels) {
    this._textLabels = [];

    if (textLabels) {
      textLabels.forEach((label) => {
        // Convert zone-relative coordinates to absolute coordinates
        const absolutePosition = this._gameMap.zoneToAbsolute(label.position[0], label.position[1]);
        this._textLabels.push(new TextLabel(absolutePosition, label.text));
      });
    }
  }

    _buildGate(gateConfig) {
    if (gateConfig && gateConfig.position) {
      // Convert zone-relative coordinates to absolute coordinates
      const absolutePosition = this._gameMap.zoneToAbsolute(
        gateConfig.position[0],
        gateConfig.position[1]
      );

      // Pass unlock conditions to the Gate constructor
      const unlockConditions = gateConfig.unlocksWhen || {};
      this._gate = new Gate(absolutePosition, unlockConditions);

      // Gate starts locked as per configuration
      this._gate.close();
    } else if (gateConfig && gateConfig.position === null) {
      // Final zone with no exit gate - create a dummy gate for consistency
      const centerPosition = this._gameMap.zoneToAbsolute(6, 6);
      this._gate = new Gate(centerPosition);
      this._gate.open(); // Final zone gate is always "open" (completed)
    }
  }

  _buildSecondaryGates(secondaryGatesConfig) {
    this._secondaryGates = [];

    if (secondaryGatesConfig && Array.isArray(secondaryGatesConfig)) {
      secondaryGatesConfig.forEach((gateConfig) => {
        if (gateConfig && gateConfig.position) {
          // Convert zone-relative coordinates to absolute coordinates
          const absolutePosition = this._gameMap.zoneToAbsolute(
            gateConfig.position[0],
            gateConfig.position[1]
          );

          // Pass unlock conditions to the Gate constructor
          const unlockConditions = gateConfig.unlocksWhen || {};
          const secondaryGate = new Gate(absolutePosition, unlockConditions);

          // Gate starts locked as per configuration
          secondaryGate.close();

          this._secondaryGates.push(secondaryGate);
        }
      });
    }
  }

  _getKeyDescription(key) {
    const descriptions = {
      // Basic movement
      h: 'Move left - The westward wind key',
      j: 'Move down - The earthward root key',
      k: 'Move up - The skyward branch key',
      l: 'Move right - The eastward sun key',

      // Mode switching
      i: 'Insert mode - the key to creation',
      ESC: 'Escape to Normal mode - the key to control',
      ':': 'Command mode - the key to power',

      // Word navigation
      w: 'word - forward to start of next word',
      W: 'WORD - forward to start of next WORD',
      e: 'end - forward to end of word',
      E: 'End - forward to end of WORD',
      b: 'back - backward to start of word',
      B: 'Back - backward to start of WORD',

      // Deletion
      x: 'x - delete character under cursor',
      dd: 'dd - delete entire line',
      D: 'D - delete from cursor to end of line',
      dw: 'dw - delete word',

      // Insertion
      a: 'a - append after cursor',
      o: 'o - open line below',
      O: 'O - open line above',

      // Copy/paste
      yy: 'yy - yank (copy) line',
      p: 'p - put (paste) after cursor',
      P: 'P - put (paste) before cursor',
      d: 'd - delete (cut) for pasting',

      // Search
      '/': '/ - search forward',
      '?': '? - search backward',
      n: 'n - next search result',
      N: 'N - previous search result',

      // Commands
      ':w': ':w - write (save) file',
      ':q': ':q - quit vim',
      ':x': ':x - save and exit',

      // Special
      mastery: 'Complete mastery of all VIM skills',
    };
    return descriptions[key] || `VIM key: ${key}`;
  }

  // Game logic methods
  collectKey(key) {
    if (key.type === 'collectible_key') {
      // Handle CollectibleKey
      this._collectedCollectibleKeys.add(key.keyId);

      // Remove key from available collectible keys
      const index = this._collectibleKeys.findIndex((k) => k.keyId === key.keyId);
      if (index !== -1) {
        this._collectibleKeys.splice(index, 1);
      }
    } else {
      // Handle VimKey (backward compatibility)
      this._collectedKeys.add(key.key);

      // Remove key from available VIM keys
      const index = this._vimKeys.findIndex((k) => k.key === key.key);
      if (index !== -1) {
        this._vimKeys.splice(index, 1);
      }
    }

    // Check gate unlock conditions
    this._checkGateUnlock();
  }

  collectCollectibleKey(collectibleKey) {
    this._collectedCollectibleKeys.add(collectibleKey.keyId);

    // Remove key from available collectible keys
    const index = this._collectibleKeys.findIndex((k) => k.keyId === collectibleKey.keyId);
    if (index !== -1) {
      this._collectibleKeys.splice(index, 1);
    }

    // Check gate unlock conditions
    this._checkGateUnlock();
  }

  /**
   * Try to unlock a secondary gate when player interacts with it
   * Returns true if the gate was unlocked, false otherwise
   */
    tryUnlockSecondaryGate(position) {
    if (!this._secondaryGates) return false;

    const gate = this._secondaryGates.find(g => g.position.equals(position));
    if (!gate) return false;

    // If gate can be unlocked, open it (visual will be handled by renderer)
    if (gate.canUnlock(this._collectedKeys, this._collectedCollectibleKeys)) {
      // Mark the gate as unlocked - when open, it becomes invisible and walkable
      gate.open();
      return true;
    }

    return false;
  }

  _checkGateUnlock() {
    let anyGateUnlocked = false;

    // Check main gate (auto-unlock behavior)
    if (this._gate) {
      // Use the gate's canUnlock method with both VIM keys and CollectibleKeys
      if (this._gate.canUnlock(this._collectedKeys, this._collectedCollectibleKeys)) {
        this._gate.open();
        anyGateUnlocked = true;
      }
    }

    // Secondary gates don't auto-unlock, they unlock on interaction
    // No auto-unlocking for secondary gates here

    return anyGateUnlocked;
  }

  getCollectedKeysCount() {
    return this._collectedKeys.size;
  }

  getCollectedKeys() {
    return new Set(this._collectedKeys);
  }

  getCollectedCollectibleKeysCount() {
    return this._collectedCollectibleKeys.size;
  }

  getCollectedCollectibleKeys() {
    return new Set(this._collectedCollectibleKeys);
  }

  isComplete() {
    return this._gate && this._gate.isOpen;
  }

  getCursorStartPosition() {
    // Use custom cursor start position if provided, otherwise default to center of dirt area
    if (this._customCursorStartPosition) {
      // Convert zone-relative coordinates to absolute coordinates
      return this._gameMap.zoneToAbsolute(
        this._customCursorStartPosition.x,
        this._customCursorStartPosition.y
      );
    }
    // Start position in the center of the dirt area
    return this._gameMap.zoneToAbsolute(2, 2);
  }

  getActiveNPCs() {
    // Return NPCs that should be visible based on current game state
    return this._npcs
      .filter((npc) => {
        if (npc.appearsWhen && npc.appearsWhen.collectedVimKeys) {
          return npc.appearsWhen.collectedVimKeys.every((key) => this._collectedKeys.has(key));
        }
        return true; // NPC is always visible if no conditions
      })
      .map((npc) => {
        // Convert NPC positions to absolute coordinates for rendering
        const absolutePos = this._gameMap.zoneToAbsolute(npc.position[0], npc.position[1]);
        return {
          ...npc,
          position: [absolutePos.x, absolutePos.y],
        };
      });
  }

  getNPCDialogue(npcId) {
    const npc = this._npcs.find((n) => n.id === npcId);
    return npc ? npc.dialogue : [];
  }

  getNPCPosition(npcId) {
    const npc = this._npcs.find((n) => n.id === npcId);
    if (npc && npc.position) {
      return this._gameMap.zoneToAbsolute(npc.position[0], npc.position[1]);
    }
    return null;
  }

  cleanup() {
    // Clean up the dynamic map resources
    if (this._gameMap && typeof this._gameMap.cleanup === 'function') {
      this._gameMap.cleanup();
    }
  }
}
