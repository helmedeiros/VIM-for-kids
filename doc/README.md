# VIM for Kids - Technical Documentation

This folder contains comprehensive technical documentation for developers, contributors, and maintainers of the VIM for Kids project.

> **For Users**: Looking to play the game? Check out the main [README.md](../README.md) > **For Developers**: You're in the right place! This documentation will guide you through the codebase.

## 📚 Documentation Index

| Document                                                     | Purpose                             | Audience    |
| ------------------------------------------------------------ | ----------------------------------- | ----------- |
| **[📖 Documentation Index](README.md)**                      | Complete navigation guide           | All         |
| **[🚀 Development Guide](DEVELOPMENT.md)**                   | Setup, workflow, and best practices | Developers  |
| **[🏗️ Architecture Guide](ARCHITECTURE.md)**                 | Hexagonal architecture explanation  | Developers  |
| **[💬 Dialogue Message System](DIALOGUE_MESSAGE_SYSTEM.md)** | NPC conversations and UI messages   | Developers  |
| **[🌳 Trunk-Based Development](TRUNK_BASED_DEVELOPMENT.md)** | Modern development workflow guide   | Developers  |
| **[📝 Conventional Commits](CONVENTIONAL_COMMITS.md)**       | Commit message standards and tools  | All         |
| **[🔧 Build System](BUILD_SYSTEM_SUMMARY.md)**               | Technical implementation details    | Developers  |
| **[📈 Refactoring History](REFACTORING_SUMMARY.md)**         | Project evolution story             | Maintainers |

## 📋 Quick Navigation

### For New Developers

1. Start with [Development Guide](DEVELOPMENT.md) for setup and workflow
2. Review [Architecture Overview](ARCHITECTURE.md) to understand the codebase structure
3. Check [Build System Summary](BUILD_SYSTEM_SUMMARY.md) for tooling details

### For Understanding the Project Evolution

1. Read [Refactoring Summary](REFACTORING_SUMMARY.md) to see how the project transformed
2. Review [Architecture Overview](ARCHITECTURE.md) for the final design
3. Check [Build System Summary](BUILD_SYSTEM_SUMMARY.md) for modern tooling implementation

## 🎯 Documentation Highlights

### Architecture

- **Hexagonal (Ports & Adapters)** pattern implementation
- Clean separation of concerns across layers
- Domain-driven design principles

### Testing

- **92.35% code coverage** with comprehensive test suite
- **80 tests** across unit, integration, and infrastructure layers
- Custom Jest matchers for domain-specific assertions

### Build System

- **Vite-powered** development and production builds
- **Hot Module Replacement** for instant development feedback
- **Code splitting** aligned with architecture boundaries

### Code Quality

- **ESLint** for enforced coding standards
- **Prettier** for consistent formatting
- **Zero linting errors** in production codebase

## 🔄 Keeping Documentation Updated

When making changes to the project:

1. Update relevant documentation files
2. Ensure code examples remain accurate
3. Update metrics and coverage numbers as they change
4. Add new sections for major feature additions

---

_This documentation reflects the current state of the project after implementing comprehensive build system and testing infrastructure._
