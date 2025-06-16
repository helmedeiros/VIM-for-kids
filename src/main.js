import { VimForKidsGame } from './VimForKidsGame.js';

let currentGame = null;

// Initialize game with level selection
function initializeGame(level = 'default') {
  // Cleanup previous game
  if (currentGame) {
    currentGame.cleanup();
  }

  // Create new game with selected level
  const options = level === 'welcomeMeadow' ? { level: 'welcomeMeadow' } : {};
  currentGame = new VimForKidsGame(options);
  window.vimForKidsGame = currentGame;
}

// Setup level selection buttons
function setupLevelSelection() {
  const defaultBtn = document.getElementById('defaultLevel');
  const meadowBtn = document.getElementById('welcomeMeadow');

  defaultBtn.addEventListener('click', () => {
    setActiveButton(defaultBtn);
    initializeGame('default');
  });

  meadowBtn.addEventListener('click', () => {
    setActiveButton(meadowBtn);
    initializeGame('welcomeMeadow');
  });
}

function setActiveButton(activeBtn) {
  document.querySelectorAll('.level-btn').forEach((btn) => {
    btn.classList.remove('active');
  });
  activeBtn.classList.add('active');
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupLevelSelection();
  initializeGame('default'); // Start with default level
});
