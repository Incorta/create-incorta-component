const execa = require("execa");
const fs = require("fs-extra");
const { join, resolve } = require("path");
const chalk = require("chalk");

const {
  replaceInFiles,
  createBundleServedFile,
  createBundleTempFile,
  removeDistFiles,
} = require("../../utils/dist-utils");
const compressDirectory = require("../../utils/compress-directory");
const { shouldUseYarn } = require("../../utils/has-yarn");

const createBuildPackage = async () => {
  const currentProcessDir = process.cwd();
  try {
    console.log(chalk.gray("Building bundle..."));
    const distPath = join(currentProcessDir, "dist");
    const createIncortaVisualRootPath = resolve(__dirname, "../..");

    const useYarn = await shouldUseYarn(currentProcessDir);
    const microBundleScriptPath = join(
      createIncortaVisualRootPath,
      useYarn
        ? "./node_modules/microbundle/.bin/microbundle.js"
        : "./node_modules/microbundle/dist/cli.js"
    );

    await execa("node", [
      microBundleScriptPath,
      "-o",
      join(distPath, "bundle.js"),
      "--jsx",
      "React.createElement",
      "--external",
      ".*/assets/.*,.*\\\\assets\\\\.*",
      "--jsxImportSource",
      "-f",
      "esm",
      "--no-sourcemap",
      "--no-generateTypes",
    ]);

    await createBundleTempFile();
    await replaceInFiles({ isBuild: true });
    await createBundleServedFile();

    //Compress Bundle
    const outputPath = join(distPath, "bundle.zip");
    await compressDirectory(distPath, outputPath);

    //Rename Bundle
    if (fs.existsSync(outputPath)) {
      fs.renameSync(outputPath, join(distPath, "bundle.inc"));
    }

    // Remove extra files in dist folder
    await removeDistFiles(distPath);
    console.log(
      chalk(
        `${chalk.green("✅ ")} Your bundle is ready at ${chalk.cyan(
          "dist/bundle.inc"
        )} `
      )
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports = createBuildPackage;
