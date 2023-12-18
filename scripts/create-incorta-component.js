'use strict';

const { Command } = require('commander');

const runInit = require('./init/index');
const runPackage = require('./package/index');
const runStart = require('./start/index');
const runTest = require('./test/index');
const runGenerate = require('./generate/index');

const checkBeforeInit = require('../utils/check-requirements');

const createIncortaComponent = new Command('create-incorta-component');

const packageJson = require('../package.json');

createIncortaComponent.version(packageJson.version);

createIncortaComponent
  .command('new')
  .description('Create a new Incorta Component')
  .arguments('[directory]')
  .action(directory => {
    checkBeforeInit();
    runInit(directory, createIncortaComponent);
  });

createIncortaComponent
  .command('start')
  .description('Start development server')
  .action(() => {
    runStart();
  });

createIncortaComponent
  .command('test')
  .description('Run testing using vitest')
  .action(() => {
    runTest();
  });

createIncortaComponent
  .command('generate')
  .description('Generate definition types')
  .action(() => {
    runGenerate();
  });

createIncortaComponent
  .command('package')
  .description('Build component and generate bundle file')
  .action(() => {
    runPackage();
  });

createIncortaComponent.parse(process.argv);
