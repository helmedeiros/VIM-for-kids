class VimForKidsGame {
    constructor() {
        this.gridSize = 12;
        this.gameBoard = document.getElementById('gameBoard');
        this.gameGrid = [];
        this.player = {
            x: 5,
            y: 2
        };
        this.initializeGame();
    }

    initializeGame() {
        this.createMap();
        this.renderGame();
        this.setupEventListeners();
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

                // Add player
                if (x === this.player.x && y === this.player.y) {
                    tile.classList.add('player');
                    tile.textContent = '●';
                }

                this.gameBoard.appendChild(tile);
            }
        }
    }

    setupEventListeners() {
        // Make the game board focusable and focus it
        this.gameBoard.setAttribute('tabindex', '0');
        this.gameBoard.focus();

        const handleMovement = (e) => {
            let newX = this.player.x;
            let newY = this.player.y;
            let moved = false;

            switch (e.key.toLowerCase()) {
                case 'arrowup':
                case 'k':
                    newY--;
                    moved = true;
                    break;
                case 'arrowdown':
                case 'j':
                    newY++;
                    moved = true;
                    break;
                case 'arrowleft':
                case 'h':
                    newX--;
                    moved = true;
                    break;
                case 'arrowright':
                case 'l':
                    newX++;
                    moved = true;
                    break;
            }

            if (moved) {
                e.preventDefault();
                this.movePlayer(newX, newY);
            }
        };

        this.gameBoard.addEventListener('keydown', handleMovement);

        // Ensure the game board stays focused when clicked
        this.gameBoard.addEventListener('click', () => {
            this.gameBoard.focus();
        });
    }

    movePlayer(newX, newY) {
        // Check boundaries
        if (!this.isValidPosition(newX, newY)) {
            return;
        }

        const targetTile = this.gameGrid[newY][newX];

        // Check for impassable tiles
        if (targetTile === 'water' || targetTile === 'tree') {
            return;
        }

        // Update player position
        this.player.x = newX;
        this.player.y = newY;

        // Re-render the game
        this.renderGame();
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VimForKidsGame();
});
