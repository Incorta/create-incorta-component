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
    console.log(chalk.blue('🔨 Building frontend component...'));
    let vitePath = require.resolve('vite');
    let viteBinPath = path.join(vitePath, '../..', '.bin', 'vite');
    let configFilePath = path.resolve(__dirname, './vite-config-prod.js');
    console.log(configFilePath);
    execSync(`${viteBinPath} build --config "${configFilePath}"`);

    // Ensure visualization_result.json exists in the assistant directory
    const visResultPath = path.join(assistantDistPath, 'visualization_result.json');
    if (!await fs.pathExists(visResultPath)) {
      console.log(chalk.blue('📊 Creating empty visualization_result.json...'));
      await fs.writeJson(visResultPath, {}, { spaces: 2 });
    }

    // Create a startup script
//     const startupScript = `#!/bin/bash
// # Assistant Server Startup Script

// echo "🚀 Starting Incorta Assistant Server..."

// # Check if node_modules exists
// if [ ! -d "node_modules" ]; then
//     echo "📦 Installing dependencies..."
//     cp server-package.json package.json
//     npm install
// fi

// echo "🔄 Starting server..."
// node server.js
// `;

//     await fs.writeFile(path.join(assistantDistPath, 'start.sh'), startupScript);
//     await fs.chmod(path.join(assistantDistPath, 'start.sh'), '755');

//     // Create Windows batch file
//     const startupBat = `@echo off
// echo 🚀 Starting Incorta Assistant Server...

// if not exist node_modules (
//     echo 📦 Installing dependencies...
//     copy server-package.json package.json
//     npm install
// )

// echo 🔄 Starting server...
// node server.js
// pause
// `;

//     await fs.writeFile(path.join(assistantDistPath, 'start.bat'), startupBat);

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
