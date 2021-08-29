const chalk = require('chalk');
const fse = require('fs-extra');
const { join, resolve } = require('path');
const execa = require('execa');

const visualizationPackageJsonGenerator = require('../../resources/templates/package.json.js');
const visualizationIndexGenerator = require('../../resources/templates/index.tsx.js');

const createPackageJSON = async ({ options, newVisualPath }) => {
  const { directory, author, description } = options;
  await fse.writeJSON(
    join(newVisualPath, 'package.json'),
    visualizationPackageJsonGenerator({
      directory,
      author,
      description
    }),
    {
      spaces: 2
    }
  );
};

const createVisualizationIndexFile = async ({ options, newVisualPath }) => {
  const indexPath = join(newVisualPath, 'src', 'index.tsx');
  await fse.writeFile(indexPath, visualizationIndexGenerator(options));
};

async function generateFiles(directory, options) {
  // Place where process is opened
  const currentProcessDir = process.cwd();

  // Root path of create-incorta-visual
  const packageRootPath = resolve(__dirname, '../..');

  // new Visual Path
  const newVisualPath = join(currentProcessDir, directory);

  const resources = join(packageRootPath, 'resources');
  const resourcesFiles = join(resources, 'files');

  console.log(chalk.gray(`Creating a new Incorta visual at ${chalk.green(directory)}.`));
  console.log(chalk.gray('Creating your files...'));

  try {
    await fse.copy(resourcesFiles, newVisualPath);
    await createPackageJSON({ options, newVisualPath });
    await createVisualizationIndexFile({ options, newVisualPath });

    console.log(chalk.grey('Installing dependencies...'));
    if (options.useYarn) {
      await execa('yarn', {
        stdio: 'inherit',
        cwd: newVisualPath
      });
    } else {
      await execa('npm', ['install'], {
        stdio: 'inherit',
        cwd: newVisualPath
      });
    }

    console.log(successMessage(directory));
  } catch (e) {
    console.error(e);
  }
  return Promise.resolve(directory);
}

const successMessage = directory => `

        ${chalk.gray.underline('Files created successfully 🎉🎉🎉')}

        ${chalk('Go to your project directory:')}

        ${chalk.cyan(`cd ${directory}`)}

        ${chalk('Start your dev server by running:')}

        ${chalk.cyan('create-incorta-visual start')}

        ${chalk('or package your visualization by running:')}

        ${chalk.cyan('create-incorta-visual package')}

`;

module.exports = generateFiles;
