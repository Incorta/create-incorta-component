const chalk = require('chalk');
const fse = require('fs-extra');
const { join, resolve } = require('path');
const shelljs = require('shelljs');

const componentPackageJsonGenerator = require('../../resources/templates/package.json.js');
const definitionJsonGenerator = require('../../resources/templates/definition.json.js');
const componentIndexGenerator = require('../../resources/templates/index.tsx.js');

const createPackageJSON = async ({ options, newComponentPath }) => {
  const { directory, author, description } = options;
  await fse.writeJSON(
    join(newComponentPath, 'package.json'),
    componentPackageJsonGenerator({
      directory,
      author,
      description
    }),
    {
      spaces: 2
    }
  );
};

const createDefinitionJson = async ({ options, newComponentPath }) => {
  const { description, directory } = options;
  await fse.writeJSON(
    join(newComponentPath, 'definition.json'),
    definitionJsonGenerator({
      directory,
      description
    }),
    {
      spaces: 2
    }
  );
};

const createComponentIndexFile = async ({ options, newComponentPath }) => {
  let { component, index, pascalCaseName } = componentIndexGenerator(options);

  const indexPath = join(newComponentPath, 'src', 'index.tsx');
  await fse.writeFile(indexPath, index);

  const componentPath = join(newComponentPath, 'src', `${pascalCaseName}.tsx`);
  await fse.writeFile(componentPath, component);
};

const createGitIgnoreFile = async ({ newComponentPath }) => {
  const gitignorePath = join(newComponentPath, '.gitignore');
  console.log('gitignorePath', gitignorePath);
  await fse.writeFile(
    gitignorePath,
    `/.idea
node_modules
/coverage
build
dist
.civ_temp
.rpt2_cache
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
`
  );
};

async function generateFiles(directory, options) {
  // Place where process is opened
  const currentProcessDir = process.cwd();

  // Root path of create-incorta-component
  const packageRootPath = resolve(__dirname, '../..');

  // new Component Path
  const newComponentPath = join(currentProcessDir, directory);

  const resources = join(packageRootPath, 'resources');
  const resourcesFiles = join(resources, 'files');

  console.log(chalk.gray(`Creating a new Incorta component at ${chalk.green(directory)}.`));
  console.log(chalk.gray('Creating your files...'));

  try {
    await fse.copy(resourcesFiles, newComponentPath);
    await createPackageJSON({ options, newComponentPath });
    await createDefinitionJson({ options, newComponentPath });
    await createComponentIndexFile({ options, newComponentPath });
    await createGitIgnoreFile({ newComponentPath });

    console.log(chalk.grey('Installing dependencies...'));

    shelljs.exec('npm install', {
      stdio: 'inherit',
      cwd: newComponentPath
    });

    console.log(chalk.grey('Initialize git repo...'));

    try {
      shelljs.exec('git init', {
        stdio: 'inherit',
        cwd: newComponentPath
      });
      shelljs.exec('git add -A', {
        stdio: 'inherit',
        cwd: newComponentPath
      });
      shelljs.exec('git commit -m init', {
        stdio: 'inherit',
        cwd: newComponentPath
      });
    } catch (e) {
      console.warn('Git repo not initialized', e);
    }

    console.log(successMessage(directory));
  } catch (e) {
    console.log(e);
  }
  return Promise.resolve(directory);
}

const successMessage = directory => `

        ${chalk.gray.underline('Files created successfully 🎉🎉🎉')}

        ${chalk('Go to your project directory:')}

        ${chalk.cyan(`cd ${directory.replace(/(\s+)/g, '\\$1')}`)}

        ${chalk('Start your dev server by running:')}

        ${chalk.cyan('create-incorta-component start')}

        ${chalk('or package your component by running:')}

        ${chalk.cyan('create-incorta-component package')}

`;

module.exports = generateFiles;
