# Zone Refactoring Guide

## Problem

All zone files have duplication between `create()` and `getConfig()` methods. The `getConfig()` method returns exactly the same metadata that's already defined in the `create()` method.

## Solution Pattern

Extract the shared configuration into a private static method `_getSharedConfig()` and use it in both methods.

## Refactoring Steps

### Before (Duplicated Code)

```javascript
export class ExampleZone {
  static create() {
    const config = {
      zoneId: 'zone_x',
      name: 'X. Example Zone',
      biome: 'Example biome',
      skillFocus: ['skill1', 'skill2'],
      puzzleTheme: 'Example theme',
      narration: ['Example narration line 1...', 'Example narration line 2...'],

      // Zone-specific implementation details
      cursorStartPosition: new Position(0, 0),
      tiles: {
        /* complex tile data */
      },
      npcs: [
        /* NPC definitions */
      ],
      events: [
        /* event definitions */
      ],
    };

    return new Zone(config);
  }

  static getConfig() {
    return {
      zoneId: 'zone_x', // DUPLICATED
      name: 'X. Example Zone', // DUPLICATED
      biome: 'Example biome', // DUPLICATED
      skillFocus: ['skill1', 'skill2'], // DUPLICATED
      puzzleTheme: 'Example theme', // DUPLICATED
      narration: [
        // DUPLICATED
        'Example narration line 1...', // DUPLICATED
        'Example narration line 2...', // DUPLICATED
      ], // DUPLICATED
    };
  }
}
```

### After (Refactored)

```javascript
export class ExampleZone {
  /**
   * Get the shared configuration metadata for this zone
   * @private
   */
  static _getSharedConfig() {
    return {
      zoneId: 'zone_x',
      name: 'X. Example Zone',
      biome: 'Example biome',
      skillFocus: ['skill1', 'skill2'],
      puzzleTheme: 'Example theme',
      narration: ['Example narration line 1...', 'Example narration line 2...'],
    };
  }

  static create() {
    const config = {
      ...this._getSharedConfig(),

      // Zone-specific implementation details
      cursorStartPosition: new Position(0, 0),
      tiles: {
        /* complex tile data */
      },
      npcs: [
        /* NPC definitions */
      ],
      events: [
        /* event definitions */
      ],
    };

    return new Zone(config);
  }

  /**
   * Get the complete zone configuration (for compatibility with tests and external systems)
   * @private
   */
  static _getCompleteConfig() {
    return {
      ...this._getSharedConfig(),

      // Zone-specific implementation details
      cursorStartPosition: new Position(0, 0),
      tiles: {
        /* complex tile data */
      },
      npcs: [
        /* NPC definitions */
      ],
      events: [
        /* event definitions */
      ],
    };
  }

  static create() {
    const config = this._getCompleteConfig();
    return new Zone(config);
  }

  static getConfig() {
    return this._getCompleteConfig();
  }
}
```

## Benefits

1. **Eliminates duplication** - Shared config is defined once
2. **Single source of truth** - Changes to metadata only need to be made in one place
3. **Reduces maintenance burden** - No risk of config drift between methods
4. **Cleaner code** - Clear separation between metadata and implementation details

## Status

- ✅ **MazeOfModesZone** - Refactored
- ✅ **SwampOfWordsZone** - Refactored
- ✅ **BlinkingGroveZone** - Refactored
- ✅ **DeleteCanyonZone** - Refactored
- ✅ **FieldOfInsertionZone** - Refactored
- ✅ **CopyCircleZone** - Refactored
- ✅ **SearchSpringsZone** - Refactored
- ✅ **CommandCavernZone** - Refactored
- ✅ **PlaygroundOfPracticeZone** - Refactored
- ✅ **SyntaxTempleZone** - Refactored
- ✅ **TextlandExplorationZone** - Refactored

**🎉 ALL ZONES REFACTORED! 🎉**

## Manual Refactoring Process

For each zone file:

1. **Extract shared config**: Copy the metadata fields from `getConfig()` method
2. **Create `_getSharedConfig()` method**: Add the private static method with the shared config
3. **Update `create()` method**: Replace the duplicated fields with `...this._getSharedConfig(),`
4. **Update `getConfig()` method**: Replace the return object with `return this._getSharedConfig();`
5. **Test**: Run tests to ensure functionality is preserved

## Automated Approach

A refactoring script has been created at `scripts/refactor-zones.js` but manual refactoring is recommended for better control and understanding of the changes.
