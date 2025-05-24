# VIM for Kids

An educational game to teach children VIM movement commands (h, j, k, l) through interactive gameplay.

## Development Stages

This project was built incrementally with proper testing for each stage:

### Stage 1: Basic Structure ✓

- HTML foundation with game container
- CSS styling for terminal-like appearance
- JavaScript class structure with basic grid rendering
- Test suite implementation

### Stage 2: Tile Types and Map Creation ✓

- Different tile types (water, grass, dirt, tree)
- Map generation with water borders
- Dirt path creation for player movement
- Enhanced CSS styling for visual tile differentiation

### Stage 3: Player Character and Basic Movement ✓

- Player character with visual representation (●)
- Arrow key movement system
- Collision detection with boundaries and obstacles
- Event handling and game board focus management

### Stage 4: VIM-style Navigation (hjkl keys) ✓

- VIM movement keys: h (left), j (down), k (up), l (right)
- Backward compatibility with arrow keys
- Educational foundation for VIM editor learning
- Case-insensitive key handling

### Stage 5: Collectible Keys and Game Logic ✓

- Collectible VIM keys placed on the game map
- Key collection system with educational feedback
- UI display for collected keys progress
- Interactive learning through gameplay mechanics

### Stage 6: UI Enhancements and Instructions ✓

- Game board focus management with visual feedback
- Warning message for VIM extension conflicts
- Responsive design for mobile devices
- Animated player and key elements for visual appeal

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Documentation

Comprehensive documentation is available in the `doc/` folder:

- **[Development Guide](doc/DEVELOPMENT.md)** - Complete setup, workflow, and best practices
- **[Architecture Overview](doc/ARCHITECTURE.md)** - Hexagonal architecture explanation
- **[Build System Summary](doc/BUILD_SYSTEM_SUMMARY.md)** - Implementation details and metrics
- **[Refactoring Summary](doc/REFACTORING_SUMMARY.md)** - Evolution from monolithic to hexagonal architecture

## Technologies Used

- **Build System**: Vite with Hot Module Replacement
- **Testing**: Jest with 92%+ coverage, JSDOM environment
- **Code Quality**: ESLint, Prettier, Babel
- **Architecture**: Hexagonal (Ports & Adapters) pattern
- **Modules**: ES6+ with clean separation of concerns
