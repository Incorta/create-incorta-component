const path = require('path');
const execSync = require('child_process').execSync;
const replace = require('replace-in-file');
const fs = require('fs');

function exec(cmd) {
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

process.chdir(path.resolve(__dirname, '..'));

const args = process.argv.slice(2).join(' ');

exec(
  `node ./node_modules/microbundle/dist/cli.js -o dist/bundle.js --jsx 'React.createElement' --external .*/assets/.*,.*\\\\assets\\\\.*  --jsxImportSource -f esm ${args}`
);

replace.sync({
  files: path.resolve(__dirname, '../dist/bundle.modern.js'),
  from: /import\*as (.) from"react";/g,
  to: (match, group) => {
    return `const ${group} = window.React;`;
  }
});

replace.sync({
  files: path.resolve(__dirname, '../dist/bundle.modern.js'),
  from: /import\*as (.) from"react-dom";/g,
  to: (match, group) => {
    return `const ${group} = window.ReactDom;`;
  }
});

replace.sync({
  files: path.resolve(__dirname, '../dist/bundle.modern.js'),
  from: /import (.) from"(.*\.(png|svg))"/g,
  to: (match, group1, group2) => {
    console.log(args);
    const base64 = fs.readFileSync(path.resolve(__dirname, group2), 'base64');
    if (group2.indexOf('.png') > -1) {
      return `const ${group1} = "data:image/png;base64,${base64}";`;
    } else {
      return `const ${group1} = "data:image/svg+xml,${base64}";`;
    }
  }
});

// rename bundle file
// replace externals e.g. react, react-dom
// replace images/icons base64, check react svg component
// remove unused files
// compress zip and rename it to visual-key.inc
// console log info
