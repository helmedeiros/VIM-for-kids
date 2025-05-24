# VIM for Kids - Development Guide

## Overview

This project uses a modern JavaScript development stack with hexagonal architecture. The build system is powered by Vite, testing by Jest, and follows ES6 module standards.

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

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

## Development Scripts

### Core Commands

- **`npm run dev`** - Start Vite development server on port 3000
- **`npm run build`** - Build optimized production bundle
- **`npm run preview`** - Preview production build locally
- **`npm test`** - Run test suite once
- **`npm run test:watch`** - Run tests in watch mode
- **`npm run test:coverage`** - Run tests with coverage report

### Code Quality

- **`npm run lint`** - Run ESLint on source files
- **`npm run lint:fix`** - Auto-fix ESLint issues
- **`npm run format`** - Format code with Prettier

### Utilities

- **`npm run clean`** - Remove build artifacts and coverage reports
- **`npm run serve`** - Simple HTTP server for testing builds

## Architecture Overview

The project follows hexagonal architecture with clear separation of concerns:

```
src/
├── domain/           # Business logic (entities, value objects)
├── application/      # Use cases and application state
├── infrastructure/   # External adapters (UI, input)
├── ports/           # Interfaces/contracts
└── main.js          # Application entry point
```

### Layer Dependencies

- **Domain**: No external dependencies (pure business logic)
- **Application**: Depends only on Domain
- **Infrastructure**: Implements Ports, uses Application layer
- **Ports**: Define interfaces between layers

## Testing Strategy

### Test Structure

```
tests/
├── domain/           # Unit tests for domain logic
├── application/      # Unit tests for use cases
├── infrastructure/   # Unit tests for adapters
├── integration/      # Integration tests
└── setup.js         # Global test configuration
```

### Coverage Targets

- **Statements**: 80%+ (currently 92.35%)
- **Branches**: 80%+ (currently 89.65%)
- **Functions**: 80%+ (currently 86.44%)
- **Lines**: 80%+ (currently 92.02%)

### Test Types

1. **Unit Tests**: Test individual classes/functions in isolation
2. **Integration Tests**: Test complete game functionality
3. **Custom Matchers**: Domain-specific assertions (e.g., `toHavePosition`)

## Build System

### Vite Configuration

The build system uses Vite for:

- Fast development server with HMR
- Optimized production builds
- Code splitting by architecture layers
- ES6 module support
- Terser minification

### Build Outputs

Production builds create optimized chunks:

- `domain-*.js` - Domain layer (entities, value objects)
- `application-*.js` - Application layer (use cases, state)
- `infrastructure-*.js` - Infrastructure layer (UI, input)
- `main-*.js` - Application orchestration

## Development Workflow

### 1. Feature Development

```bash
# Start development server
npm run dev

# Run tests in watch mode (separate terminal)
npm run test:watch

# Make changes and see live updates
# Tests run automatically on file changes
```

### 2. Code Quality Checks

```bash
# Before committing
npm run lint
npm run format
npm run test:coverage
```

### 3. Production Build

```bash
# Clean previous builds
npm run clean

# Create production build
npm run build

# Test production build
npm run preview
```

## Testing Best Practices

### Writing Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Descriptive Names**: Test names should explain the scenario
3. **Test Behavior, Not Implementation**: Focus on what, not how
4. **Mock External Dependencies**: Keep tests isolated

### Example Test Structure

```javascript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition is met', () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = component.methodName(input);

      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Custom Matchers

The project includes custom Jest matchers:

- `toBeValidPosition(received)` - Validates Position objects
- `toHavePosition(received, x, y)` - Checks position coordinates

## Code Style

### ESLint Rules

- No console statements (warnings)
- No unused variables (errors)
- Prefer const over let/var
- ES6+ syntax required

### Prettier Configuration

- Single quotes
- Semicolons required
- 100 character line width
- 2-space indentation

## Performance Considerations

### Development

- Vite provides instant HMR for fast development
- ES6 modules enable tree-shaking
- Source maps for debugging

### Production

- Code splitting reduces initial bundle size
- Terser minification for smaller files
- Gzip compression in build output

## Debugging

### Development Debugging

1. Use browser DevTools with source maps
2. Console logging (remove before commit)
3. Jest debugger for test debugging

### Test Debugging

```bash
# Debug specific test file
npm test -- --testNamePattern="test name"

# Run tests with verbose output
npm test -- --verbose

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Continuous Integration

The project is configured for CI/CD with:

- Automated testing on all commits
- Coverage reporting
- Build verification
- Code quality checks

### CI Commands

```bash
# Full CI pipeline
npm ci                    # Clean install
npm run lint             # Code quality
npm run test:coverage    # Tests with coverage
npm run build           # Production build
```

## Troubleshooting

### Common Issues

1. **Module Resolution Errors**

   - Check import paths are correct
   - Ensure ES6 module syntax

2. **Test Failures**

   - Check Jest configuration in package.json
   - Verify Babel setup for ES6 modules

3. **Build Errors**
   - Ensure all dependencies are installed
   - Check Vite configuration

### Getting Help

1. Check this documentation
2. Review test examples for patterns
3. Examine existing code for architecture patterns
4. Check console for detailed error messages

## Future Enhancements

### Planned Improvements

1. **Testing**

   - E2E tests with Playwright
   - Visual regression testing
   - Performance testing

2. **Build System**

   - Bundle analysis tools
   - Progressive Web App features
   - Service worker caching

3. **Development Experience**
   - TypeScript migration
   - Hot module replacement for styles
   - Automated dependency updates

This development environment provides a solid foundation for building, testing, and maintaining the VIM for Kids educational game with modern JavaScript best practices.
