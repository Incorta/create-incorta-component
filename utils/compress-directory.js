const fs = require('fs-extra');
const archiver = require('archiver');
const { join } = require('path');

const compressDirectory = (source, out) => {
  const bundleJs = join(source, 'bundle.js');
  const bundleCss = join(source, 'bundle.css');
  const packageJSON = join(source, 'package.json');

  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .append(fs.createReadStream(bundleJs), {
        name: 'bundle.js'
      })
      .append(fs.createReadStream(packageJSON), {
        name: 'package.json'
      })
      .append(fs.createReadStream(bundleCss), {
        name: 'bundle.css'
      })
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
};

module.exports = compressDirectory;
