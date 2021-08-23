"use strict";

const { Command } = require("commander");

const runInit = require("./init/index");
const runPackage = require("./package/index");
const runStart = require("./start/index");

const checkBeforeInit = require("../utils/check-requirements");

const createIncortaVisual = new Command("create-incorta-visual");

const packageJson = require("../package.json");

createIncortaVisual
  .arguments("[directory]")
  .version(packageJson.version)
  .description("Create a new Incorta visual")
  .action((directory) => {
    checkBeforeInit();
    runInit(directory, createIncortaVisual);
  });

createIncortaVisual
  .command("start")
  .description("Start development server")
  .action(() => {
    runStart();
  });

createIncortaVisual
  .command("package")
  .description("Build visualization and generate bundle.inc file")
  .action(() => {
    runPackage();
  });

createIncortaVisual.parse(process.argv);
