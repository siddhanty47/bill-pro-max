#!/bin/bash

# Bill Pro Max Webapp Development Setup Script

echo "🚀 Setting up Bill Pro Max Webapp for development..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "src/App.tsx" ]; then
    echo "❌ Error: This script must be run from the bill-pro-max-webapp directory"
    exit 1
fi

# Check if the library directory exists
if [ ! -d "../bill-pro-max" ]; then
    echo "❌ Error: bill-pro-max library directory not found at ../bill-pro-max"
    echo "Please ensure both repositories are in the same parent directory:"
    echo "  parent-directory/"
    echo "  ├── bill-pro-max/"
    echo "  └── bill-pro-max-webapp/"
    exit 1
fi

echo "✅ Found bill-pro-max library at ../bill-pro-max"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the library first
echo "🔨 Building the bill-pro-max library..."
cd ../bill-pro-max
npm install
npm run build
cd ../bill-pro-max-webapp

echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  npm start"
echo ""
echo "The webapp will import the library from ../bill-pro-max/src/index"
echo ""
echo "Note: If you make changes to the library, you'll need to rebuild it:"
echo "  cd ../bill-pro-max && npm run build"
