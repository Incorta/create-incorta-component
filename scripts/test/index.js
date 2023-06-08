const shelljs = require('shelljs');

async function runTest() {
  try {
    shelljs.exec(`npx vitest`);
  } catch (e) {
    console.log(e);
  }
}

module.exports = runTest;
