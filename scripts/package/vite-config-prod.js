import fs from 'fs';
import copy from 'rollup-plugin-copy';
const { defineConfig } = require('vite');
const { resolvePath } = require('../utils');

/**
 * define vite configurations
 */

module.exports = defineConfig({
  mode: 'production',
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
    })
  ],
  build: {
    outDir: resolvePath('dist/content'),
    minify: true,
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
