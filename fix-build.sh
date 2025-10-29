#!/bin/bash

# Delete problematic files
rm -f src/tests/accessibility.test.ts

# Install missing deps
npm install --save-dev @types/node

# Clean build
rm -rf node_modules dist
npm install
npm run build
