const replace = require('replace-in-file');
const fs = require('fs-extra');
const execa = require('execa');
const { join, resolve } = require('path');
const chalk = require('chalk');
const archiver = require('archiver');

/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

let renderBundle;

const convertImagePathToBase64 = async path => {
  const componentPath = process.cwd();
  const errorPrint = error => {
    if (error) {
      return console.error(error.message);
    }
  };
  await replace(
    {
      files: resolve(path),
      from: [/"icon"[\s|\r\n]*:[\s|\r\n]*"(.*\.(.*))"/g],
      to: (match, iconPath, extension) => {
        if (!['png', 'svg'].includes(extension)) {
          throw Error('Invalid icon format.');
        }
        const base64 = fs.readFileSync(resolve(componentPath, iconPath), 'base64');
        if (extension === 'png') {
          return `"icon": "data:image/png;base64,${base64}"`;
        } else {
          return `"icon": "data:image/svg+xml;base64,${base64}"`;
        }
      }
    },
    errorPrint
  );
};

const bundle = async ({ currentProcessDir, package = false }) => {
  try {
    console.log(chalk.gray('Building bundle...'));

    renderBundle?.cancel?.();

    const distPath = join(currentProcessDir, 'dist');
    const distContentPath = join(distPath, 'content');

    renderBundle = execa('npm', ['run', 'build']);
    await renderBundle;

    //Convert icon to base64
    await fs.copy(
      join(currentProcessDir, 'definition.json'),
      join(distContentPath, 'definition.json')
    );
    await convertImagePathToBase64(join(distContentPath, 'definition.json'));
    try {
      await fs.rename(join(distContentPath, 'style.css'), join(distContentPath, 'render.css'));
    } catch {}
    await fs.copy(join(currentProcessDir, 'package.json'), join(distContentPath, 'package.json'));
    await fs.copy(join(currentProcessDir, 'locales'), join(distContentPath, 'locales'));

    //Compress Bundle
    if (package) {
      console.log(chalk.gray('Compressing bundle...'));
      const { version, name } = await fs.readJson(join(distContentPath, 'package.json'));
      const bundleName = `${name}-bundle-${version}.inc`;
      await zipDirectory(distContentPath, join(distPath, bundleName));
      console.log(
        chalk(`${chalk.green('✅ ')} Your bundle is ready at ${chalk.cyan(`dist/${bundleName}`)} `)
      );
    } else {
      console.log(chalk(`${chalk.green('✅ Done')}`));
    }
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = {
  bundle
};
