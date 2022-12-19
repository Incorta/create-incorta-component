const path = require('path');
const vite = require('vite');

let scriptPath = process.cwd();

function resolvePath(paths) {
  if (Array.isArray(paths)) {
    return paths.map(p => vite.normalizePath(path.resolve(scriptPath, p)));
  } else {
    return vite.normalizePath(path.resolve(scriptPath, paths));
  }
}

module.exports = {
  scriptPath,
  resolvePath
};
