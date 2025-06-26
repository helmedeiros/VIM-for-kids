import { VimForKidsGame } from './VimForKidsGame.js';

let currentGame = null;

// Initialize game with level selection
function initializeGame(level = 'level_1') {
  // Cleanup previous game
  if (currentGame) {
    currentGame.cleanup();
  }

  // Create new game with selected level
  const options = { level: level };
  currentGame = new VimForKidsGame(options);
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupLevelSelection();
  const initialLevel = getLevelFromURL();
  initializeGame(initialLevel);

  // Set the active button for the current level
  const activeButton = document.getElementById(initialLevel);
  if (activeButton) {
    setActiveButton(activeButton);
  }
});
