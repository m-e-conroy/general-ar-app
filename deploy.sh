#!/bin/bash
# Deploy script for GitHub Pages

# Exit on error
set -e

echo "Building application..."
npm run build

echo "Creating dist directory..."
rm -rf dist
mkdir -p dist

echo "Copying files to dist..."
cp index.html dist/
cp styles.css dist/
cp main.js dist/
cp favicon.svg dist/
cp -r js dist/
cp -r assets dist/

# Copy minified files if they exist
if [ -f "main.min.js" ]; then
    cp main.min.js dist/
fi
if [ -f "styles.min.css" ]; then
    cp styles.min.css dist/
fi
if [ -d "js" ]; then
    find js -name "*.min.js" -exec cp {} dist/js/ \; 2>/dev/null || true
fi

echo "Creating .nojekyll file..."
touch dist/.nojekyll

echo "Deploying to GitHub Pages..."
npx gh-pages -d dist

echo "Deployment complete!"
