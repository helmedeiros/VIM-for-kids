import { InputHandler } from '../../ports/input/InputHandler.js';

export class KeyboardInputHandler extends InputHandler {
    constructor(gameBoard) {
        super();
        this.gameBoard = gameBoard;
        this.handleMovement = null;
    }

    setupInputHandling(onMovement) {
        this.handleMovement = (e) => {
            const direction = this._mapKeyToDirection(e.key.toLowerCase());

            if (direction) {
                e.preventDefault();
                onMovement(direction);
            }
        };

        this.gameBoard.addEventListener('keydown', this.handleMovement);

        // Ensure the game board stays focused when clicked
        this.gameBoard.addEventListener('click', () => {
            this.gameBoard.focus();
        });
    }

    cleanup() {
        if (this.handleMovement) {
            this.gameBoard.removeEventListener('keydown', this.handleMovement);
            this.handleMovement = null;
        }
    }

    _mapKeyToDirection(key) {
        const keyMappings = {
            'arrowup': 'up',
            'k': 'up',
            'arrowdown': 'down',
            'j': 'down',
            'arrowleft': 'left',
            'h': 'left',
            'arrowright': 'right',
            'l': 'right'
        };

        return keyMappings[key] || null;
    }
}
