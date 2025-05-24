/**
 * Port for handling user input
 * This interface should be implemented by input adapters
 */
export class InputHandler {
    /**
     * Set up input handling
     * @param {Function} onMovement - Callback for movement commands
     */
    setupInputHandling(onMovement) {
        throw new Error('InputHandler.setupInputHandling() must be implemented');
    }

    /**
     * Clean up input handling
     */
    cleanup() {
        throw new Error('InputHandler.cleanup() must be implemented');
    }
}
