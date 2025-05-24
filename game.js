class VimForKidsGame {
    constructor() {
        this.gridSize = 12;
        this.gameBoard = document.getElementById('gameBoard');
        this.initializeGame();
    }

    initializeGame() {
        this.renderEmptyGrid();
    }

    renderEmptyGrid() {
        this.gameBoard.innerHTML = '';

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.style.width = '32px';
                tile.style.height = '32px';
                tile.style.backgroundColor = '#27ae60';
                this.gameBoard.appendChild(tile);
            }
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VimForKidsGame();
});
