const execa = require("execa");
const { join } = require("path");
const express = require("express");
const chalk = require("chalk");
const { shouldUseYarn: shouldUseYarnCheck } = require("../utils/has-yarn");

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
    const shouldUseYarn = shouldUseYarnCheck(currentProcessDir);

    if (shouldUseYarn) {
      await execa("yarn", ["start"]);
    } else {
      await execa("npm", ["run", "start"]);
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = runDevServer;
