#!/bin/bash

# Conventional Commit Helper Script
# Usage: ./scripts/commit-helper.sh <type> <scope> <description> <body>

set -e

# Function to show usage
show_usage() {
    echo "Usage: $0 <type> <scope> <description> <body>"
    echo ""
    echo "Types:"
    echo "  feat     - A new feature"
    echo "  fix      - A bug fix"
    echo "  docs     - Documentation only changes"
    echo "  style    - Changes that do not affect the meaning of the code"
    echo "  refactor - A code change that neither fixes a bug nor adds a feature"
    echo "  test     - Adding missing tests or correcting existing tests"
    echo "  chore    - Changes to the build process or auxiliary tools"
    echo "  ci       - Changes to CI configuration files and scripts"
    echo ""
    echo "Example:"
    echo "  $0 feat github-pages 'Add automated deployment' 'Implement GitHub Pages deployment with proper environment configuration and permissions handling.'"
    exit 1
}

# Check arguments
if [ $# -lt 4 ]; then
    show_usage
fi

TYPE="$1"
SCOPE="$2"
DESCRIPTION="$3"
BODY="$4"

# Validate type
case "$TYPE" in
    feat|fix|docs|style|refactor|test|chore|ci)
        ;;
    *)
        echo "Error: Invalid type '$TYPE'"
        show_usage
        ;;
esac

# Create temporary commit message file
TEMP_FILE=$(mktemp /tmp/commit_message_XXXXXX.txt)

# Write conventional commit message to temp file
cat > "$TEMP_FILE" << EOF
$TYPE($SCOPE): $DESCRIPTION

$BODY

This commit follows conventional commit standards for better project history
and automated tooling integration.
EOF

echo "Generated commit message:"
echo "========================"
cat "$TEMP_FILE"
echo "========================"

# Ask for confirmation
read -p "Commit with this message? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Commit using the temporary file
    git commit -F "$TEMP_FILE"
    echo "✅ Committed successfully!"
else
    echo "❌ Commit cancelled"
fi

# Clean up temporary file
rm -f "$TEMP_FILE"
echo "🧹 Temporary file cleaned up"
