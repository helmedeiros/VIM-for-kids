# Maze Tile Generation Prompt for LLMs

This document guides a Large Language Model (LLM) to generate maze-based tile layouts for each VIM-for-Kids adventure game zone.

## 🎯 Goal

Create a `tiles.layout` of size **50x32** to visually and logically represent each learning zone. Each layout is a rectangular maze that reflects the zone’s **biome**, **VIM learning theme**, and ensures **narrative continuity** across all levels.

Refer to: [VIM_Storytelling_Zones.md] for biome, skill, and story details.

## 📐 Tile Format

Each zone outputs:

```json
{
  "tiles": {
    "layout": [
      "MMMMMPPPPMMPPMMPPMMPPMMPPMPPPMMMPPPPMPPMPPMMPPMMP",
      ...
    ],
    "legend": {
      "M": "wall",
      "P": "path",
      "K": "vim_key_spot",
      "G": "gate",
      "N": "npc_spot",
      "B": "bridge",
      "W": "water",
      "S": "sand",
      "R": "ruins"
    }
  }
}
```

## 🧩 Rules for the Maze Layout

### Dimensions

- Must be exactly `50x32` (50 columns x 32 rows)

### Connectivity

- Each maze starts at the **gate position from the previous zone**
- It ends at a **new gate**, which will be the start of the next zone
- Use `"G"` tiles for gates, ideally placed at opposite map ends

### Maze Design

- Majority walls (`M`) with **tight paths** (`P`)
- One or more **collectibles or interactions**:
  - Vim Keys (`K`) scattered on main/side paths
  - NPCs (`N`) positioned near story checkpoints

### Biome-Influenced Tiles

- Swamp: `W` water, `B` bridge
- Canyon: `S` sand
- Temple: `R` ruins
- Forest: mostly `M`, `P`, and `N`
- Spring: `W`, `B`, maybe `N`

### Design Spirit

- Each zone should feel different, with the layout **reflecting the biome and puzzle feel**
- Avoid randomness—structure must feel like an **intentional VIM learning journey**
- At least one **solvable path** from start to gate

## 🧠 Reference Story

Use the [VIM_Storytelling_Zones.md] file as narrative context to help place:

- Where the maze starts and ends
- What characters say
- What VIM keys are introduced
- What lesson each maze teaches

---

Designed for VIM-for-Kids (2025)
