# VIM for Kids - Hexagonal Architecture

## Overview

The VIM for Kids game has been refactored from a monolithic design to use **Hexagonal Architecture** (also known as Ports and Adapters). This architectural pattern separates the business logic from external concerns, making the code more maintainable, testable, and flexible.

## Architecture Layers

### 🎯 Domain Layer (`src/domain/`)

Contains the core business logic and rules of the game, with no dependencies on external frameworks or UI.

#### Entities (`src/domain/entities/`)

- **`Player.js`** - Represents the player character with position and movement logic
- **`VimKey.js`** - Represents collectible VIM keys with their commands
- **`GameMap.js`** - Represents the game world with tiles and navigation rules

#### Value Objects (`src/domain/value-objects/`)

- **`Position.js`** - Immutable coordinate representation with movement methods
- **`TileType.js`** - Enum-like representation of different tile types (grass, water, dirt, tree)

### 🚀 Application Layer (`src/application/`)

Orchestrates domain objects and implements use cases.

#### Use Cases (`src/application/use-cases/`)

- **`MovePlayerUseCase.js`** - Handles player movement logic and key collection

#### State Management

- **`GameState.js`** - Manages the overall game state and coordinates between entities

### 🔌 Ports (`src/ports/`)

Define interfaces (contracts) that external adapters must implement.

#### Input Ports (`src/ports/input/`)

- **`InputHandler.js`** - Interface for handling user input

#### Output Ports (`src/ports/output/`)

- **`GameRenderer.js`** - Interface for rendering game state to UI

### 🏗️ Infrastructure Layer (`src/infrastructure/`)

Implements the ports with concrete technologies (DOM, keyboard, etc.).

#### UI Adapters (`src/infrastructure/ui/`)

- **`DOMGameRenderer.js`** - Implements GameRenderer using DOM manipulation

#### Input Adapters (`src/infrastructure/input/`)

- **`KeyboardInputHandler.js`** - Implements InputHandler for keyboard events

## Benefits of This Architecture

### ✅ Separation of Concerns

- **Domain logic** is isolated from UI and input handling
- **Business rules** are independent of technology choices
- **UI rendering** can be swapped without affecting game logic

### ✅ Testability

- Domain entities can be tested in isolation
- Use cases can be tested without UI dependencies
- Mock implementations can replace external adapters

### ✅ Flexibility

- Easy to add new input methods (touch, gamepad, AI)
- Easy to add new renderers (Canvas, WebGL, Terminal)
- Easy to extend with new game features

### ✅ Maintainability

- Clear boundaries between different concerns
- Dependencies flow inward (infrastructure → application → domain)
- Single responsibility for each class

## Dependency Flow

```
Infrastructure → Application → Domain
     ↓              ↓           ↓
  UI/Input    →  Use Cases  →  Entities
```

**Key Rule**: Dependencies always point inward. The domain layer has no dependencies on outer layers.

## Comparison: Before vs After

### Before (Monolithic)

```javascript
class VimForKidsGame {
  // Mixed concerns:
  constructor() {
    this.gameBoard = document.getElementById("gameBoard"); // UI
    this.player = { x: 5, y: 2 }; // Domain
    this.setupEventListeners(); // Input
  }

  movePlayer(newX, newY) {
    // Business logic mixed with UI
    if (targetTile === "water") return; // Domain rule
    this.renderGame(); // UI concern
  }
}
```

### After (Hexagonal)

```javascript
// Domain - Pure business logic
class Player {
  moveTo(newPosition) {
    /* ... */
  }
}

// Application - Coordinates domain objects
class MovePlayerUseCase {
  execute(direction) {
    /* ... */
  }
}

// Infrastructure - Technology-specific implementations
class DOMGameRenderer extends GameRenderer {
  render(gameState) {
    /* ... */
  }
}
```

## File Structure

```
src/
├── domain/                          # Core business logic
│   ├── entities/
│   │   ├── Player.js               # Player entity
│   │   ├── VimKey.js               # Collectible key entity
│   │   └── GameMap.js              # Game world entity
│   └── value-objects/
│       ├── Position.js             # Immutable position
│       └── TileType.js             # Tile type enumeration
├── application/                     # Use cases & coordination
│   ├── GameState.js                # Game state management
│   └── use-cases/
│       └── MovePlayerUseCase.js    # Player movement use case
├── ports/                          # Interfaces/Contracts
│   ├── input/
│   │   └── InputHandler.js         # Input handling interface
│   └── output/
│       └── GameRenderer.js         # Rendering interface
├── infrastructure/                 # External adapters
│   ├── ui/
│   │   └── DOMGameRenderer.js      # DOM rendering implementation
│   └── input/
│       └── KeyboardInputHandler.js # Keyboard input implementation
├── VimForKidsGame.js               # Main orchestrator
└── main.js                         # Entry point
```

## Usage Example

```javascript
// Create the game (all dependencies are injected automatically)
const game = new VimForKidsGame();

// The game coordinates all layers:
// 1. KeyboardInputHandler captures input
// 2. MovePlayerUseCase processes the movement
// 3. Domain entities handle business rules
// 4. DOMGameRenderer updates the UI
```

## Testing Strategy

```javascript
// Test domain logic in isolation
const player = new Player(new Position(5, 2));
const newPlayer = player.moveTo(new Position(6, 2));
assert(newPlayer.position.equals(new Position(6, 2)));

// Test use cases with mock dependencies
const mockRenderer = new MockGameRenderer();
const useCase = new MovePlayerUseCase(gameState, mockRenderer);
useCase.execute("right");
assert(mockRenderer.renderCalled);
```

## Future Extensions

This architecture makes it easy to add:

- **New input methods**: TouchInputHandler, GamepadInputHandler
- **New renderers**: CanvasGameRenderer, TerminalGameRenderer
- **New features**: SaveGameUseCase, MultiplayerGameState
- **Analytics**: GameAnalyticsPort with various implementations
- **AI players**: AIInputHandler that implements InputHandler

The core domain logic remains unchanged regardless of these extensions.
