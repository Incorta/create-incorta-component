const { join } = require('path');
const fse = require('fs-extra');
const chalk = require('chalk');

const validateDirectory = async directory => {
  const currentProcessDir = process.cwd();
  const newComponentPath = join(currentProcessDir, directory);

  const pathExists = await fse.pathExists(newComponentPath);

  if (pathExists) {
    const stat = await fse.stat(newComponentPath);
    const isDirectory = stat.isDirectory();
    if (!isDirectory) {
      console.log(chalk.red('The path you provided is not a directory 🚨'));
      process.exit(0);
    }
    const files = await fse.readdir(newComponentPath);
    if (files.length > 1) {
      console.log(chalk.red('The directory you provided is not empty 🚨'));
      process.exit(0);
    }
  }
};

module.exports = validateDirectory;
