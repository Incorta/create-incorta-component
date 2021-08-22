const createDevBundle = require("./create-dev-bundle");
const serveBundleFiles = require("./serve-bundle-files");

const runDevServer = async () => {
  try {
    createDevBundle();
    serveBundleFiles();
  } catch (e) {
    console.log(e);
  }
};

module.exports = runDevServer;
