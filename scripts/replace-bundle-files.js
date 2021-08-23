const replace = require("replace-in-file");
const fs = require("fs-extra");
const createWatcher = require("../utils/createWatcher");
const { join, resolve } = require("path");

/*
    bundle.modern.js => created by microbundle
    bundle-before-replacement.js => copy to do all the replacements needed
    bundle.js => served to the client
*/

const MICROBUNDLE_FILE = "bundle.modern.js";
const TEMP_FILE = "bundle-before-replacement.js";
const SERVED_FILE = "bundle.js";

const errorPrint = (error, results) => {
  if (error) {
    return console.error("Error occurred:", error);
  }
};

const createBundleTempFile = async () => {
  const visualizationPath = process.cwd();
  await fs.copy(
    join(visualizationPath, "dist", MICROBUNDLE_FILE),
    join(visualizationPath, "dist", TEMP_FILE)
  );
};

const watchOnBundleModernOnly = () => {
  const watcher = createWatcher(MICROBUNDLE_FILE);
  watcher.on("change", async (path) => {
    await createBundleTempFile();
    await replaceInFiles();
  });
};

const replaceInFiles = async () => {
  const visualizationPath = process.cwd();
  await replace(
    {
      files: resolve(visualizationPath, `./dist/${TEMP_FILE}`),
      from: /import \* as (.+) from 'react';/g,
      to: (match, group) => {
        return `const ${group} = window.React;`;
      },
    },
    errorPrint
  );

  await replace(
    {
      files: resolve(visualizationPath, `./dist/${TEMP_FILE}`),
      from: /import \* as (.+) from 'react-dom';/g,
      to: (match, group) => {
        return `const ${group} = window.ReactDom;`;
      },
    },
    errorPrint
  );

  await replace(
    {
      files: resolve(visualizationPath, `./dist/${TEMP_FILE}`),
      from: /import(.+)from '(.*\.(png|svg))'/g,
      to: (match, group1, group2) => {
        const paths = group2.split("/");
        const name = paths[paths.length - 1];
        const base64 = fs.readFileSync(
          resolve(visualizationPath, "assets", name),
          "base64"
        );
        if (group2.indexOf(".png") > -1) {
          return `const ${group1} = "data:image/png;base64,${base64}";`;
        } else {
          return `const ${group1} = "data:image/svg+xml,${base64}";`;
        }
      },
    },
    errorPrint
  );

  await fs.copy(
    join(visualizationPath, "dist", TEMP_FILE),
    join(visualizationPath, "dist", SERVED_FILE)
  );
};

const watchOnDistDirectory = () => {
  const visualizationPath = process.cwd();
  const watcher = createWatcher("");
  watcher.on("add", async (path) => {
    if (path === join(visualizationPath, "dist", MICROBUNDLE_FILE)) {
      console.log("bundle modern added");
      await createBundleTempFile();
      await replaceInFiles();
      watchOnBundleModernOnly();
    }
  });
};

const replaceBundleFiles = async () => {
  const visualizationPath = process.cwd();
  const bundleModernExists = fs.existsSync(
    join(visualizationPath, "dist", MICROBUNDLE_FILE)
  );

  if (bundleModernExists) {
    watchOnBundleModernOnly();
  } else {
    watchOnDistDirectory();
  }
};

module.exports = replaceBundleFiles;
