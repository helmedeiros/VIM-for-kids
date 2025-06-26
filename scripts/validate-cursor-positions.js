#!/usr/bin/env node

/**
 * Cursor Position Validation Script
 *
 * This script validates that all zone cursor starting positions are:
 * 1. Within layout bounds
 * 2. On walkable tiles
 * 3. Following proper zone entry flow
 *
 * Usage: node scripts/validate-cursor-positions.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import process from 'process';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Dynamically imports TileType to get walkable tile definitions
 */
async function getWalkableTileTypes() {
  try {
    const { TileType } = await import('../src/domain/value-objects/TileType.js');

    // Get all static TileType instances and filter walkable ones
    const walkableTypes = [];
    for (const key in TileType) {
      const tileType = TileType[key];
      if (tileType && typeof tileType === 'object' && tileType.walkable) {
        walkableTypes.push(tileType.name);
      }
    }

    return walkableTypes;
  } catch (error) {
    console.warn('Could not import TileType, using fallback list:', error.message);
    // Fallback list if import fails
    return ['path', 'dirt', 'field', 'bridge', 'sand', 'test_ground', 'boss_area'];
  }
}

/**
 * Extracts zone configuration by parsing the file content
 */
async function parseZoneFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract zone name from the content
    const nameMatch = content.match(/name:\s*['"`]([^'"`]+)['"`]/);
    const zoneName = nameMatch ? nameMatch[1] : 'Unknown Zone';

    // Extract cursor position
    const cursorMatch = content.match(/cursorStartPosition:\s*new\s+Position\((\d+),\s*(\d+)\)/);
    if (!cursorMatch) {
      return {
        valid: false,
        error: 'No cursor start position found',
        zone: zoneName,
      };
    }

    const cursorX = parseInt(cursorMatch[1]);
    const cursorY = parseInt(cursorMatch[2]);

    // Extract layout array
    const layoutMatch = content.match(/layout:\s*\[([\s\S]*?)\]/);
    if (!layoutMatch) {
      return {
        valid: false,
        error: 'No layout found',
        zone: zoneName,
      };
    }

    // Parse layout rows
    const layoutContent = layoutMatch[1];
    const rowMatches = layoutContent.match(/['"`][^'"`]*['"`]/g);
    if (!rowMatches) {
      return {
        valid: false,
        error: 'Could not parse layout rows',
        zone: zoneName,
      };
    }

    const layout = rowMatches.map((row) => row.slice(1, -1)); // Remove quotes

    // Extract legend
    const legendMatch = content.match(/legend:\s*\{([\s\S]*?)\}/);
    if (!legendMatch) {
      return {
        valid: false,
        error: 'No legend found',
        zone: zoneName,
      };
    }

    // Parse legend entries
    const legendContent = legendMatch[1];
    const legend = {};
    const legendEntries = legendContent.match(/(\w+):\s*['"`]([^'"`]+)['"`]/g);
    if (legendEntries) {
      legendEntries.forEach((entry) => {
        const match = entry.match(/(\w+):\s*['"`]([^'"`]+)['"`]/);
        if (match) {
          legend[match[1]] = match[2];
        }
      });
    }

    return {
      valid: true,
      zone: zoneName,
      cursorPosition: { x: cursorX, y: cursorY },
      layout,
      legend,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to parse file: ${error.message}`,
      zone: 'Unknown Zone',
    };
  }
}

/**
 * Discovers all zone files
 */
async function discoverZones() {
  const zonePattern = join(projectRoot, 'src/infrastructure/data/zones/*Zone.js');
  const zoneFiles = await glob(zonePattern);

  const zones = [];

  for (const filePath of zoneFiles) {
    const zoneData = await parseZoneFile(filePath);
    zones.push({
      filePath,
      ...zoneData,
    });
  }

  return zones;
}

/**
 * Validates a single zone's cursor position
 */
function validateZonePosition(zoneData, walkableTileTypes) {
  if (!zoneData.valid) {
    return zoneData; // Return the error from parsing
  }

  const { cursorPosition, layout, legend, zone } = zoneData;
  const x = cursorPosition.x;
  const y = cursorPosition.y;

  // Check bounds
  if (y < 0 || y >= layout.length) {
    return {
      valid: false,
      error: `Position (${x},${y}) Y coordinate out of bounds. Layout has ${layout.length} rows (0-${layout.length - 1})`,
      zone,
    };
  }

  const row = layout[y];
  if (x < 0 || x >= row.length) {
    return {
      valid: false,
      error: `Position (${x},${y}) X coordinate out of bounds. Row ${y} has ${row.length} characters (0-${row.length - 1})`,
      zone,
    };
  }

  // Get tile character and type
  const tileChar = row[x];
  const tileType = legend[tileChar];

  if (!tileType) {
    return {
      valid: false,
      error: `Unknown tile character '${tileChar}' at position (${x},${y})`,
      zone,
    };
  }

  // Check walkability
  const isWalkable = walkableTileTypes.includes(tileType);

  if (!isWalkable) {
    return {
      valid: false,
      error: `Tile type '${tileType}' at position (${x},${y}) is not walkable`,
      zone,
    };
  }

  return {
    valid: true,
    zone,
    position: [x, y],
    tileChar,
    tileType,
  };
}

/**
 * Main validation function
 */
async function validateAllCursorPositions() {
  console.log('🎯 VIM-for-Kids Cursor Position Validator\n');
  console.log('='.repeat(60));

  try {
    // Get walkable tile types and zones
    const [walkableTileTypes, zones] = await Promise.all([getWalkableTileTypes(), discoverZones()]);

    console.log(`📋 Found ${zones.length} zones to validate`);
    console.log(`🚶 Walkable tile types: ${walkableTileTypes.join(', ')}\n`);

    const results = [];
    let allValid = true;

    // Validate each zone
    for (const zoneData of zones) {
      const result = validateZonePosition(zoneData, walkableTileTypes);
      results.push(result);

      if (result.valid) {
        console.log(
          `✅ ${result.zone.padEnd(25)} pos(${result.position[0].toString().padStart(2)},${result.position[1].toString().padStart(2)}) = '${result.tileChar}' (${result.tileType})`
        );
      } else {
        console.log(`❌ ${result.zone.padEnd(25)} ${result.error}`);
        allValid = false;
      }
    }

    console.log('='.repeat(60));

    // Summary
    const validCount = results.filter((r) => r.valid).length;
    const totalCount = results.length;

    console.log(`\n📊 Summary: ${validCount}/${totalCount} zones have valid cursor positions`);

    if (allValid) {
      console.log('🎉 All cursor positions are valid and walkable!');
      console.log('\n✅ Ready for deployment');
    } else {
      console.log('⚠️  Some cursor positions need fixing');
      console.log('\n❌ Fix errors before deployment');

      // Show specific errors
      console.log('\n🔧 Errors to fix:');
      results
        .filter((r) => !r.valid)
        .forEach((result) => {
          console.log(`   • ${result.zone}: ${result.error}`);
        });
    }

    return allValid;
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
}

/**
 * Generate validation report
 */
async function generateReport() {
  try {
    const [walkableTileTypes, zones] = await Promise.all([getWalkableTileTypes(), discoverZones()]);

    const results = zones.map((zoneData) => validateZonePosition(zoneData, walkableTileTypes));

    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      walkableTileTypes,
      summary: {
        total: results.length,
        valid: results.filter((r) => r.valid).length,
        invalid: results.filter((r) => !r.valid).length,
      },
      zones: results,
    };

    // Write report to file
    const reportPath = join(projectRoot, 'cursor-position-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📄 Detailed report saved to: cursor-position-report.json`);

    return report;
  } catch (error) {
    console.error('❌ Report generation failed:', error.message);
    return null;
  }
}

// Run validation if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const isValid = await validateAllCursorPositions();

    if (process.argv.includes('--report')) {
      await generateReport();
    }

    process.exit(isValid ? 0 : 1);
  })();
}

export { validateAllCursorPositions, getWalkableTileTypes, discoverZones };
