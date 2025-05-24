# Trunk-Based Development Guide

This project uses **Trunk-Based Development** to enable rapid, continuous integration and deployment while maintaining high code quality.

## 🌳 What is Trunk-Based Development?

Trunk-based development is a version control management practice where developers collaborate on code in a single branch called 'main' (or trunk), resist creating other long-lived development branches, and make frequent small commits.

### Key Principles

1. **Single Main Branch**: All development happens on or quickly merges to `main`
2. **Short-Lived Branches**: Feature branches live for hours or days, not weeks
3. **Frequent Integration**: Multiple commits per day to main branch
4. **Feature Flags**: Hide incomplete features behind flags
5. **Automated Testing**: Comprehensive CI/CD pipeline prevents regression
6. **Small Batches**: Small, incremental changes are easier to review and integrate

## 🚀 Getting Started

### Initial Setup

1. **Install dependencies and setup pre-commit hooks:**

   ```bash
   npm install
   npm run prepare  # Sets up Husky pre-commit hooks
   ```

2. **Verify your setup:**
   ```bash
   npm run validate  # Runs lint, test, and build
   ```

### Daily Workflow

1. **Start with a fresh main branch:**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a short-lived feature branch:**

   ```bash
   git checkout -b feature/add-sound-effects
   ```

3. **Make small, focused changes:**

   - Work in small increments (1-4 hours of work)
   - Commit frequently with descriptive messages
   - Keep changes focused on a single concern

4. **Test locally before pushing:**

   ```bash
   npm run validate  # Lint, format check, test, and build
   ```

5. **Push and create a Pull Request:**

   ```bash
   git push origin feature/add-sound-effects
   # Create PR via GitHub UI
   ```

6. **Merge quickly after review:**
   - Address feedback promptly
   - Merge within 24 hours
   - Delete branch after merge

## 🛠️ Development Tools

### Pre-commit Hooks

Automatically run before each commit:

- **ESLint**: Code linting and style checking
- **Prettier**: Code formatting
- **Quick tests**: Fast unit tests

### GitHub Actions CI/CD

Our pipeline runs on every push and PR:

#### Quality Gates (`branch-protection.yml`)

- ✅ Code formatting check
- ✅ Linting (ESLint)
- ✅ Test coverage (>80% required)
- ✅ Build verification
- ✅ Bundle size check (<5MB)

#### CI/CD Pipeline (`ci.yml`)

- ✅ Full test suite with coverage
- ✅ Build for production
- ✅ Deploy to GitHub Pages (main branch only)
- ✅ Coverage reporting to Codecov

### Feature Flags

Use feature flags to hide incomplete features:

```javascript
import { featureFlags } from '@/infrastructure/FeatureFlags.js';

// Check if feature is enabled
if (featureFlags.isEnabled('NEW_POWER_UPS')) {
  // Render new power-ups feature
  renderPowerUps();
}

// Conditional feature rendering
featureFlags.withFeature(
  'SOUND_EFFECTS',
  () => playSound('jump'),
  () => console.log('Sound disabled')
);

// Percentage rollout
if (featureFlags.isEnabledForPercentage('NEW_UI_THEME', 50, userId)) {
  // Show new UI to 50% of users
  applyNewTheme();
}
```

## 📋 Best Practices

### Branch Management

✅ **DO:**

- Keep feature branches short-lived (hours to days)
- Use descriptive branch names: `feature/`, `fix/`, `docs/`
- Delete branches after merging
- Rebase frequently to stay current with main

❌ **DON'T:**

- Create long-lived feature branches
- Let branches live for weeks without merging
- Work in isolation without regular integration

### Commit Practices

✅ **DO:**

- Make small, atomic commits
- Write clear, descriptive commit messages
- Commit frequently (multiple times per day)
- Include tests with your changes

❌ **DON'T:**

- Make large, monolithic commits
- Commit broken or untested code
- Skip writing meaningful commit messages

### Feature Development

✅ **DO:**

- Use feature flags for incomplete features
- Write tests before or alongside code
- Keep changes backward compatible when possible
- Update documentation with your changes

❌ **DON'T:**

- Push incomplete features without flags
- Break existing functionality
- Skip writing tests for new code

## 🎯 Workflow Examples

### Adding a New Feature

```bash
# 1. Start from main
git checkout main && git pull

# 2. Create feature branch
git checkout -b feature/achievement-system

# 3. Enable feature flag for development
# In FeatureFlags.js, set ACHIEVEMENT_SYSTEM: true locally

# 4. Implement feature with tests
# - Add achievement logic
# - Add tests
# - Add documentation

# 5. Commit and test
git add . && git commit -m "Add basic achievement tracking"
npm run validate

# 6. Push and create PR
git push origin feature/achievement-system
# Create PR, get review, merge quickly

# 7. Clean up
git checkout main && git pull
git branch -d feature/achievement-system
```

### Hotfix Process

```bash
# 1. Start from main
git checkout main && git pull

# 2. Create hotfix branch
git checkout -b hotfix/game-crash-fix

# 3. Fix the issue
# - Identify root cause
# - Apply minimal fix
# - Add regression test

# 4. Fast-track review and merge
git add . && git commit -m "Fix game crash when collecting last key"
git push origin hotfix/game-crash-fix
# Create PR with "hotfix" label for expedited review
```

## 🔧 Configuration Management

### Environment-Specific Feature Flags

```javascript
// Development
window.FEATURE_FLAGS = {
  DEBUG_MODE: true,
  NEW_FEATURES: true,
};

// Staging
window.FEATURE_FLAGS = {
  DEBUG_MODE: false,
  NEW_FEATURES: true,
};

// Production
window.FEATURE_FLAGS = {
  DEBUG_MODE: false,
  NEW_FEATURES: false, // Enable gradually
};
```

### GitHub Branch Protection Rules

Configure these settings in your GitHub repository:

1. **Require pull request reviews before merging**
2. **Require status checks to pass before merging:**
   - `quality-check` (branch protection workflow)
   - `test` (CI workflow)
3. **Require branches to be up to date before merging**
4. **Require linear history**
5. **Delete head branches automatically**

### GitHub Pages Setup

The `gh-pages` branch is created automatically by the CI/CD pipeline:

1. **Enable GitHub Pages** in repository Settings > Pages
2. **Select source**: Deploy from branch `gh-pages`
3. **First deployment**: The branch is created when the workflow first runs
4. **Automatic updates**: Every merge to main triggers a new deployment

> **Note**: The `gh-pages` branch doesn't exist until the first successful workflow run. See `scripts/setup-github-pages.md` for detailed setup instructions.

## 📊 Monitoring and Metrics

### Key Metrics to Track

- **Lead Time**: Time from commit to production
- **Deployment Frequency**: How often you deploy
- **Mean Time to Recovery**: How quickly you fix issues
- **Change Failure Rate**: Percentage of changes causing issues

### Tools Integration

- **Codecov**: Test coverage tracking
- **GitHub Actions**: CI/CD pipeline metrics
- **Feature Flags**: Usage and rollout metrics
- **Bundle Analysis**: Bundle size monitoring

## 🚨 Troubleshooting

### Common Issues

**Q: My feature branch is getting stale**
A: Rebase frequently and merge quickly. If the branch is more than a few days old, consider breaking it into smaller pieces.

**Q: Tests are failing on main branch**
A: This is a critical issue. Either revert the problematic commit or fix forward immediately.

**Q: Feature flag isn't working**
A: Check the flag name spelling and ensure it's properly loaded. Use browser dev tools to inspect `featureFlags.getAllFlags()`.

**Q: CI is taking too long**
A: Consider parallelizing tests or optimizing the build process. Fast feedback is crucial for trunk-based development.

**Q: GitHub Actions failing on formatting but code looks fine locally**
A: Always run `npm run validate` before pushing. This includes `npm run format:check` which catches formatting issues without modifying files. Use `npm run format` to fix any issues found.

**Q: Pre-commit hooks not catching all issues**
A: Pre-commit hooks only run on staged files. Use `npm run validate` to check your entire codebase before pushing.

## 📚 Additional Resources

- [Trunk-Based Development Website](https://trunkbaseddevelopment.com/)
- [Feature Toggles Guide](https://martinfowler.com/articles/feature-toggles.html)
- [Continuous Integration Best Practices](https://www.thoughtworks.com/continuous-integration)

---

Remember: The goal is to enable fast, safe, and frequent integration. When in doubt, prefer smaller changes and quicker integration over large, long-lived branches.
