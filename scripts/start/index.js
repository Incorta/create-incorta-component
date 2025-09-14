const path = require('path');
const { execSync } = require('child_process');

const fse = require('fs-extra');

async function runDevServer() {
  try {
    let vitePath = require.resolve('vite');
    let viteBinPath = path.join(vitePath, '../..', '.bin', 'vite');

    // Detect assistant project by marker file
    const markerPath = path.resolve(process.cwd(), '.incorta-assistant.json');
    const isAssistant = await fse.pathExists(markerPath);

    let configFilePath = isAssistant
      ? path.resolve(__dirname, '../start-assistant/vite-config-assistant-dev.js')
      : path.resolve(__dirname, './vite-config-dev.js');
      
    execSync(`${viteBinPath} build --watch --config "${configFilePath}"`);
  } catch (e) {
    console.log(e);
  }
}

module.exports = runDevServer;
