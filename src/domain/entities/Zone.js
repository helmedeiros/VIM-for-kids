import { Position } from '../value-objects/Position.js';
import { DynamicZoneMap } from './DynamicZoneMap.js';
import { VimKey } from './VimKey.js';
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
    this._collectedKeys = new Set();

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

  get textLabels() {
    return [...this._textLabels];
  }

  get gate() {
    return this._gate;
  }

  get npcs() {
    return [...this._npcs];
  }

  get events() {
    return [...this._events];
  }

  _buildZone(config) {
    // Create dynamic zone map with full-screen water and centered zone area
    this._gameMap = new DynamicZoneMap(12, 8);

    // Build zone-specific tiles
    this._buildTiles(config.tiles);

    // Create VIM keys from special tiles (converting to absolute coordinates)
    this._buildVimKeys(config.tiles.specialTiles);

    // Create text labels (converting to absolute coordinates)
    this._buildTextLabels(config.tiles.textLabels);

    // Create gate (converting to absolute coordinates)
    this._buildGate(config.tiles.gate);

    // Store NPCs configuration (for dynamic appearance)
    this._npcs = config.npcs || [];

    // Store events configuration
    this._events = config.events || [];
  }

  _buildTiles(tilesConfig) {
    // Build zone-specific tiles using the dynamic map
    if (tilesConfig && tilesConfig.tileType) {
      // Create specific tile arrangements for different zone themes
      this._createZoneSpecificTiles(tilesConfig.tileType);
    }
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
    if (gateConfig) {
      // Convert zone-relative coordinates to absolute coordinates
      const absolutePosition = this._gameMap.zoneToAbsolute(
        gateConfig.position[0],
        gateConfig.position[1]
      );
      this._gate = new Gate(absolutePosition);

      // Gate starts locked as per configuration
      this._gate.close();

      // Store unlock conditions
      this._gateUnlockConditions = gateConfig.unlocksWhen;
    }
  }

  _getKeyDescription(key) {
    const descriptions = {
      h: 'Move left - The westward wind key',
      j: 'Move down - The earthward root key',
      k: 'Move up - The skyward branch key',
      l: 'Move right - The eastward sun key',
    };
    return descriptions[key] || `Movement key: ${key}`;
  }

  // Game logic methods
  collectKey(key) {
    this._collectedKeys.add(key.key);

    // Remove key from available keys
    const index = this._vimKeys.findIndex((k) => k.key === key.key);
    if (index !== -1) {
      this._vimKeys.splice(index, 1);
    }

    // Check gate unlock conditions
    this._checkGateUnlock();
  }

  _checkGateUnlock() {
    if (this._gateUnlockConditions && this._gate) {
      const requiredKeys = this._gateUnlockConditions.collectedVimKeys;

      if (requiredKeys && requiredKeys.every((key) => this._collectedKeys.has(key))) {
        this._gate.open();
        return true;
      }
    }
    return false;
  }

  getCollectedKeysCount() {
    return this._collectedKeys.size;
  }

  getCollectedKeys() {
    return new Set(this._collectedKeys);
  }

  isComplete() {
    return this._gate && this._gate.isOpen;
  }

  getCursorStartPosition() {
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
