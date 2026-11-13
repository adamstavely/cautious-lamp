// Makes the `ds` bin executable and checks it starts with a node shebang.
const fs = require('fs');
const path = require('path');

const bin = path.join(__dirname, '..', 'dist', 'cli.js');
const firstLine = fs.readFileSync(bin, 'utf-8').split('\n', 1)[0];
if (firstLine !== '#!/usr/bin/env node') {
  console.error(`dist/cli.js must start with '#!/usr/bin/env node' (found: ${firstLine})`);
  process.exit(1);
}
fs.chmodSync(bin, 0o755);
