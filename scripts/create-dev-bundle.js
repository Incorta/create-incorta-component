const { join, resolve } = require("path");
const replace = require("replace-in-file");
const fs = require("fs-extra");
const { spawn } = require("child_process");

const createDevBundle = () => {
  const visualizationPath = process.cwd();
  const createIncortaVisualRootPath = resolve(__dirname, "..");

  const microBundleScriptPath = join(
    createIncortaVisualRootPath,
    "./node_modules/microbundle/dist/cli.js"
  );

  const distPath = join(visualizationPath, "dist");

  spawn(
    "node",
    [
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
    ],
    { stdio: "inherit", env: process.env }
  );

  // TODO: After each build I should do this replace
  replace.sync({
    files: resolve(visualizationPath, "./dist/bundle.modern.js"),
    from: /import\*as (.) from"react";/g,
    to: (match, group) => {
      return `const ${group} = window.React;`;
    },
  });

  replace.sync({
    files: resolve(visualizationPath, "./dist/bundle.modern.js"),
    from: /import\*as (.) from"react-dom";/g,
    to: (match, group) => {
      return `const ${group} = window.ReactDom;`;
    },
  });

  replace.sync({
    files: resolve(visualizationPath, "./dist/bundle.modern.js"),
    from: /import (.) from"(.*\.(png|svg))"/g,
    to: (match, group1, group2) => {
      console.log(args);
      const base64 = fs.readFileSync(
        resolve(visualizationPath, group2),
        "base64"
      );
      if (group2.indexOf(".png") > -1) {
        return `const ${group1} = "data:image/png;base64,${base64}";`;
      } else {
        return `const ${group1} = "data:image/svg+xml,${base64}";`;
      }
    },
  });
};

module.exports = createDevBundle;
