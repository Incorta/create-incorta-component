const createDevBundle = require('./create-dev-bundle');
const serveBundleFiles = require('./serve-bundle-files');
const replaceBundleFiles = require('./replace-bundle-files');
const { addPackageJSONToBundle } = require('../../utils/dist-utils');

const runDevServer = async () => {
  try {
    await createDevBundle(); // continuously creating bundle.modern.js
    await replaceBundleFiles(); // watch on bundle.modern.js and create bundle.js
    await addPackageJSONToBundle();
    serveBundleFiles(); // watch on bundle.js to update the client
  } catch (e) {
    console.log(e);
  }
};

module.exports = runDevServer;
