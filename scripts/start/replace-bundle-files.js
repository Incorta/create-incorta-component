const fs = require("fs-extra");
const createWatcher = require("../../utils/create-watcher");
const { join } = require("path");
const { MICROBUNDLE_FILE } = require("../../utils/const");
const {
  createBundleTempFile,
  replaceInFiles,
  createBundleServedFile,
} = require("../../utils/dist-utils");

/*
    bundle.modern.js => created by microbundle
    bundle-before-replacement.js => copy to do all the replacements needed
    bundle.js => served to the client
*/

const watchOnBundleModernOnly = () => {
  const watcher = createWatcher(MICROBUNDLE_FILE);
  watcher.on("change", async (path) => {
    await createBundleTempFile();
    await replaceInFiles();
    await createBundleServedFile();
  });
};

const watchOnDistDirectory = () => {
  const visualizationPath = process.cwd();
  const watcher = createWatcher("");
  watcher.on("add", async (path) => {
    if (path === join(visualizationPath, "dist", MICROBUNDLE_FILE)) {
      await createBundleTempFile();
      await replaceInFiles();
      await createBundleServedFile();
      watchOnBundleModernOnly();
    }
  });
};

const replaceBundleFiles = async () => {
  const visualizationPath = process.cwd();
  const bundleModernExists = fs.existsSync(
    join(visualizationPath, "dist", MICROBUNDLE_FILE)
  );

  if (bundleModernExists) {
    watchOnBundleModernOnly();
  } else {
    watchOnDistDirectory();
  }
};

module.exports = replaceBundleFiles;
