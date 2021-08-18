const execa = require("execa");
const fs = require("fs");
const archiver = require("archiver");
const { join } = require("path");
const chalk = require("chalk");

const BUNDLE_CSS_NAME = "bundle.css";
const BUNDLE_JS_NAME = "bundle.modern.js";

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
    console.log("tessssssssst");
    // TODO: Removed
    // console.log(chalk.gray("Build started"));
    // await execa("yarn", ["run", "inner-yarn-build"]);

    const distPath = join(currentProcessDir, "shehab", "dist");

    //Compress Bundle
    console.log(chalk.gray("Compress start"));
    const outputPath = join(distPath, "bundle.zip");
    await zipDirectory(distPath, outputPath);

    //Rename Bundle
    if (fs.existsSync(outputPath)) {
      fs.renameSync(outputPath, join(distPath, "bundle.inc"));
    }

    // Remove extra files in dist folder
    console.log(chalk.gray("Delete Extra Files start"));
    removeExtraDistFiles(distPath);
  } catch (e) {
    console.log(e);
  }
};

const removeExtraDistFiles = (distPath) => {
  fs.unlinkSync(join(distPath, "bundle.css"));
  fs.unlinkSync(join(distPath, "bundle.modern.js"));
  fs.rmdirSync(join(distPath, "src"), { recursive: true });
};

module.exports = createBuildPackage;
