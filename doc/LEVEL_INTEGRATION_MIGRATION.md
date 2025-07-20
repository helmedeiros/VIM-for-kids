# Level Integration Migration

## Overview

This document describes the migration of level configurations from the separate `LevelConfigurations.js` system to being integrated directly into the Game entity system.

## What Changed

### Before

- Level configurations were stored in `src/application/LevelConfigurations.js`
- All games shared the same level structure
- Level logic was scattered across multiple files
- Hard-coded level data not tied to specific games

### After

- Level configurations are now part of the Game entity (`src/domain/entities/Game.js`)
- Each game can have its own unique level structure
- Level management is centralized through the `LevelService` (`src/application/services/LevelService.js`)
- Games are self-contained with their own level data

## Key Changes

### 1. Game Entity Enhancement

The `Game` entity now includes:

- `levels` property containing level configurations
- Level management methods:
  - `getLevelConfiguration(levelId)`
  - `getAllLevelConfigurations()`
  - `getFirstLevel()`
  - `getNextLevel(currentLevelId)`
  - `levelHasZone(levelId, zoneId)`
  - `getLevelZones(levelId)`
  - `getTotalLevelCount()`

### 2. GameRegistry Integration

The `GameRegistry` now contains the level data for each game:

```javascript
{
  id: 'cursor-before-clickers',
  // ... other properties
  levels: {
    level_1: {
      id: 'level_1',
      name: 'VIM Basics',
      zones: ['zone_1'],
      description: 'Learn fundamental VIM movement commands in the Blinking Grove',
    },
    // ... more levels
  }
}
```

### 3. New LevelService

Created `src/application/services/LevelService.js` that provides:

- Game-aware level management
- Same API as old LevelConfigurations but with gameId parameter
- Better error handling and validation

### 4. Updated Dependencies

- `PersistenceService`: Updated to use fallback values instead of LevelConfigurations
- Tests: Added comprehensive tests for level management

## Migration Benefits

1. **Better Architecture**: Levels belong to games, not global system
2. **Game-Specific Levels**: Each game can have unique level structures
3. **Centralized Management**: All game data in one place
4. **Better Testing**: More focused and comprehensive tests
5. **Easier Maintenance**: Single source of truth for game configuration

## Backward Compatibility

The old `LevelConfigurations.js` functions are replaced by:

- `getLevelConfiguration(levelId)` → `levelService.getLevelConfiguration(gameId, levelId)`
- `getFirstLevel()` → `levelService.getFirstLevel(gameId)`
- `getNextLevel(currentLevelId)` → `levelService.getNextLevel(gameId, currentLevelId)`
- etc.

## Files Affected

### New Files

- `src/application/services/LevelService.js`
- `tests/application/services/LevelService.test.js`

### Modified Files

- `src/domain/entities/Game.js` - Added level management
- `src/infrastructure/data/GameRegistry.js` - Added level data
- `src/application/services/PersistenceService.js` - Removed LevelConfigurations dependency
- `tests/domain/entities/Game.test.js` - Added level management tests

### Removed Files

- `src/application/LevelConfigurations.js` - ✅ Removed (functionality moved to Game entity)
- `src/domain/entities/GameDefinition.js` - ✅ Removed (unified into Game entity)
- `tests/application/LevelConfigurations.test.js` - ✅ Removed
- `tests/domain/entities/GameDefinition.test.js` - ✅ Removed

## Usage Examples

### Old Way

```javascript
import { getLevelConfiguration, getFirstLevel } from '../LevelConfigurations.js';

const level = getLevelConfiguration('level_1');
const firstLevel = getFirstLevel();
```

### New Way

```javascript
import { LevelService } from '../services/LevelService.js';
import { GameRegistry } from '../../infrastructure/data/GameRegistry.js';

const levelService = new LevelService(GameRegistry);
const level = levelService.getLevelConfiguration('cursor-before-clickers', 'level_1');
const firstLevel = levelService.getFirstLevel('cursor-before-clickers');
```

## Testing

- All 923 tests pass
- Added 27 new level management tests for Game entity
- Removed 23 tests from old LevelConfigurations system
- Removed 25 tests from old GameDefinition entity
- Comprehensive coverage of level functionality
- Both unit and integration tests included

## Entity Cleanup Summary

Successfully unified the game entity system:

### ✅ **REMOVED** - GameDefinition.js

- **Reason**: Completely redundant with Game.js
- **Migration**: All functionality moved to Game entity
- **Impact**: No breaking changes, cleaner architecture

### ⚠️ **KEPT** - GameDescriptor.js

- **Reason**: Still used by port interfaces and some components
- **Status**: GameProviderAdapter creates GameDescriptor instances from Game entities
- **Future**: Could potentially be removed if all consumers migrate to using Game.toDescriptor() plain objects

### ✅ **ENHANCED** - Game.js

- **Status**: Now the single, unified game entity
- **Features**: Contains all GameDefinition functionality + level management
- **Role**: Single source of truth for all game configuration
