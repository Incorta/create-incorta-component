"use strict";

const { Command } = require("commander");

const initProject = require("./init-project");
const createBuildPackage = require("./create-build-package");
const runDevServer = require("./runDevServer");

const checkBeforeInit = require("../utils/check-requirements");

const createIncortaVisual = new Command("create-incorta-visual");

createIncortaVisual
  .arguments("[directory]")
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
