# Cursor Start Position Guide

## Overview

This guide explains how to set proper and efficient cursor starting positions for zones in VIM-for-Kids. The cursor start position is critical for user experience, camera centering, and gameplay flow.

## 🎯 Key Principles

### 1. **Walkability First**

The cursor MUST start on a walkable tile. Use `TileType.js` to verify walkability:

**Walkable Tiles:**

- `PATH` (P) - Primary walkable surface
- `DIRT` (D) - Secondary walkable surface
- `FIELD` (F) - Grass field areas
- `BRIDGE` (B) - Crosses water/gaps
- `SAND` (S) - Desert/canyon areas
- `TEST_GROUND` (T) - Practice areas
- `BOSS_AREA` - Special combat zones

**Non-Walkable Tiles:**

- `WATER` (W) - Impassable liquid
- `WALL` (M) - Solid barriers
- `TREE` (T) - Forest obstacles
- `STONE` (S) - Rock formations
- `RUINS` (R) - Ancient structures

### 2. **Zone Entry Logic**

Position the cursor at the **beginning of the zone's content** where exploration should start:

```javascript
// ✅ CORRECT: At the start of the zone's playable area
cursorStartPosition: new Position(1, 1),  // Left edge of content

// ❌ WRONG: In the middle or at random positions
cursorStartPosition: new Position(25, 15), // Middle of zone
```

### 3. **Camera Centering**

The camera system will automatically center the cursor on screen when the level starts, so position the cursor where you want the **center of the visible area** to be.

## 📐 Setting Cursor Positions

### Step 1: Analyze Your Zone Layout

```javascript
layout: [
  'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW', // Row 0
  'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW', // Row 1
  // ... more rows
],
legend: {
  W: 'water',    // ❌ Not walkable
  P: 'path',     // ✅ Walkable
}
```

### Step 2: Find Entry Point

Look for the logical entry point from the previous zone:

```javascript
// Zone flows: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

// Zone 3 (SwampOfWords) - Entry from Zone 2 (right side)
cursorStartPosition: new Position(47, 0), // Right edge path

// Zone 4 (DeleteCanyon) - Entry from Zone 3 (bottom)
cursorStartPosition: new Position(0, 31), // Bottom-left path

// Zone 5 (FieldOfInsertion) - Entry from Zone 4 (bottom-right)
cursorStartPosition: new Position(49, 31), // Bottom-right path
```

### Step 3: Verify Walkability

```javascript
// Check the character at your chosen position
const layout = 'WWWWWWWWWWWWWWWWWWWWWWWWWPWWWWWWWWWWWWWWWWWWWWWWWWW';
const x = 25,
  y = 0;
const tileChar = layout[x]; // Should be 'P' (path)
const tileType = legend[tileChar]; // Should be 'path'
```

### Step 4: Test In-Game

1. Start the zone
2. Verify cursor appears on walkable tile
3. Check that zone content is properly centered
4. Ensure smooth entry flow from previous zone

## 🛠️ Implementation Examples

### Basic Zone Setup

```javascript
export class MyZone {
  static create() {
    const config = {
      zoneId: 'zone_x',
      name: 'X. My Zone',

      // Step 1: Set cursor start position
      cursorStartPosition: new Position(x, y),

      tiles: {
        layout: [
          // Your zone layout here
        ],
        legend: {
          // Your tile mappings here
        },
      },
    };

    return new Zone(config);
  }
}
```

### Validation Script

The project includes an automated validation script that follows SOLID principles:

```bash
# Quick validation check
npm run validate:cursors

# Generate detailed JSON report
npm run validate:cursors:report
```

**Key Features:**

- **Single Responsibility**: Each function has one clear purpose
- **Open/Closed**: Easily extensible for new tile types or zones
- **Dependency Inversion**: Dynamically imports TileType definitions
- **No Hardcoded Data**: Discovers zones and walkable tiles automatically
- **File-based Parsing**: Reads zone files directly, no runtime dependencies

## 🎮 Zone-Specific Guidelines

### Forest Zones (BlinkingGrove)

- Start at left edge of path
- Position: `(1, 1)` for tree-bordered areas
- Ensure path extends right for exploration

### Water Zones (SwampOfWords, SearchSprings)

- Use bridge (`B`) or path (`P`) tiles only
- Never place on water (`W`) tiles
- Consider entry flow from previous zone

### Desert Zones (DeleteCanyon)

- Sand (`S`) and path (`P`) are walkable
- Position at natural entry points
- Account for canyon geography

### Field Zones (FieldOfInsertion)

- Field (`F`) tiles are walkable
- Start at field edges for natural flow
- Consider agricultural layout patterns

### Temple/Ruin Zones (SyntaxTemple, CommandCavern)

- Path (`P`) tiles through ruins
- Avoid ruin (`R`) tiles (not walkable)
- Position at temple entrances

### Practice Zones (PlaygroundOfPractice)

- Test ground (`T`) tiles are walkable
- Center for sandbox-style exploration
- Multiple entry points acceptable

## ⚠️ Common Mistakes

### 1. Out of Bounds Position

```javascript
// ❌ WRONG: Position beyond layout dimensions
layout: 'PPPPPPPPPPPPPP', // Only 14 characters (0-13)
cursorStartPosition: new Position(15, 0), // Position 15 doesn't exist
```

### 2. Non-Walkable Tile

```javascript
// ❌ WRONG: Cursor on water tile
layout: 'WWWWWWWWWWWWWW',
cursorStartPosition: new Position(5, 0), // Position 5 is 'W' (water)
```

### 3. Poor Zone Flow

```javascript
// ❌ WRONG: Cursor in middle, breaking entry narrative
cursorStartPosition: new Position(25, 15), // Middle of 50x32 zone
// Should be at entry point from previous zone
```

## 🧪 Testing Checklist

- [ ] Cursor starts on walkable tile
- [ ] Position is within layout bounds
- [ ] Camera centers properly on level start
- [ ] Zone content is visible and accessible
- [ ] Entry flow from previous zone makes sense
- [ ] All unit tests pass
- [ ] Integration tests verify movement

## 📊 Current Zone Status

| Zone             | Position | Tile | Status | Entry From |
| ---------------- | -------- | ---- | ------ | ---------- |
| BlinkingGrove    | (1,1)    | Path | ✅     | Start      |
| MazeOfModes      | (0,5)    | Path | ✅     | Zone 1     |
| SwampOfWords     | (47,0)   | Path | ✅     | Zone 2     |
| DeleteCanyon     | (0,31)   | Path | ✅     | Zone 3     |
| FieldOfInsertion | (49,31)  | Path | ✅     | Zone 4     |
| CopyCircle       | (25,0)   | Path | ✅     | Zone 5     |
| SearchSprings    | (25,31)  | Path | ✅     | Zone 6     |
| CommandCavern    | (25,0)   | Path | ✅     | Zone 7     |
| Playground       | (24,31)  | Path | ✅     | Zone 8     |
| SyntaxTemple     | (25,0)   | Path | ✅     | Zone 9     |

## 🔄 Maintenance

When modifying zones:

1. **Always verify walkability** after layout changes
2. **Run the validation script** before committing
3. **Test in-game** to ensure proper camera centering
4. **Update this guide** if new tile types are added
5. **Maintain zone flow** narrative consistency

---

_Last updated: After cursor position walkability fixes_
_All zones verified: ✅ 10/10 zones have walkable start positions_
