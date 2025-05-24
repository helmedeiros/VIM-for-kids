# VIM for Kids 🎮

An interactive educational game that teaches children VIM editor movement commands (h, j, k, l) through engaging gameplay.

![VIM for Kids Game](https://img.shields.io/badge/Game-Educational-brightgreen) ![Build Status](https://img.shields.io/badge/Build-Passing-success) ![Coverage](https://img.shields.io/badge/Coverage-92%25-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 What is VIM for Kids?

VIM for Kids is a browser-based educational game designed to make learning VIM editor navigation fun and intuitive for children. Players navigate through a colorful grid world, collecting VIM movement keys while learning the fundamental h, j, k, l navigation commands that are essential for VIM proficiency.

### 🌟 Key Features

- **🎮 Interactive Gameplay**: Navigate a character through various terrains
- **📚 Educational Focus**: Learn VIM movement commands naturally through play
- **🎨 Visual Learning**: Colorful tiles and animated feedback
- **⌨️ Dual Input**: Support for both VIM keys (hjkl) and arrow keys
- **🏆 Progress Tracking**: Collect all VIM keys to complete the game
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🚀 Try It Out

### Play Online

Open `index.html` in your web browser to start playing immediately.

### Quick Start for Development

```bash
# Clone the repository
git clone <repository-url>
cd vim-for-kids

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

## 🎮 How to Play

1. **Objective**: Collect all four VIM movement keys (h, j, k, l) scattered across the map
2. **Movement**: Use VIM keys or arrow keys to navigate:
   - `h` or `←` - Move left
   - `j` or `↓` - Move down
   - `k` or `↑` - Move up
   - `l` or `→` - Move right
3. **Rules**: Avoid water tiles (blue), stick to walkable paths (grass/dirt)
4. **Learning**: Each key collected shows its VIM command and description

## 🏗️ Architecture & Technology

VIM for Kids is built with modern web technologies and clean architecture:

- **Frontend**: Pure JavaScript (ES6+), HTML5, CSS3
- **Architecture**: Hexagonal (Ports & Adapters) pattern
- **Build System**: Vite with Hot Module Replacement
- **Testing**: Jest with 92%+ code coverage
- **Code Quality**: ESLint, Prettier, comprehensive test suite

## 📚 Documentation

Detailed documentation is available for developers and contributors:

| Document                                                         | Purpose                             | Audience    |
| ---------------------------------------------------------------- | ----------------------------------- | ----------- |
| **[📖 Documentation Index](doc/README.md)**                      | Complete navigation guide           | All         |
| **[🚀 Development Guide](doc/DEVELOPMENT.md)**                   | Setup, workflow, and best practices | Developers  |
| **[🏗️ Architecture Guide](doc/ARCHITECTURE.md)**                 | Hexagonal architecture explanation  | Developers  |
| **[🌳 Trunk-Based Development](doc/TRUNK_BASED_DEVELOPMENT.md)** | Modern development workflow guide   | Developers  |
| **[📝 Conventional Commits](doc/CONVENTIONAL_COMMITS.md)**       | Commit message standards and tools  | All         |
| **[🔧 Build System](doc/BUILD_SYSTEM_SUMMARY.md)**               | Technical implementation details    | Developers  |
| **[📈 Refactoring History](doc/REFACTORING_SUMMARY.md)**         | Project evolution story             | Maintainers |

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **For New Contributors**: Start with the [Development Guide](doc/DEVELOPMENT.md)
2. **Understanding the Code**: Review the [Architecture Guide](doc/ARCHITECTURE.md)
3. **Making Changes**: Follow the development workflow in our docs
4. **Testing**: Ensure all tests pass with `npm test`
5. **Code Quality**: Run `npm run lint` before submitting

### Development Workflow

```bash
# Fork and clone the repository
git clone <your-fork-url>
cd vim-for-kids

# Install dependencies and start development
npm install
npm run dev

# Make your changes, add tests
npm test
npm run lint

# Submit a pull request
```

## 📊 Project Status

- ✅ **Stable**: Core gameplay and educational features complete
- ✅ **Well-Tested**: 92%+ code coverage with comprehensive test suite
- ✅ **Modern Tooling**: Professional development environment
- ✅ **Documented**: Comprehensive documentation for all aspects
- 🔄 **Active**: Accepting contributions and enhancements

## 🎓 Educational Impact

VIM for Kids bridges the gap between gaming and learning by:

- **Making VIM Accessible**: Introduces VIM navigation in a stress-free environment
- **Building Muscle Memory**: Repeated gameplay reinforces key mappings
- **Visual Association**: Links movement commands with directional actions
- **Progressive Learning**: Learn at your own pace through gameplay

Perfect for:

- Children beginning their coding journey
- Educators teaching text editor fundamentals
- Anyone wanting to learn VIM navigation in a fun way

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web development best practices
- Inspired by the need to make VIM more accessible to young learners
- Thanks to the open-source community for excellent tooling and resources

---

**Ready to start your VIM journey?** Open `index.html` and begin playing! 🎮

For detailed technical information, visit our [📖 Documentation](doc/README.md).
