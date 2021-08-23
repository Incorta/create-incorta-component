const chokidar = require("chokidar");
const { join } = require("path");

const createWatcher = (file) => {
  const currentProcessDir = process.cwd();
  const distPath = join(currentProcessDir, "dist");
  const bundleJsFilePath = join(distPath, file);

  const watcher = chokidar.watch(bundleJsFilePath, {
    persistent: true,
    interval: 4000,
  });

  return watcher;
};

module.exports = createWatcher;
