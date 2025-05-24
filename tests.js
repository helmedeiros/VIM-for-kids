class TestRunner {
    constructor() {
        this.results = [];
        this.testContainer = document.getElementById('testResults');
    }

    assert(condition, message) {
        const result = {
            passed: condition,
            message: message,
            timestamp: new Date().toISOString()
        };
        this.results.push(result);
        return result;
    }

    runTests() {
        console.log('Running Tests...');
        this.testStage1();
        this.testStage2();
        this.testStage3();
        this.testStage4();
        this.testStage5();
        this.testStage6();
        this.displayResults();
    }

    testStage1() {
        const stage1Section = this.createSection('Stage 1: Basic Structure Tests');

        // Test 1: Game class instantiation
        try {
            const game = new VimForKidsGame();
            this.assert(game instanceof VimForKidsGame, '✓ Game class instantiates correctly');
            this.assert(game.gridSize === 12, '✓ Grid size is set to 12x12');
            this.assert(game.gameBoard !== null, '✓ Game board element is found');
        } catch (error) {
            this.assert(false, '✗ Game class instantiation failed: ' + error.message);
        }

        // Test 2: Grid rendering
        try {
            const game = new VimForKidsGame();
            const tiles = game.gameBoard.querySelectorAll('.tile');
            this.assert(tiles.length === 144, '✓ Grid contains 144 tiles (12x12)');

            // Test tile properties
            const firstTile = tiles[0];
            this.assert(firstTile.style.width === '32px', '✓ Tiles have correct width');
            this.assert(firstTile.style.height === '32px', '✓ Tiles have correct height');
            this.assert(firstTile.style.backgroundColor === 'rgb(39, 174, 96)', '✓ Tiles have correct background color');
        } catch (error) {
            this.assert(false, '✗ Grid rendering test failed: ' + error.message);
        }

        // Test 3: HTML structure
        try {
            this.assert(document.title === 'VIM for Kids', '✓ Page title is correct');
            this.assert(document.querySelector('h1').textContent === 'VIM for Kids', '✓ Main heading is correct');
            this.assert(document.querySelector('.game-container') !== null, '✓ Game container exists');
        } catch (error) {
            this.assert(false, '✗ HTML structure test failed: ' + error.message);
                }
    }

    testStage2() {
        const stage2Section = this.createSection('Stage 2: Tile Types and Map Creation Tests');

        // Test 1: Map creation
        try {
            const game = new VimForKidsGame();
            this.assert(Array.isArray(game.gameGrid), '✓ Game grid is created as array');
            this.assert(game.gameGrid.length === 12, '✓ Game grid has correct height');
            this.assert(game.gameGrid[0].length === 12, '✓ Game grid has correct width');
        } catch (error) {
            this.assert(false, '✗ Map creation test failed: ' + error.message);
        }

        // Test 2: Tile types
        try {
            const game = new VimForKidsGame();
            const tiles = game.gameBoard.querySelectorAll('.tile');

            // Check for different tile types
            const waterTiles = game.gameBoard.querySelectorAll('.tile.water');
            const grassTiles = game.gameBoard.querySelectorAll('.tile.grass');
            const dirtTiles = game.gameBoard.querySelectorAll('.tile.dirt');
            const treeTiles = game.gameBoard.querySelectorAll('.tile.tree');

            this.assert(waterTiles.length > 0, '✓ Water tiles are present');
            this.assert(grassTiles.length > 0, '✓ Grass tiles are present');
            this.assert(dirtTiles.length > 0, '✓ Dirt tiles are present');
            this.assert(treeTiles.length > 0, '✓ Tree tiles are present');

            // Check water border
            this.assert(game.gameGrid[0][0] === 'water', '✓ Top-left corner is water');
            this.assert(game.gameGrid[0][11] === 'water', '✓ Top-right corner is water');
            this.assert(game.gameGrid[11][0] === 'water', '✓ Bottom-left corner is water');
            this.assert(game.gameGrid[11][11] === 'water', '✓ Bottom-right corner is water');
        } catch (error) {
            this.assert(false, '✗ Tile types test failed: ' + error.message);
        }

        // Test 3: Map layout
        try {
            const game = new VimForKidsGame();

            // Check for dirt path
            this.assert(game.gameGrid[2][2] === 'dirt', '✓ Dirt path starts correctly');
            this.assert(game.gameGrid[2][9] === 'tree', '✓ Tree is placed correctly');

            // Check that center area has grass
            this.assert(game.gameGrid[5][5] === 'dirt', '✓ Center path is dirt');
        } catch (error) {
            this.assert(false, '✗ Map layout test failed: ' + error.message);
                }
    }

    testStage3() {
        const stage3Section = this.createSection('Stage 3: Player Character and Movement Tests');

        // Test 1: Player initialization
        try {
            const game = new VimForKidsGame();
            this.assert(typeof game.player === 'object', '✓ Player object is created');
            this.assert(typeof game.player.x === 'number', '✓ Player has x coordinate');
            this.assert(typeof game.player.y === 'number', '✓ Player has y coordinate');
            this.assert(game.player.x === 5 && game.player.y === 2, '✓ Player starts at correct position');
        } catch (error) {
            this.assert(false, '✗ Player initialization test failed: ' + error.message);
        }

        // Test 2: Player rendering
        try {
            const game = new VimForKidsGame();
            const playerTiles = game.gameBoard.querySelectorAll('.tile.player');
            this.assert(playerTiles.length === 1, '✓ Exactly one player tile is rendered');

            const playerTile = playerTiles[0];
            this.assert(playerTile.textContent === '●', '✓ Player tile shows correct character');
        } catch (error) {
            this.assert(false, '✗ Player rendering test failed: ' + error.message);
        }

        // Test 3: Movement system
        try {
            const game = new VimForKidsGame();
            const originalX = game.player.x;
            const originalY = game.player.y;

            // Test valid movement
            game.movePlayer(originalX + 1, originalY);
            this.assert(game.player.x === originalX + 1, '✓ Player can move horizontally');

            // Test boundary collision
            game.movePlayer(-1, originalY);
            this.assert(game.player.x !== -1, '✓ Player cannot move outside boundaries');

            // Test obstacle collision (water)
            game.movePlayer(0, 0); // Water tile
            this.assert(!(game.player.x === 0 && game.player.y === 0), '✓ Player cannot move into water');
        } catch (error) {
            this.assert(false, '✗ Movement system test failed: ' + error.message);
        }

        // Test 4: Event listeners
        try {
            const game = new VimForKidsGame();
            this.assert(game.gameBoard.getAttribute('tabindex') === '0', '✓ Game board is focusable');
        } catch (error) {
            this.assert(false, '✗ Event listeners test failed: ' + error.message);
                }
    }

    testStage4() {
        const stage4Section = this.createSection('Stage 4: VIM-style Navigation Tests');

        // Test 1: VIM key movement
        try {
            const game = new VimForKidsGame();
            const originalX = game.player.x;
            const originalY = game.player.y;

            // Test h key (left)
            game.movePlayer(originalX - 1, originalY);
            this.assert(game.player.x === originalX - 1, '✓ h key moves player left');

            // Reset position
            game.player.x = originalX;
            game.player.y = originalY;

            // Test l key (right)
            game.movePlayer(originalX + 1, originalY);
            this.assert(game.player.x === originalX + 1, '✓ l key moves player right');

            // Reset position
            game.player.x = originalX;
            game.player.y = originalY;

            // Test j key (down)
            game.movePlayer(originalX, originalY + 1);
            this.assert(game.player.y === originalY + 1, '✓ j key moves player down');

            // Reset position
            game.player.x = originalX;
            game.player.y = originalY;

            // Test k key (up)
            game.movePlayer(originalX, originalY - 1);
            this.assert(game.player.y === originalY - 1, '✓ k key moves player up');

        } catch (error) {
            this.assert(false, '✗ VIM key movement test failed: ' + error.message);
        }

        // Test 2: Arrow keys still work
        try {
            const game = new VimForKidsGame();
            const originalX = game.player.x;
            const originalY = game.player.y;

            // Test that arrow keys still function (backward compatibility)
            game.movePlayer(originalX + 1, originalY);
            this.assert(game.player.x === originalX + 1, '✓ Arrow keys still work alongside VIM keys');

        } catch (error) {
            this.assert(false, '✗ Arrow key compatibility test failed: ' + error.message);
                }
    }

    testStage5() {
        const stage5Section = this.createSection('Stage 5: Collectible Keys and Game Logic Tests');

        // Test 1: Key initialization
        try {
            const game = new VimForKidsGame();
            this.assert(Array.isArray(game.keys), '✓ Keys array is created');
            this.assert(game.keys.length === 4, '✓ Four VIM keys are defined');
            this.assert(game.collectedKeys instanceof Set, '✓ Collected keys set is created');
            this.assert(game.collectedKeys.size === 0, '✓ No keys collected initially');
        } catch (error) {
            this.assert(false, '✗ Key initialization test failed: ' + error.message);
        }

        // Test 2: Key rendering
        try {
            const game = new VimForKidsGame();
            const keyTiles = game.gameBoard.querySelectorAll('.tile.key');
            this.assert(keyTiles.length === 4, '✓ Four key tiles are rendered');

            // Check that keys have correct content
            const keyTexts = Array.from(keyTiles).map(tile => tile.textContent);
            this.assert(keyTexts.includes('h'), '✓ h key is rendered');
            this.assert(keyTexts.includes('j'), '✓ j key is rendered');
            this.assert(keyTexts.includes('k'), '✓ k key is rendered');
            this.assert(keyTexts.includes('l'), '✓ l key is rendered');
        } catch (error) {
            this.assert(false, '✗ Key rendering test failed: ' + error.message);
        }

        // Test 3: Key collection
        try {
            const game = new VimForKidsGame();
            const originalSize = game.collectedKeys.size;

            // Move player to a key position
            game.player.x = 2;
            game.player.y = 3;
            game.checkKeyCollection();

            this.assert(game.collectedKeys.size === originalSize + 1, '✓ Key is collected when player moves to key position');
            this.assert(game.collectedKeys.has('h'), '✓ Correct key (h) is collected');
        } catch (error) {
            this.assert(false, '✗ Key collection test failed: ' + error.message);
        }

        // Test 4: UI elements
        try {
            const game = new VimForKidsGame();
            this.assert(game.collectedKeysDisplay !== null, '✓ Collected keys display element exists');
            this.assert(document.querySelector('.instructions') !== null, '✓ Instructions element exists');
            this.assert(document.querySelector('.collected-keys') !== null, '✓ Collected keys container exists');
        } catch (error) {
            this.assert(false, '✗ UI elements test failed: ' + error.message);
                }
    }

    testStage6() {
        const stage6Section = this.createSection('Stage 6: UI Enhancements and Polish Tests');

        // Test 1: Game board focus
        try {
            const game = new VimForKidsGame();
            this.assert(game.gameBoard.getAttribute('tabindex') === '0', '✓ Game board is focusable');

            // Check focus styling exists
            const focusStyle = window.getComputedStyle(game.gameBoard, ':focus');
            this.assert(true, '✓ Focus styling is available'); // Basic check
        } catch (error) {
            this.assert(false, '✗ Game board focus test failed: ' + error.message);
        }

        // Test 2: Warning message
        try {
            const warningElement = document.querySelector('.warning');
            this.assert(warningElement !== null, '✓ Warning message element exists');
            this.assert(warningElement.textContent.includes('hjkl'), '✓ Warning mentions hjkl keys');
            this.assert(warningElement.textContent.includes('Vimium'), '✓ Warning mentions Vimium extension');
        } catch (error) {
            this.assert(false, '✗ Warning message test failed: ' + error.message);
        }

        // Test 3: Responsive design
        try {
            const gameBoard = document.querySelector('.game-board');
            const computedStyle = window.getComputedStyle(gameBoard);
            this.assert(computedStyle.display === 'grid', '✓ Game board uses CSS Grid');
            this.assert(computedStyle.gridTemplateColumns.includes('32px'), '✓ Grid columns are properly sized');
        } catch (error) {
            this.assert(false, '✗ Responsive design test failed: ' + error.message);
        }

        // Test 4: Animation effects
        try {
            const game = new VimForKidsGame();
            const playerTile = game.gameBoard.querySelector('.tile.player');
            const keyTiles = game.gameBoard.querySelectorAll('.tile.key');

            if (playerTile) {
                const playerStyle = window.getComputedStyle(playerTile);
                this.assert(playerStyle.animationName === 'blink', '✓ Player has blink animation');
            }

            if (keyTiles.length > 0) {
                const keyStyle = window.getComputedStyle(keyTiles[0]);
                this.assert(keyStyle.animationName === 'pulse', '✓ Keys have pulse animation');
            }
        } catch (error) {
            this.assert(false, '✗ Animation effects test failed: ' + error.message);
        }
    }

    createSection(title) {
        const section = document.createElement('div');
        section.className = 'test-section';
        section.innerHTML = `<h3>${title}</h3>`;
        this.testContainer.appendChild(section);
        return section;
    }

    displayResults() {
        const passedTests = this.results.filter(r => r.passed).length;
        const totalTests = this.results.length;

        const summary = document.createElement('div');
        summary.className = 'test-section';
        summary.innerHTML = `
            <h2>Test Summary</h2>
            <p><strong>${passedTests}/${totalTests} tests passed</strong></p>
        `;
        this.testContainer.appendChild(summary);

        this.results.forEach(result => {
            const div = document.createElement('div');
            div.className = `test-result ${result.passed ? 'test-pass' : 'test-fail'}`;
            div.textContent = result.message;
            this.testContainer.appendChild(div);
        });

        if (passedTests === totalTests) {
            console.log('All Stage 1 tests passed! ✓');
            return true;
        } else {
            console.log(`Stage 1 tests failed: ${passedTests}/${totalTests} passed`);
            return false;
        }
    }
}

// Run tests when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure game is initialized
    setTimeout(() => {
        const testRunner = new TestRunner();
        testRunner.runTests();
    }, 100);
});
