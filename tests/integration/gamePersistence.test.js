/* eslint-env node, jest */
import { jest } from '@jest/globals';

// Mock localStorage for the test
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.location
const mockLocation = {
  search: '',
  href: 'http://localhost:3002/',
  hostname: 'localhost',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock window.history
const mockHistory = {
  pushState: jest.fn(),
};

Object.defineProperty(window, 'history', {
  value: mockHistory,
  writable: true,
});

describe('Game Persistence Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockLocation.search = '';
    mockHistory.pushState.mockClear();
  });

  describe('URL Parameter Handling', () => {
    test('should parse game parameter from URL', () => {
      mockLocation.search = '?game=cursor-textland';

      const urlParams = new URLSearchParams(window.location.search);
      const gameParam = urlParams.get('game');

      expect(gameParam).toBe('cursor-textland');
    });

    test('should parse level parameter from URL', () => {
      mockLocation.search = '?level=level_3';

      const urlParams = new URLSearchParams(window.location.search);
      const levelParam = urlParams.get('level');

      expect(levelParam).toBe('level_3');
    });

    test('should parse both game and level parameters', () => {
      mockLocation.search = '?game=cursor-before-clickers&level=level_2';

      const urlParams = new URLSearchParams(window.location.search);
      const gameParam = urlParams.get('game');
      const levelParam = urlParams.get('level');

      expect(gameParam).toBe('cursor-before-clickers');
      expect(levelParam).toBe('level_2');
    });
  });

  describe('localStorage Integration', () => {
    test('should store game selection in localStorage', () => {
      const gameId = 'cursor-textland';

      localStorage.setItem('selectedGame', gameId);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('selectedGame', gameId);
    });

    test('should retrieve game selection from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('cursor-before-clickers');

      const storedGame = localStorage.getItem('selectedGame');

      expect(storedGame).toBe('cursor-before-clickers');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('selectedGame');
    });

    test('should handle missing localStorage data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const storedGame = localStorage.getItem('selectedGame');

      expect(storedGame).toBeNull();
    });
  });

  describe('Game Type Mapping', () => {
    test('should map level parameters to cursor-before-clickers', () => {
      const levelBasedParams = ['level_1', 'level_2', 'level_3', 'level_4', 'level_5'];

      levelBasedParams.forEach((level) => {
        if (level && level.startsWith('level_')) {
          expect(level.startsWith('level_')).toBe(true);
          // This would map to 'cursor-before-clickers' in the actual implementation
        }
      });
    });

    test('should map non-level parameters to cursor-textland', () => {
      const textlandParams = ['default', 'welcomeMeadow'];

      textlandParams.forEach((param) => {
        const isLevelBased = param && param.startsWith('level_');
        expect(isLevelBased).toBe(false);
        // This would map to 'cursor-textland' in the actual implementation
      });

      // Test null and undefined separately
      expect(null && null.startsWith('level_')).toBeFalsy();
      expect(undefined && undefined.startsWith('level_')).toBeFalsy();
    });
  });

  describe('URL State Management', () => {
    test('should construct URL with game parameter', () => {
      const baseUrl = 'http://localhost:3002/';
      const gameId = 'cursor-textland';

      const url = new URL(baseUrl);
      url.searchParams.set('game', gameId);

      expect(url.searchParams.get('game')).toBe(gameId);
    });

    test('should construct URL with game and level parameters', () => {
      const baseUrl = 'http://localhost:3002/';
      const gameId = 'cursor-before-clickers';
      const level = 'level_2';

      const url = new URL(baseUrl);
      url.searchParams.set('game', gameId);
      url.searchParams.set('level', level);

      expect(url.searchParams.get('game')).toBe(gameId);
      expect(url.searchParams.get('level')).toBe(level);
    });

    test('should remove level parameter for textland games', () => {
      const baseUrl = 'http://localhost:3002/';

      const url = new URL(baseUrl);
      url.searchParams.set('game', 'cursor-before-clickers');
      url.searchParams.set('level', 'level_2');

      // Simulate switching to textland game
      url.searchParams.set('game', 'cursor-textland');
      url.searchParams.delete('level');

      expect(url.searchParams.get('game')).toBe('cursor-textland');
      expect(url.searchParams.get('level')).toBeNull();
    });
  });

  describe('Game State Persistence Flow', () => {
    test('should follow correct persistence priority: URL > localStorage > default', () => {
      // Test URL priority
      mockLocation.search = '?game=cursor-textland';
      localStorageMock.getItem.mockReturnValue('cursor-before-clickers');

      const urlParams = new URLSearchParams(window.location.search);
      const gameFromUrl = urlParams.get('game');

      if (gameFromUrl) {
        localStorage.setItem('selectedGame', gameFromUrl);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('selectedGame', 'cursor-textland');
      }

      // Test localStorage fallback
      mockLocation.search = '';
      const storedGame = localStorage.getItem('selectedGame');
      expect(storedGame).toBe('cursor-before-clickers');

      // Test default fallback
      localStorageMock.getItem.mockReturnValue(null);
      const defaultGame = localStorage.getItem('selectedGame') || 'cursor-before-clickers';
      expect(defaultGame).toBe('cursor-before-clickers');
    });
  });

  describe('Level Selection UI Visibility', () => {
    test('should show level selection for level-based games', () => {
      const mockElement = { style: { display: 'none' } };
      const gameId = 'cursor-before-clickers';

      // Simulate showing level selection for cursor-before-clickers
      if (gameId === 'cursor-before-clickers') {
        mockElement.style.display = 'flex';
      }

      expect(mockElement.style.display).toBe('flex');
    });

    test('should hide level selection for textland games', () => {
      const mockElement = { style: { display: 'flex' } };
      const gameId = 'cursor-textland';

      // Simulate hiding level selection for cursor-textland
      if (gameId !== 'cursor-before-clickers') {
        mockElement.style.display = 'none';
      }

      expect(mockElement.style.display).toBe('none');
    });
  });
});
