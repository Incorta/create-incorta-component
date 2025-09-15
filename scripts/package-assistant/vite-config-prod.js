import fs from 'fs';
import copy from 'rollup-plugin-copy';
const { defineConfig } = require('vite');
const { resolvePath } = require('../utils');

/**
 * Vite configuration for assistant production build
 * This config builds the frontend component and prepares the Express server for deployment
 */

module.exports = defineConfig({
  mode: 'production',
  plugins: [
    copy({
      targets: [
        // Copy frontend assets and resources
        {
          src: resolvePath(['./assets/', './locales/', './package.json']),
          dest: './dist/assistant/content'
        },
        // Copy visualization_result.json if it exists
        {
          src: resolvePath('./visualization_result.json'),
          dest: resolvePath('./dist/assistant/content'),
          // Only copy if the file exists
          filter: (src) => {
            const fs = require('fs');
            return fs.existsSync(src);
          }
        },
        // Copy and transform definition.json for the frontend component
        {
          src: resolvePath('./definition.json'),
          dest: resolvePath('./dist/assistant/content'),
          transform(contents) {
            // Add Icon base64 bits for the component
            const iconRegex = /"icon"[\s|\r\n]*:[\s|\r\n]*"(.*\.(.*))"/g;
            const jsonData = contents.toString();
            const match = iconRegex.exec(jsonData);
            
            if (!match) {
              // If no icon found, return as-is
              return jsonData;
            }
            
            const [, iconPath, ext] = match;

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
        },
      ],
      hook: 'writeBundle'
    })
  ],
  define: {
    'process.env': '({})'
  },
  build: {
    outDir: resolvePath('dist/assistant/content'),
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
