"use strict";

const { Command } = require("commander");
const packageJson = require("./package.json");
const initProject = require("./init-project");

const program = new Command(packageJson.name);

program
  .version(packageJson.version)
  .arguments("[directory]")
  .description("create a new application")
  .action((directory) => {
    initProject(directory, program);
  })
  .parse(process.argv);
