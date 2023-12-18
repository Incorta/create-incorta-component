const { spawn } = require('child_process');

async function runTest() {
  try {
    // use spawn to run an interactive command
    const shell = spawn('npx vitest', [], { stdio: 'inherit', shell: true });
    shell.on('close', code => console.log('[shell] terminated :', code));
  } catch (e) {
    console.log(e);
  }
}

module.exports = runTest;
