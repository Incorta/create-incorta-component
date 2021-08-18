const execa = require("execa");
const { join } = require("path");
const express = require("express");
const chalk = require("chalk");

const runDevServer = async () => {
  try {
    console.log(chalk.gray("Starting dev server"));
    const currentProcessDir = process.cwd();
    const distPath = join(currentProcessDir, "dist");
    const app = express();
    app.listen(8000, function () {
      app.use(express.static(distPath));
      console.log(
        chalk.gray(`
                Dev server is running on:`)
      );
      console.log(
        chalk.cyan(`
                http://localhost:8000
            `)
      );
    });
    await execa("yarn", ["start"]);
  } catch (e) {
    console.log(e);
  }
};

module.exports = runDevServer;
