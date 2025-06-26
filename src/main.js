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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupLevelSelection();
  initializeGame('level_1'); // Start with Level 1 (Blinking Grove)
});
