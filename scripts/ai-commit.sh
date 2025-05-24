#!/bin/bash

# AI Commit Function - Creates conventional commits with temporary files
# Usage: ai_commit <type> <scope> <description> <detailed_body>

ai_commit() {
    local type="$1"
    local scope="$2"
    local description="$3"
    local body="$4"

    # Create temporary commit message file
    local temp_file=$(mktemp)

    # Generate conventional commit message
    cat > "$temp_file" << EOF
$type($scope): $description

$body

This commit follows conventional commit standards for automated tooling
and improved project history tracking.
EOF

    # Commit using temporary file
    git commit -F "$temp_file"

    # Clean up temporary file
    rm -f "$temp_file"

    echo "✅ Conventional commit completed with proper formatting"
}

# Export the function so it can be used
export -f ai_commit

# If script is called directly, use arguments
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if [ $# -ne 4 ]; then
        echo "Usage: $0 <type> <scope> <description> <body>"
        echo "Example: $0 feat pages 'Add GitHub Pages deployment' 'Implement automated deployment with environment configuration'"
        exit 1
    fi

    ai_commit "$1" "$2" "$3" "$4"
fi
