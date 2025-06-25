# Zone Builder Guide for LLM Agent

## Overview

You are an LLM Agent tasked with implementing a new zone for the VIM for Kids game. You will receive a JSON configuration that follows the `doc/zone.schema.json` schema. Your job is to create the zone factory, comprehensive tests, and register the zone properly.

## Input: Zone JSON Configuration

You will receive a JSON object with this structure:

```json
{
  "id": "zone_X",
  "name": "Zone Name",
  "description": "Zone narrative description",
  "tiles": {
    "layout": ["row1", "row2", ...],
    "legend": {"symbol": "tile_type", ...}
  },
  "npcs": [
    {
      "id": "npc_id",
      "name": "NPC Name",
      "position": {"x": 0, "y": 0},
      "dialogue": ["dialogue line 1", "dialogue line 2"]
    }
  ],
  "events": [
    {
      "id": "event_id",
      "trigger": {"type": "step_on_tile", "position": {"x": 0, "y": 0}},
      "conditions": {"required_keys": ["key1"]},
      "actions": [{"type": "show_dialogue", "payload": {...}}]
    }
  ],
  "gateTo": "next_zone_id"
}
```

## Architecture Overview

The VIM for Kids game uses hexagonal architecture with clean separation:

- **Domain Entity**: `src/domain/entities/Zone.js` - Pure zone logic with dynamic centering
- **Dynamic Zone Map**: `src/domain/entities/DynamicZoneMap.js` - Full-screen water with centered zones
- **Infrastructure Factory**: `src/infrastructure/data/zones/[ZoneName]Zone.js` - Zone-specific factory
- **Registry**: `src/infrastructure/data/zones/ZoneRegistry.js` - Central zone management
- **Level System**: `src/application/LevelGameState.js` - Multi-zone level management (2-3 zones per level)
- **Level Configurations**: `src/application/LevelConfigurations.js` - Level definitions with zone sequences
- **Tests**: Complete unit test coverage for all scenarios including multi-zone integration

### 🌊 Dynamic Zone Centering System

**All zones are automatically centered with water all around!**

- **Full-Screen Coverage**: Zones dynamically size to fill any screen (desktop, tablet, mobile)
- **Automatic Centering**: 12x8 zone area appears in the center, surrounded by water
- **Zone-Relative Coordinates**: You work with simple 0-11 coordinates, system converts to absolute
- **Responsive Design**: Automatically adapts to window resizing

> 📖 **For technical details**, see `doc/ZONE_CENTERING_SYSTEM.md`

### 🎮 Multi-Zone Level System

**Your zone will be part of a level with 2-3 zones:**

- **Level Progression**: Players move through zones sequentially within a level
- **Zone Transitions**: When a zone is completed, players progress to the next zone
- **Custom Cursor Positions**: Each zone can have a different cursor start position
- **Level Completion**: Level completes when all zones are finished

**Zone Context in Levels:**

```javascript
// Example: Your zone in a level
level_2: {
  zones: ['zone_2', 'zone_3'], // Your zone + another zone
  name: 'Text Manipulation',
  description: 'Master VIM modes and word navigation'
}
```

## Implementation Steps

### Step 1: Create the Zone Factory

Create `src/infrastructure/data/zones/[ZoneName]Zone.js`:

```javascript
import { Zone } from '../../../domain/entities/Zone.js';
import { Position } from '../../../domain/value-objects/Position.js';

export class [ZoneName]Zone {
  static create() {
    const config = {
      // Map your JSON input to Zone configuration
      zoneId: '[zone_id_from_json]',
      name: '[name_from_json]',
      biome: '[biome_from_json]',
      skillFocus: ['skill1', 'skill2'], // VIM skills taught in this zone
      puzzleTheme: '[puzzle_theme_from_json]',
      narration: ['story_line_1', 'story_line_2'],

      // Optional: Custom cursor start position for zone transitions
      // If not provided, defaults to center of dirt area (2, 2)
      cursorStartPosition: new Position(x, y), // Use if zone needs different start position

      tiles: {
        tileType: 'forest_ground', // or other tile type
        specialTiles: [
          // Map VIM keys and special tiles from JSON
        ],
        textLabels: [
          // Map text labels from JSON
        ],
        gate: {
          position: [x, y],
          unlocksWhen: {
            collectedVimKeys: ['h', 'j', 'k', 'l'] // Keys needed to unlock
          }
        }
      },

      // Convert NPCs
      npcs: [
        // Map NPC objects from JSON
      ],

      // Convert events
      events: [
        // Map event objects from JSON
      ]
    };

    return new Zone(config);
  }

  static getConfig() {
    // Return the raw configuration for testing
  }
}
```

### Step 2: Key Conversion Rules

#### 🎯 Zone Coordinate System

**CRITICAL**: All coordinates in your JSON should be **zone-relative** (0-11 for X, 0-7 for Y):

```javascript
// ✅ CORRECT: Zone-relative coordinates (0-11)
"position": [3, 2]  // Will be automatically centered on screen

// ❌ WRONG: Don't use absolute screen coordinates
"position": [150, 200]  // System handles screen positioning
```

#### Tiles Conversion

The zone system automatically handles centering and water background:

```javascript
// Your JSON provides zone-relative positions
// Zone system automatically:
// 1. Creates full-screen water background
// 2. Centers your 12x8 zone area on screen
// 3. Converts zone-relative to absolute coordinates
// 4. Handles all screen sizes responsively
```

#### NPC Conversion

Convert JSON NPCs to Zone NPC format:

```javascript
// From JSON npc with zone-relative position [6, 3]
// System automatically converts to absolute screen position
// NPCs appear at correct location regardless of screen size
```

#### Events Conversion

Convert JSON events to Zone events:

```javascript
// Map trigger types: step_on_tile, collect_key, interact_npc
// Map action types: show_dialogue, unlock_gate, spawn_npc, transition_zone
// Handle conditions like required_keys
```

#### VIM Keys Extraction

Extract VIM keys from the tile legend:

```javascript
// Find legend entries that represent VIM keys (h, j, k, l, etc.)
// Create VIM key objects with descriptions
```

### Step 3: Create Comprehensive Tests

Create `tests/infrastructure/data/zones/[ZoneName]Zone.test.js`:

```javascript
import { [ZoneName]Zone } from '../../../../src/infrastructure/data/zones/[ZoneName]Zone.js';

describe('[ZoneName]Zone', () => {
  describe('Factory Creation', () => {
    // Test successful zone creation
    // Test configuration validation
    // Test immutability
  });

  describe('Zone Configuration', () => {
    // Test all configuration properties match JSON input
    // Test tile layout matches expected grid
    // Test NPCs are positioned correctly
    // Test events are configured properly
  });

  describe('Game Mechanics', () => {
    // Test VIM key collection
    // Test NPC interactions
    // Test event triggers
    // Test zone completion conditions
  });

  describe('Error Handling', () => {
    // Test edge cases and error scenarios
  });
});
```

### Step 4: Register the Zone

Update `src/infrastructure/data/zones/ZoneRegistry.js`:

```javascript
// Add import
import { [ZoneName]Zone } from './[ZoneName]Zone.js';

// Add to registry map in getZones()
['zone_X', [ZoneName]Zone],
```

### Step 5: Add Zone to Level Configuration

Update `src/application/LevelConfigurations.js` to include your new zone in a level:

```javascript
export const LEVEL_CONFIGURATIONS = {
  // Add your zone to an appropriate level (2-3 zones per level)
  level_2: {
    id: 'level_2',
    name: 'Text Manipulation',
    zones: ['zone_2', 'zone_3'], // Include your new zone here
    description: 'Master VIM modes and word navigation',
  },
  // ... other levels
};
```

**Zone Assignment Guidelines:**

- **Level 1**: `zone_1` (Blinking Grove) - VIM basics (h,j,k,l)
- **Level 2**: `zone_2`, `zone_3` - Text manipulation (i, ESC, modes, w, b, e)
- **Level 3**: `zone_4`, `zone_5`, `zone_6` - Advanced movement (f, t, /, ?, n, N)
- **Level 4**: `zone_7`, `zone_8` - Text operations (d, y, p, c, x)
- **Level 5**: `zone_9`, `zone_10` - Search & command (:, /, commands)

### Step 6: Testing Requirements

#### Test Categories (Aim for 25-35 tests total):

1. **Factory Tests** (8-12 tests)

   - Creation success
   - Configuration validation
   - Immutability preservation
   - Static method functionality

2. **Configuration Tests** (8-12 tests)

   - All properties correctly set
   - Tile layout accuracy
   - NPC positioning and dialogue
   - Event configuration completeness

3. **Game Mechanics Tests** (6-10 tests)

   - VIM key collection mechanics
   - NPC conditional visibility
   - Event triggering and actions
   - Zone completion detection
   - Custom cursor start position (if applicable)

4. **Error Handling Tests** (3-5 tests)
   - Invalid configurations
   - Missing required properties
   - Edge cases and boundaries

#### Test Patterns to Follow:

```javascript
// Use existing Zone test patterns
// Verify immutability with expect(zone.getConfig()).not.toBe(originalConfig)
// Test state changes with before/after comparisons
// Use descriptive test names that explain the scenario
// Test custom cursor start position if implemented
// Ensure zone works with LevelGameState (can create via ZoneProvider)
```

#### Multi-Zone Integration Testing:

Your zone should work seamlessly with the LevelGameState system:

```javascript
// Example integration test
test('should work with LevelGameState multi-zone system', () => {
  const zoneProvider = new ZoneRegistryAdapter();
  const levelConfig = {
    id: 'test_level',
    zones: ['zone_1', 'your_zone_id'],
    name: 'Test Level',
  };

  const levelState = new LevelGameState(zoneProvider, levelConfig);
  // Test zone progression, cursor reset, etc.
});
```

## Implementation Checklist

### Before Implementation:

- [ ] Analyze the JSON input structure
- [ ] Identify VIM keys in the tile legend
- [ ] Plan NPC interaction patterns
- [ ] Map event triggers to game mechanics

### During Implementation:

- [ ] Create zone factory with proper JSON mapping
- [ ] Implement comprehensive test suite
- [ ] Register zone in ZoneRegistry
- [ ] Add zone to appropriate level configuration
- [ ] Follow established code patterns and naming conventions

### After Implementation:

- [ ] Run all tests to ensure they pass (including LevelGameState tests)
- [ ] Verify zone can be created via registry
- [ ] Test zone integration with LevelGameState multi-zone system
- [ ] Verify zone works correctly in level progression
- [ ] Ensure no breaking changes to existing functionality

## Code Quality Standards

- Follow existing naming conventions
- Maintain immutability in all operations
- Provide comprehensive test coverage
- Use descriptive test names and clear assertions
- Handle edge cases and error scenarios
- Follow the hexagonal architecture patterns

## Success Criteria

- Zone factory creates functional zone from JSON input
- All tests pass (25-35 tests minimum)
- Zone is properly registered and accessible
- **Zone appears centered with water all around on any screen size**
- All coordinates are zone-relative and automatically converted
- Zone is added to appropriate level configuration (2-3 zones per level)
- Zone works correctly with LevelGameState multi-zone progression
- Game mechanics work as intended
- Code follows project standards and patterns
- No breaking changes to existing functionality

## 🌊 Visual Result

Your completed zone will look like this on any device:

```
┌─────────────────────────────────────┐ ← Full Screen
│ ∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼ │
│ ∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼ │ ← Water
│ ∼∼∼∼∼∼∼∼┌─YOUR ZONE─┐∼∼∼∼∼∼∼∼∼∼∼∼ │
│ ∼∼∼∼∼∼∼∼│ 12x8 Area │∼∼∼∼∼∼∼∼∼∼∼∼ │ ← Centered
│ ∼∼∼∼∼∼∼∼│ h j k l   │∼∼∼∼∼∼∼∼∼∼∼∼ │   Your Zone
│ ∼∼∼∼∼∼∼∼│ Keys+NPCs │∼∼∼∼∼∼∼∼∼∼∼∼ │
│ ∼∼∼∼∼∼∼∼└───────────┘∼∼∼∼∼∼∼∼∼∼∼∼ │
│ ∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼∼ │ ← Water
└─────────────────────────────────────┘
```

The next developer/LLM should be able to take your implementation and immediately use the new zone in the game without any additional setup or configuration.

## 📚 Additional Documentation

- **Multi-Zone Architecture**: `doc/MULTI_ZONE_ARCHITECTURE.md` - Comprehensive guide to the level system
- **Zone Centering System**: `doc/ZONE_CENTERING_SYSTEM.md` - Technical details on zone positioning
- **Zone Schema**: `doc/zone.schema.json` - JSON schema for zone configurations
