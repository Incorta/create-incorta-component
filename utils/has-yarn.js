"use strict";

const execa = require("execa");

module.exports = async function hasYarn() {
  try {
    const { exitCode } = await execa("yarnpkg", ["--version"]);
    if (exitCode === 0) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};
