import express from 'express';
import fs from 'fs';
import copy from 'rollup-plugin-copy';
const { defineConfig } = require('vite');
const { resolvePath } = require('../utils');
const path = require('path');
const cors = require('cors');
const socket = require('socket.io');
const chalk = require('chalk');
const debounce = require('debounce');

/**
 * create express server
 * to serve content over localhost
 */

let app = express();

app.use(
  cors({
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

app.use(express.static(resolvePath('dist/content')));

let PORT = 8000;
let server = app.listen(PORT, function () {
  console.log(chalk.green(`Listening on port ${PORT}`));
  console.log(chalk.green(`http://localhost:${PORT} \n`));
});

// create socket
// to notify Incorta for any sdk plugin changes
let io = socket(server, {
  cors: {
    origin: '*'
  }
});

let notifyIncortaForUpdate = debounce(() => io.emit('update'), 300);

/**
 * define vite configurations
 */

module.exports = defineConfig({
  mode: 'development',
  plugins: [
    copy({
      targets: [
        {
          src: resolvePath(['./assets/', './locales/', './package.json']),
          dest: './dist/content'
        },
        {
          src: resolvePath('./definition.json'),
          dest: resolvePath('./dist/content'),
          transform(contents) {
            // add Icon base64 bits
            const iconRegex = /"icon"[\s|\r\n]*:[\s|\r\n]*"(.*\.(.*))"/g;
            const jsonData = contents.toString();
            const [, iconPath, ext] = iconRegex.exec(jsonData);

            if (!['png', 'svg'].includes(ext)) {
              throw Error('Invalid icon format.');
            }

            const base64 = fs.readFileSync(iconPath, 'base64');

            let newIcon;
            if (ext === 'png') {
              newIcon = `"icon": "data:image/png;base64,${base64}"`;
            } else {
              newIcon = `"icon": "data:image/svg+xml;base64,${base64}"`;
            }

            return jsonData.replace(iconRegex, newIcon);
          }
        }
      ],
      hook: 'writeBundle' // notice here
    }),
    {
      name: 'watch-external',
      buildStart() {
        resolvePath(['./definition.json', './assets/', './locales/', './package.json']).forEach(
          file => {
            this.addWatchFile(path.resolve(__dirname, file));
          }
        );
      }
    },
    {
      name: 'watch-change',
      buildEnd() {
        notifyIncortaForUpdate();
      }
    }
  ],
  build: {
    outDir: resolvePath('dist/content'),
    minify: false,
    lib: {
      entry: resolvePath('src/index.tsx'),
      name: 'SDKComponent',
      fileName: () => `render.js`,
      formats: ['iife']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        assetFileNames(assetInfo) {
          if (assetInfo.name === 'style.css') return 'render.css';
          return assetInfo.name;
        },
        globals: {
          'react-dom': 'ReactDOM',
          react: 'React',
          React: 'React',
          ReactDOM: 'ReactDOM'
        }
      }
    }
  }
});
