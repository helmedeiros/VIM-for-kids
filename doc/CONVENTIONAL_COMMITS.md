# Conventional Commits Guide

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for consistent commit messages and automated tooling.

## 📋 Commit Message Format

```
<type>(<scope>): <description>

<body>

<footer>
```

### Required Elements

- **type**: The kind of change (see types below)
- **scope**: The area of the codebase affected
- **description**: Short description of the change (imperative mood)

### Optional Elements

- **body**: Longer description explaining _why_ the change was made
- **footer**: References to issues, breaking changes, etc.

## 🏷️ Commit Types

| Type       | Description                           | Example                                             |
| ---------- | ------------------------------------- | --------------------------------------------------- |
| `feat`     | New feature                           | `feat(game): add sound effects system`              |
| `fix`      | Bug fix                               | `fix(input): resolve keyboard handler memory leak`  |
| `docs`     | Documentation changes                 | `docs(readme): update installation instructions`    |
| `style`    | Code style changes (formatting, etc.) | `style(components): apply prettier formatting`      |
| `refactor` | Code refactoring                      | `refactor(entities): extract player movement logic` |
| `test`     | Adding or updating tests              | `test(feature-flags): add percentage rollout tests` |
| `chore`    | Build process, dependencies, etc.     | `chore(deps): update vite to v4.4.9`                |
| `ci`       | CI/CD configuration changes           | `ci(github): add automated deployment workflow`     |

## 🎯 Scopes

Use descriptive scopes that identify the area of change:

- `game` - Core game logic
- `ui` - User interface components
- `input` - Input handling system
- `infrastructure` - Infrastructure layer
- `domain` - Domain entities and logic
- `application` - Application services
- `testing` - Test infrastructure
- `docs` - Documentation
- `build` - Build system
- `ci` - Continuous integration
- `github-pages` - GitHub Pages deployment
- `feature-flags` - Feature flag system

## 🛠️ Tools Available

### 1. Interactive Commit Helper

For manual commits with guidance:

```bash
# Show usage and examples
npm run commit:help

# Example usage
./scripts/commit-helper.sh feat game "Add achievement system" "Implement a comprehensive achievement system with progress tracking, notifications, and persistent storage. This enhances user engagement and provides educational milestones."
```

### 2. AI Commit Function

For AI assistants to create proper commits:

```bash
# Direct usage
npm run commit:ai feat game "Add achievement system" "Detailed explanation of changes..."

# Or source the function
source scripts/ai-commit.sh
ai_commit feat game "Add achievement system" "Detailed explanation..."
```

### 3. Manual with Temporary File

For custom commit messages:

```bash
# Create temporary file
temp_file=$(mktemp)

# Write commit message to file
cat > "$temp_file" << 'EOF'
feat(game): add achievement system

Implement a comprehensive achievement system that tracks player progress
and provides educational milestones. The system includes:

- Progress tracking for VIM command mastery
- Visual achievement notifications
- Persistent storage of achievements
- Integration with existing game state

This enhances user engagement and provides clear learning objectives
for children learning VIM navigation commands.

Closes #123
EOF

# Commit using the file
git commit -F "$temp_file"

# Clean up
rm -f "$temp_file"
```

## ✅ Best Practices

### Commit Message Guidelines

1. **Use imperative mood**: "Add feature" not "Added feature"
2. **Keep first line under 50 characters** for readability
3. **Explain WHY, not just WHAT** in the body
4. **Reference issues** when applicable
5. **Use breaking change footer** for breaking changes

### Examples of Good Commits

```
feat(feature-flags): add percentage rollout capability

Implement percentage-based feature rollouts to enable gradual feature
deployment and A/B testing. This allows for:

- Controlled feature rollouts to user segments
- Consistent user experience across sessions
- Easy feature toggle management
- Reduced risk of feature-related issues

The implementation uses a simple hash function to ensure consistent
user assignment to rollout groups.

BREAKING CHANGE: FeatureFlags constructor now requires userId parameter
for percentage-based rollouts.

Closes #234
```

```
fix(ci): resolve GitHub Pages deployment permissions

Fix the "Permission denied to github-actions[bot]" error by adding
proper environment configuration and permissions to the workflow.

The GitHub Pages deployment was failing because:
- Missing 'github-pages' environment configuration
- Insufficient workflow permissions
- Incorrect Pages source configuration

This fix ensures reliable automated deployment on every merge to main.

Fixes #456
```

```
docs(trunk-based): add troubleshooting for CI failures

Add comprehensive troubleshooting section for common CI/CD issues
including formatting failures, permission errors, and deployment
problems. This helps developers resolve issues quickly and maintains
the fast feedback loop essential for trunk-based development.
```

## 🤖 For AI Assistants

When working on this project, use the conventional commit format:

```bash
# Stage your changes
git add .

# Use the AI commit function
source scripts/ai-commit.sh
ai_commit "feat" "scope" "short description" "Detailed explanation of why this change was made, what it accomplishes, and any important implementation details."
```

## 🔧 Integration with Tools

### Automated Changelog Generation

Conventional commits enable automatic changelog generation:

```bash
# Generate changelog (when implemented)
npm run changelog
```

### Semantic Versioning

Commit types determine version bumps:

- `fix` → patch version (1.0.1)
- `feat` → minor version (1.1.0)
- `BREAKING CHANGE` → major version (2.0.0)

### Commit Validation

Pre-commit hooks can validate commit message format:

```bash
# Add commit message validation (future enhancement)
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

## 📚 References

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

---

Following conventional commits improves project maintainability, enables automation, and makes the development history more readable and useful for all contributors.
