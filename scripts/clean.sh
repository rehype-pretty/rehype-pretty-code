#!/usr/bin/env bash

# remove dist folders recursively
find . -type d -name "dist" -exec rm -rf {} \;

# remove .turbo folders recursively
find . -type d -name ".turbo" -exec rm -rf {} \;

# remove out folders recursively

# remove node_modules folders recursively
find . -type d -name "node_modules" -exec rm -rf {} \;
