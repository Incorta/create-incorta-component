const path = require('path');

let scriptPath = process.cwd();

function resolvePath(paths) {
  if (Array.isArray(paths)) {
    return paths.map(p => path.resolve(scriptPath, p));
  } else {
    return path.resolve(scriptPath, paths);
  }
}

module.exports = {
  scriptPath,
  resolvePath
};
