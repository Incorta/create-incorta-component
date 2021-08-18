"use strict";

const execa = require("execa");
const fse = require("fs-extra");
const { join } = require("path");

async function hasYarn() {
  try {
    const { exitCode } = await execa("yarnpkg", ["--version"]);
    if (exitCode === 0) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

async function shouldUseYarn(currentProcessDir) {
  const packageLockFilePath = join(currentProcessDir, "package-lock.json");
  const yarnLockFilePath = join(currentProcessDir, "yarn-lock.json");
  const useYarn =
    fse.existsSync(yarnLockFilePath) && !fse.existsSync(packageLockFilePath);
  return useYarn;
}

module.exports = {
  hasYarn,
  shouldUseYarn,
};
