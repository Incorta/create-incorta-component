const replace = require('replace-in-file');
const fs = require('fs-extra');
const execa = require('execa');
const { join, resolve } = require('path');
const chalk = require('chalk');
const rimraf = require('rimraf');
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
let definitionBundle;

const fixImport = async path => {
  const visualizationPath = process.cwd();
  const errorPrint = error => {
    if (error) {
      return console.error('Error occurred:', error);
    }
  };

  await replace(
    {
      files: resolve(path),
      from: [/import\*as(.+)from"react";/g, /import \* as (.+) from 'react';/g],
      to: (match, group) => {
        return `const ${group} = window.React;`;
      }
    },
    errorPrint
  );

  await replace(
    {
      files: resolve(path),
      from: [/import\*as(.+)from('|")react-dom('|");/g, /import \* as (.+) from 'react-dom';/g],
      to: (match, group) => {
        return `const ${group} = window.ReactDom;`;
      }
    },
    errorPrint
  );

  await replace(
    {
      files: resolve(path),
      from: [/import (.) from"(.*\.(png|svg))";/g, /import(.+)from '(.*\.(png|svg))';/g],
      to: (match, group1, group2) => {
        const paths = group2.split('/');
        const name = paths[paths.length - 1];
        const base64 = fs.readFileSync(resolve(visualizationPath, 'assets', name), 'base64');
        if (group2.indexOf('.png') > -1) {
          return `const ${group1} = "data:image/png;base64,${base64}";`;
        } else {
          return `const ${group1} = "data:image/svg+xml,${base64}";`;
        }
      }
    },
    errorPrint
  );
};

const bundle = async ({ currentProcessDir, package = false }) => {
  try {
    console.log(chalk.gray('Building bundle...'));

    definitionBundle?.cancel?.();
    renderBundle?.cancel?.();

    const srcPath = join(currentProcessDir, 'src');
    const tempPath = join(currentProcessDir, `.civ_temp`);
    const distPath = join(currentProcessDir, 'dist');
    const distContentPath = join(distPath, 'content');
    const createIncortaVisualRootPath = resolve(__dirname, '..');

    const microBundleScriptPath = join(
      createIncortaVisualRootPath,
      './node_modules/microbundle/dist/cli.js'
    );

    const getMicroBundleParams = (inputPath, outputPath) => [
      '-i',
      join(srcPath, inputPath),
      '-o',
      join(tempPath, outputPath),
      '--jsx',
      'React.createElement',
      '--external',
      '.*/assets/.*,.*\\\\assets\\\\.*',
      '--jsxImportSource',
      '-f',
      'esm',
      ...(package ? ['--no-sourcemap', '--no-generateTypes'] : ['--no-compress'])
    ];

    renderBundle = execa('node', [
      microBundleScriptPath,
      ...getMicroBundleParams('index.tsx', 'render.js')
    ]);
    definitionBundle = execa('node', [
      microBundleScriptPath,
      ...getMicroBundleParams('definition.ts', 'definition.js')
    ]);

    try {
      await renderBundle;
      await definitionBundle;
    } catch (error) {
      //Remove temp folder
      rimraf.sync(tempPath, { recursive: true });
      return;
    }

    //Fix react&react-dom imports
    await fixImport(join(tempPath, 'render.modern.js'));
    //Fix image import (Convert image path to base64)
    await fixImport(join(tempPath, 'definition.modern.js'));

    await fs.copy(join(tempPath, 'render.modern.js'), join(distContentPath, 'render.js'));
    await fs.copy(join(tempPath, 'definition.modern.js'), join(distContentPath, 'definition.js'));
    await fs.copy(join(tempPath, 'render.css'), join(distContentPath, 'render.css'));
    await fs.copy(join(currentProcessDir, 'package.json'), join(distContentPath, 'package.json'));

    //Remove temp folder
    rimraf.sync(tempPath, { recursive: true });

    //Compress Bundle
    if (package) {
      console.log(chalk.gray('Compressing bundle...'));
      await zipDirectory(distContentPath, join(distPath, 'bundle.inc'));
      console.log(
        chalk(`${chalk.green('✅ ')} Your bundle is ready at ${chalk.cyan('dist/bundle.inc')} `)
      );
    } else {
      console.log(chalk(`${chalk.green('✅ Done')}`));
    }
  } catch (e) {}
};

module.exports = {
  bundle
};
