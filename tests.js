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
        console.log('Running Stage 1 Tests...');
        this.testStage1();
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
