// Marks dist/esm as an ES module package so Node treats dist/esm/index.js as ESM
// (the package root stays CommonJS for dist/index.js).
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', 'dist', 'esm', 'package.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ type: 'module' }, null, 2) + '\n');
