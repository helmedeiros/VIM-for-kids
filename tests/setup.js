// Global test setup for Jest
// Note: jest-environment-jsdom is configured in package.json

// Mock DOM elements that might be missing in test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock alert for UI tests
global.alert = jest.fn();

// Setup DOM structure for tests
beforeEach(() => {
  // Reset DOM
  document.body.innerHTML = '';

  // Clear all mocks
  jest.clearAllMocks();

  // Create basic game structure
  document.body.innerHTML = `
    <div class="game-container">
      <div class="game-board" id="gameBoard"></div>
      <div class="collected-keys" id="collectedKeys">
        <div class="key-display"></div>
      </div>
    </div>
  `;
});

// Custom matchers
expect.extend({
  toBeValidPosition(received) {
    const pass = received &&
                 typeof received.x === 'number' &&
                 typeof received.y === 'number' &&
                 Number.isInteger(received.x) &&
                 Number.isInteger(received.y);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid position`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid position with integer x and y coordinates`,
        pass: false,
      };
    }
  },

  toHavePosition(received, x, y) {
    const pass = received && received.x === x && received.y === y;

    if (pass) {
      return {
        message: () => `expected ${received} not to have position (${x}, ${y})`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have position (${x}, ${y}) but was (${received?.x}, ${received?.y})`,
        pass: false,
      };
    }
  }
});
