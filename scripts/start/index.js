const createDevBundle = require("./create-dev-bundle");
const serveBundleFiles = require("./serve-bundle-files");
const replaceBundleFiles = require("./replace-bundle-files");

const runDevServer = async () => {
  try {
    await createDevBundle(); // continuosly creating bundle.modern.js
    await replaceBundleFiles(); // watch on bundle.modern.js and create bundle.js
    serveBundleFiles(); // watch on bundle.js to update the client
  } catch (e) {
    console.log(e);
  }
};

module.exports = runDevServer;
