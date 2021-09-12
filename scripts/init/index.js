const chalk = require('chalk');
const fse = require('fs-extra');
const { resolve, join } = require('path');

const promptUser = require('../../utils/prompt-user');
const validateDirectory = require('../../utils/validate-directory');

const generateFiles = require('./generate-files');

async function initProject(dir, program) {
  const packageRootPath = resolve(__dirname, '../..');

  const artPath = join(packageRootPath, 'utils', 'art.text');
  const art = fse.readFileSync(artPath).toString();
  console.log(chalk.cyan(art));

  const prompt = await promptUser(dir, program.template);
  const directory = prompt.directory || dir;

  await validateDirectory(directory);

  const options = {
    description: prompt.description,
    author: prompt.author,
    directory
  };
  return generateFiles(directory, options).then(() => {
    if (process.platform === 'win32') {
      process.exit(0);
    }
  });
}

module.exports = initProject;
