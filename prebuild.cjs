const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, 'dist');
fs.rmSync(dir, { recursive: true, force: true });
