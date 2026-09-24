#!/usr/bin/env node
/**
 * Cleanup Utility — Removes temporary cache and build artifacts
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIRS_TO_CLEAN = ['__pycache__', '.pytest_cache', 'build', 'dist'];

function removeDirectoryRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      removeDirectoryRecursive(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }
  fs.rmdirSync(dirPath);
}

function walkAndClean(root) {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (DIRS_TO_CLEAN.includes(entry.name)) {
        console.log(`[CLEAN] Removing: ${path.relative(PROJECT_ROOT, full)}`);
        removeDirectoryRecursive(full);
      } else if (entry.name !== 'node_modules' && entry.name !== '.git') {
        walkAndClean(full);
      }
    }
  }
}

console.log('[CLEAN] Cleaning temporary files and caches...');
walkAndClean(PROJECT_ROOT);
console.log('[CLEAN] Done.');
