#!/bin/bash

# Installation script for structlint

echo "📦 Installing structlint..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install as dev dependency
npm install --save-dev .

# Or install globally (may require sudo)
# sudo npm install -g .

echo "✅ structlint installed successfully!"
echo ""
echo "Usage:"
echo "  npx structlint analyze       - Analyze project structure"
echo "  npx structlint fix           - Interactively fix issues"
echo "  npx structlint check-git     - Check Git status"
echo ""
echo "For global installation, run:"
echo "  sudo npm install -g /path/to/structlint"
