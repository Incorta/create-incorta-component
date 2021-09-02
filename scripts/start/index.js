const serveBundleFiles = require('./serve-bundle-files');
const { bundle } = require('../../utils/dist-utils');
const chokidar = require('chokidar');
const { join } = require('path');

const runDevServer = async () => {
  try {
    const currentProcessDir = process.cwd();
    await bundle({ currentProcessDir, package: false });
    serveBundleFiles({ currentProcessDir }); // watch on bundle.js to update the client
    const watcher = chokidar.watch(
      [join(currentProcessDir, 'src'), join(currentProcessDir, 'package.json')],
      {
        persistent: true,
        awaitWriteFinish: true,
        disableGlobbing: true,
        ignoreInitial: true
      }
    );
    watcher.on('change', path => {
      bundle({ currentProcessDir, package: false });
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports = runDevServer;
