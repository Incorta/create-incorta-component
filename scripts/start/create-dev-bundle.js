const { join, resolve } = require("path");
const { spawn } = require("child_process");

const createDevBundle = async () => {
  const visualizationPath = process.cwd();
  const createIncortaVisualRootPath = resolve(__dirname, "../..");

  const microBundleScriptPath = join(
    createIncortaVisualRootPath,
    "./node_modules/microbundle/dist/cli.js"
  );

  const distPath = join(visualizationPath, "dist");

  await spawn("node", [
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
    "watch",
    "--no-compress",
  ]);
};

module.exports = createDevBundle;
