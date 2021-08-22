"use strict";

const { Command } = require("commander");

const initProject = require("./init-project");
const createBuildPackage = require("./create-build-package");
const runDevServer = require("./run-dev-server");

const checkBeforeInit = require("../utils/check-requirements");

const createIncortaVisual = new Command("create-incorta-visual");

const packageJson = require("../package.json");

createIncortaVisual
  .arguments("[directory]")
  .version(packageJson.version)
  .description("Create a new application")
  .action((directory) => {
    checkBeforeInit();
    initProject(directory, createIncortaVisual);
  });

createIncortaVisual
  .command("start")
  .description("Open development server")
  .action(() => {
    runDevServer();
  });

createIncortaVisual
  .command("package")
  .description("Build visualization")
  .action(() => {
    createBuildPackage();
  });

createIncortaVisual.parse(process.argv);
