import { VimForKidsGame } from './VimForKidsGame.js';

let currentGame = null;

// Initialize game with level selection
function initializeGame(level = 'level1') {
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
  const level1Btn = document.getElementById('level1');
  const defaultBtn = document.getElementById('defaultLevel');

  level1Btn.addEventListener('click', () => {
    setActiveButton(level1Btn);
    initializeGame('level1');
  });

  defaultBtn.addEventListener('click', () => {
    setActiveButton(defaultBtn);
    initializeGame('default');
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
  initializeGame('level1'); // Start with Level 1 (Welcome Meadow)
});
