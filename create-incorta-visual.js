"use strict";

const { Command } = require("commander");
const initProject = require("./init-project");
const createBuildPackage = require("./create-build-package");
const checkBeforeInit = require("./utils/check-requirements");

const createIncortaVisual = new Command("create-incorta-visual");

createIncortaVisual
  .command("package")
  .description("build visualization")
  .action(() => {
    createBuildPackage();
  })
  .parse(process.argv);

createIncortaVisual
  .command("dev")
  .description("Open development server")
  .action(() => {
    console.log("dev");
  })
  .parse(process.argv);

createIncortaVisual
  .arguments("[directory]")
  .description("create a new application")
  .action((directory) => {
    checkBeforeInit();
    initProject(directory, createIncortaVisual);
  })
  .parse(process.argv);
