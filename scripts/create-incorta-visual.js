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
  .description("Create a new Incorta visual")
  .action((directory) => {
    checkBeforeInit();
    initProject(directory, createIncortaVisual);
  });

createIncortaVisual
  .command("start")
  .description("Start development server")
  .action(() => {
    runDevServer();
  });

createIncortaVisual
  .command("package")
  .description("Build visualization and generate bundle.inc file")
  .action(() => {
    createBuildPackage();
  });

createIncortaVisual.parse(process.argv);
