const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const chalk = require('chalk');
const { resolvePath } = require('../utils');
const { execSync } = require('child_process');

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

const createAssistantPackage = async () => {
  try {
    console.log(chalk.blue('📦 Building assistant package...'));
    
    // Clean previous builds
    const distPath = resolvePath('dist');
    const assistantDistPath = path.join(distPath, 'assistant', 'content');
    
    // if (await fs.pathExists(assistantDistPath)) {
    //   console.log(chalk.gray('Cleaning previous build...'));
    //   await fs.remove(assistantDistPath);
    // }

    // Build the frontend component using the assistant production config
    let vitePath = require.resolve('vite');
    let viteBinPath = path.join(vitePath, '../..', '.bin', 'vite');
    let configFilePath = path.resolve(__dirname, './vite-config-prod.js');
    execSync(`${viteBinPath} build --config "${configFilePath}"`);

    // Ensure visualization_result.json exists in the assistant directory
    const visResultPath = path.join(assistantDistPath, 'visualization_result.json');
    const rootVisPath = path.join(process.cwd(), 'visualization_result.json');
    
    if (await fs.pathExists(rootVisPath)) {
      console.log(chalk.blue('📊 Copying visualization_result.json from root...'));
      await fs.copy(rootVisPath, visResultPath);
    } else if (!await fs.pathExists(visResultPath)) {
      console.log(chalk.blue('📊 Creating empty visualization_result.json...'));
      await fs.writeJson(visResultPath, {}, { spaces: 2 });
    }

    // Create the bundle
    console.log(chalk.gray('🗜️  Compressing assistant bundle...'));
    const packageJsonPath = path.join(assistantDistPath, 'package.json');
    
    let bundleName;
    if (await fs.pathExists(packageJsonPath)) {
      const { version, name } = await fs.readJson(packageJsonPath);
      bundleName = `${name}-bundle-${version}.inc`;
    } 
    
    const bundlePath = path.join(distPath, bundleName);
    await zipDirectory(assistantDistPath, bundlePath);

    console.log(
      chalk.green('✅ Assistant package created successfully!')
    );
    console.log(
      chalk.cyan(`📦 Bundle: ${bundleName}`)
    );
    console.log(
      chalk.cyan(`📁 Location: dist/${bundleName}`)
    );

  } catch (e) {
    console.log(chalk.red('❌ Error creating assistant package:'));
    console.log(e);
  }
};

module.exports = createAssistantPackage;
