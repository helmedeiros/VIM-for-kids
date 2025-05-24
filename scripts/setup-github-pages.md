# GitHub Pages Setup Guide

Follow these steps to enable GitHub Pages for your repository:

## Step 1: Push Your Changes

First, make sure all the trunk-based development setup is pushed to your main branch:

```bash
# Add all new files
git add .

# Commit the trunk-based development setup
git commit -m "Add trunk-based development infrastructure

- GitHub Actions CI/CD pipeline
- Feature flags system
- Pre-commit hooks with Husky
- Comprehensive testing
- Quality gates and branch protection"

# Push to main branch
git push origin main
```

## Step 2: Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** tab
3. **First, configure Actions permissions**:
   - Go to **Actions** → **General**
   - Under **Workflow permissions**, select: **Read and write permissions**
   - Check: **Allow GitHub Actions to create and approve pull requests**
   - Click **Save**
4. **Then configure Pages**:
   - Go to **Pages** section (in the left sidebar)
   - Under **Source**, select: **GitHub Actions**
   - Click **Save**

> **Note**: We now use GitHub's native Pages deployment instead of branch-based deployment for better security and reliability.

## Step 3: Trigger First Deployment

The `gh-pages` branch will be created automatically when the GitHub Actions workflow runs. You can trigger this by:

### Option A: Push a small change to main

```bash
# Make a small change
echo "# VIM for Kids Game" > .github/README.md
git add .github/README.md
git commit -m "Trigger initial GitHub Pages deployment"
git push origin main
```

### Option B: Manually trigger the workflow

1. Go to **Actions** tab in your GitHub repository
2. Select **CI/CD Pipeline** workflow
3. Click **Run workflow** dropdown
4. Select **main** branch
5. Click **Run workflow**

## Step 4: Verify Deployment

1. Go to **Actions** tab to watch the workflow run
2. Once the workflow completes successfully:
   - The `gh-pages` branch will be created
   - Your site will be available at: `https://yourusername.github.io/vim-for-kids`

## Troubleshooting

### Issue: "Missing environment" error in GitHub Actions

**Solution**: The GitHub Pages actions require an explicit environment configuration:

1. Ensure your workflow includes:
   ```yaml
   environment:
     name: github-pages
     url: ${{ steps.deployment.outputs.page_url }}
   ```
2. This is already configured in our workflow, but may be needed if you modify it

### Issue: Workflow fails with permissions error

**Solution**:

1. Go to **Settings** > **Actions** > **General**
2. Under **Workflow permissions**, select:
   - **Read and write permissions**
   - Check **Allow GitHub Actions to create and approve pull requests**
3. Under **Pages** > **Source**, select: **GitHub Actions** (not "Deploy from a branch")

### Issue: 404 on deployed site

**Solution**:

1. Verify the build output in the workflow logs
2. Check that `dist/index.html` exists in the build
3. Ensure the build process completed successfully

## Expected Workflow

Once set up correctly:

1. **Development**: Work on feature branches
2. **Integration**: Create PR to main branch
3. **Quality Gates**: Automated checks run (tests, linting, coverage)
4. **Merge**: After approval, merge to main
5. **Deployment**: Automatic deployment to GitHub Pages
6. **Live Site**: Changes appear at your GitHub Pages URL

## Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file to your `dist` folder during build
2. Update the GitHub Actions workflow to include:
   ```yaml
   - name: Deploy to GitHub Pages
     uses: peaceiris/actions-gh-pages@v3
     with:
       github_token: ${{ secrets.GITHUB_TOKEN }}
       publish_dir: ./dist
       cname: your-domain.com
   ```
3. Configure DNS settings with your domain provider

---

Your VIM for Kids game will be live and automatically deployed with every change to the main branch! 🚀
