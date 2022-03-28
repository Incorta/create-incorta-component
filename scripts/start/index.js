const path = require('path');
const shelljs = require('shelljs');

async function runDevServer() {
  try {
    let configFilePath = path.resolve(__dirname, './vite-config-dev.js');
    shelljs.exec(`npx vite build --watch --config "${configFilePath}"`);
  } catch (e) {
    console.log(e);
  }
}

module.exports = runDevServer;
