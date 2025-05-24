class VimForKidsGame {
    constructor() {
        this.gridSize = 12;
        this.gameBoard = document.getElementById('gameBoard');
        this.gameGrid = [];
        this.initializeGame();
    }

    initializeGame() {
        this.createMap();
        this.renderGame();
    }

    createMap() {
        // Initialize grid with grass
        for (let y = 0; y < this.gridSize; y++) {
            this.gameGrid[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.gameGrid[y][x] = 'grass';
            }
        }

        // Add water border
        for (let i = 0; i < this.gridSize; i++) {
            this.gameGrid[0][i] = 'water';           // Top
            this.gameGrid[this.gridSize - 1][i] = 'water'; // Bottom
            this.gameGrid[i][0] = 'water';           // Left
            this.gameGrid[i][this.gridSize - 1] = 'water'; // Right
        }

        // Create dirt path
        const dirtPath = [
            // Main horizontal path
            [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2],
            // Vertical connection down
            [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [5, 8], [5, 9],
            // Key collection area
            [2, 3], [3, 3], [4, 3],
            // Branch paths
            [3, 4], [7, 4], [3, 6], [7, 6]
        ];

        dirtPath.forEach(([x, y]) => {
            if (this.isValidPosition(x, y)) {
                this.gameGrid[y][x] = 'dirt';
            }
        });

        // Add tree
        this.gameGrid[2][9] = 'tree';
    }

    renderGame() {
        this.gameBoard.innerHTML = '';

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tile = document.createElement('div');
                tile.className = 'tile';

                // Set base tile type
                tile.classList.add(this.gameGrid[y][x]);

                this.gameBoard.appendChild(tile);
            }
        }
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VimForKidsGame();
});
