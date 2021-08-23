const execa = require("execa");
const fs = require("fs-extra");
const archiver = require("archiver");
const { join, resolve } = require("path");
const chalk = require("chalk");

const {
  replaceInFiles,
  createBundleServedFile,
  createBundleTempFile,
  removeDistFiles,
} = require("../utils/dist-utils");

const zipDirectory = (source, out) => {
  const bundleJs = join(source, "bundle.js");
  const bundleCss = join(source, "bundle.css");

  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .append(fs.createReadStream(bundleJs), {
        name: "bundle.js",
      })
      .append(fs.createReadStream(bundleCss), {
        name: "bundle.css",
      })
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
};

const createBuildPackage = async () => {
  const currentProcessDir = process.cwd();
  try {
    console.log(chalk.gray("Building bundle..."));

    const distPath = join(currentProcessDir, "dist");
    const createIncortaVisualRootPath = resolve(__dirname, "..");
    const microBundleScriptPath = join(
      createIncortaVisualRootPath,
      "./node_modules/microbundle/dist/cli.js"
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
    await zipDirectory(distPath, outputPath);

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
