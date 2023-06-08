const path = require('path');
const shelljs = require('shelljs');

async function runDevServer() {
  try {
    let rootDir = path.resolve(__dirname, '../..');
    let viteBinPath = path.join(rootDir, 'node_modules', '.bin', 'vite');
    let configFilePath = path.resolve(__dirname, './vite-config-dev.js');
    shelljs.exec(`${viteBinPath} build --watch --config "${configFilePath}"`);
  } catch (e) {
    console.log(e);
  }
}

module.exports = runDevServer;
