const execa = require("execa");
const fs = require("fs");
const archiver = require("archiver");
const { join } = require("path");
const chalk = require("chalk");

const { shouldUseYarn: shouldUseYarnCheck } = require("../utils/has-yarn");

function zipDirectory(source, out) {
  const bundleJs = join(source, "bundle.modern.js");
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
}

const createBuildPackage = async () => {
  const currentProcessDir = process.cwd();
  try {
    const distPath = join(currentProcessDir, "dist");
    const shouldUseYarn = shouldUseYarnCheck(currentProcessDir);

    console.log(chalk.gray("Building bundle..."));
    if (shouldUseYarn) {
      await execa("yarn", ["build"]);
    } else {
      await execa("yarn", ["run", "build"]);
    }

    //Compress Bundle
    console.log(chalk.gray("Compress start"));
    const outputPath = join(distPath, "bundle.zip");
    await zipDirectory(distPath, outputPath);

    //Rename Bundle
    if (fs.existsSync(outputPath)) {
      fs.renameSync(outputPath, join(distPath, "bundle.inc"));
    }

    // Remove extra files in dist folder
    await removeExtraDistFiles(distPath);
    console.log(
      chalk.black(`${chalk.cyan("dist/bundle.inc")} created sucessfully `) +
        chalk.green("✅")
    );
  } catch (e) {
    console.log(e);
  }
};

const removeExtraDistFiles = async (distPath) => {
  fs.unlinkSync(join(distPath, "bundle.css"));
  fs.unlinkSync(join(distPath, "bundle.modern.js"));
  await fs.rm(join(distPath, "src"), { recursive: true }, (e) => {});
};

module.exports = createBuildPackage;
