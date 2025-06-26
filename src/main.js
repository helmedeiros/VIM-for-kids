import { VimForKidsGame } from './VimForKidsGame.js';

let currentGame = null;

// Initialize game with level selection
function initializeGame(options = {}) {
  // Cleanup previous game
  if (currentGame) {
    currentGame.cleanup();
  }

  // Handle backward compatibility - if options is a string, treat it as level
  if (typeof options === 'string') {
    options = { level: options };
  }

  // Set defaults
  const gameOptions = {
    game: options.game || 'cursor-before-clickers',
    level: options.level || 'level_1',
    ...options,
  };

  currentGame = new VimForKidsGame(gameOptions);
  window.vimForKidsGame = currentGame;
}

// Setup level selection buttons
function setupLevelSelection() {
  const levelButtons = [
    { id: 'level_1', level: 'level_1' },
    { id: 'level_2', level: 'level_2' },
    { id: 'level_3', level: 'level_3' },
    { id: 'level_4', level: 'level_4' },
    { id: 'level_5', level: 'level_5' },
  ];

  levelButtons.forEach(({ id, level }) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => {
        setActiveButton(button);
        initializeGame(level);
      });
    }
  });
}

function setActiveButton(activeBtn) {
  document.querySelectorAll('.level-btn').forEach((btn) => {
    btn.classList.remove('active');
  });
  activeBtn.classList.add('active');
}

// Get level from URL parameters
function getLevelFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const level = urlParams.get('level');
  return level && level.startsWith('level_') ? level : 'level_1';
}

// Get game from URL parameters or localStorage
function getGameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const gameParam = urlParams.get('game');

  // Check URL parameter first
  if (gameParam) {
    // Store in localStorage for persistence
    localStorage.setItem('selectedGame', gameParam);
    return gameParam;
  }

  // Fallback to localStorage
  const storedGame = localStorage.getItem('selectedGame');
  if (storedGame) {
    return storedGame;
  }

  // Default to level-based game
  return 'cursor-before-clickers';
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupLevelSelection();

  // Get initial game and level
  const initialGame = getGameFromURL();
  const initialLevel = getLevelFromURL();

  // Initialize with the appropriate options based on game type
  let options;
  if (initialGame === 'cursor-textland') {
    options = { game: initialGame };
  } else {
    options = { game: initialGame, level: initialLevel };
  }

  initializeGame(options);

  // Set the active button for the current level (only for level-based games)
  if (initialGame === 'cursor-before-clickers') {
    const activeButton = document.getElementById(initialLevel);
    if (activeButton) {
      setActiveButton(activeButton);
    }
  }
});
