const path = require('path');
const shelljs = require('shelljs');

async function runDevServer() {
  try {
    let vitePath = require.resolve('vite');
    let viteBinPath = path.join(vitePath, '../..', '.bin', 'vite');
    let configFilePath = path.resolve(__dirname, './vite-config-dev.js');
    shelljs.exec(`${viteBinPath} build --watch --config "${configFilePath}"`);
  } catch (e) {
    console.log(e);
  }
}

module.exports = runDevServer;
