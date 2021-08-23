const { join, resolve } = require("path");
const replace = require("replace-in-file");
const fs = require("fs-extra");

const { MICROBUNDLE_FILE, TEMP_FILE, SERVED_FILE } = require("./const");

const createBundleTempFile = async () => {
  const visualizationPath = process.cwd();
  await fs.copy(
    join(visualizationPath, "dist", MICROBUNDLE_FILE),
    join(visualizationPath, "dist", TEMP_FILE)
  );
};

const createBundleServedFile = async () => {
  const visualizationPath = process.cwd();
  await fs.copy(
    join(visualizationPath, "dist", TEMP_FILE),
    join(visualizationPath, "dist", SERVED_FILE)
  );
};

const getRegex = (type, { isBuild }) => {
  const buildRegex = {
    react: /import\*as(.+)from"react";/g,
    reactDom: /import\*as(.+)from('|")react-dom('|");/g,
    images: /import (.) from"(.*\.(png|svg))";/g,
  };

  const devRegex = {
    react: /import \* as (.+) from 'react';/g,
    reactDom: /import \* as (.+) from 'react-dom';/g,
    images: /import(.+)from '(.*\.(png|svg))';/g,
  };

  if (isBuild) return buildRegex[type];
  return devRegex[type];
};

const replaceInFiles = async (arg) => {
  const isBuild = !!arg?.isBuild;
  const visualizationPath = process.cwd();
  const errorPrint = (error) => {
    if (error) {
      return console.error("Error occurred:", error);
    }
  };

  await replace(
    {
      files: resolve(visualizationPath, `./dist/${TEMP_FILE}`),
      from: getRegex("react", { isBuild }),
      to: (match, group) => {
        return `const ${group} = window.React;`;
      },
    },
    errorPrint
  );

  await replace(
    {
      files: resolve(visualizationPath, `./dist/${TEMP_FILE}`),
      from: getRegex("reactDom", { isBuild }),
      to: (match, group) => {
        return `const ${group} = window.ReactDom;`;
      },
    },
    errorPrint
  );

  await replace(
    {
      files: resolve(visualizationPath, `./dist/${TEMP_FILE}`),
      from: getRegex("images", { isBuild }),
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
};

const removeDistFiles = async (distPath) => {
  await fs.rm(join(distPath, "src"), { recursive: true }, (e) => {});
  fs.readdir(distPath, (err, files) => {
    if (err) console.err(err);
    const filesPaths = ["bundle.inc", "src"];
    files.forEach((file) => {
      if (!filesPaths.includes(file)) {
        fs.unlinkSync(join(distPath, file));
      }
    });
  });
};

module.exports = {
  createBundleTempFile,
  createBundleServedFile,
  replaceInFiles,
  removeDistFiles,
};
