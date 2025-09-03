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

// Assistant dev server mirrors the default, can diverge later as needed
let app = express();

app.use(
  cors({
    origin: '*',
    optionsSuccessStatus: 200
  })
);

app.use(express.json());

// Simple request logger
app.use((req, _res, next) => {
  console.log('[assistant-dev]', req.method, req.url);
  next();
});

app.use(express.static(resolvePath('dist/content')));

let PORT = 8000;
let server = app.listen(PORT, function () {
  console.log(chalk.green(`Listening on port ${PORT}`));
  console.log(chalk.green(`http://localhost:${PORT} \n`));
});

// Assistant APIs (stubs)
app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/prompt', async (req, res) => {
  try {
    const { prompt, session_id } = req.body || {};
    if (!prompt || !session_id) {
      return res.status(400).json({ error: 'prompt and session_id are required' });
    }

    async function httpPostJson(url, body) {
      const payload = JSON.stringify(body);
      const headers = { 'Content-Type': 'application/json' };
      if (typeof fetch === 'function') {
        const r = await fetch(url, { method: 'POST', headers, body: payload });
        return r.json();
      } else {
        const { default: nodeFetch } = await import('node-fetch');
        const r = await nodeFetch(url, { method: 'POST', headers, body: payload });
        return r.json();
      }
    }

    const backendUrl = process.env.FASTAPI_URL || 'http://localhost:8080/prompt';
    const resp = await httpPostJson(backendUrl, { prompt, session_id });
    const { definition_result, visualization_result, explanation } = resp || {};

    // Write definition.json
    try {
      const defPath = path.resolve(process.cwd(), 'definition.json');
      const defContent = typeof definition_result === 'string'
        ? definition_result
        : JSON.stringify(definition_result ?? {}, null, 2);
      fs.writeFileSync(defPath, defContent);
    } catch (e) {
      console.log('[assistant-dev] failed writing definition.json', e);
    }

    // Write visualization_result.json
    try {
      const visPath = path.resolve(process.cwd(), 'visualization_result.json');
      const visContent = typeof visualization_result === 'string'
        ? visualization_result
        : JSON.stringify(visualization_result ?? {}, null, 2);
      fs.writeFileSync(visPath, visContent);
    } catch (e) {
      console.log('[assistant-dev] failed writing visualization_result.json', e);
    }

    return res.json({ explanation: explanation ?? '' });
  } catch (e) {
    console.log('[assistant-dev] prompt handler error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

let io = socket(server, {
  cors: {
    origin: '*'
  }
});

let notifyIncortaForUpdate = debounce(() => {
  try {
    let contentPath = resolvePath('dist/content');
    let files = fs.readdirSync(contentPath);
    if (files.length > 0) {
      io.emit('update');
    } else {
      notifyIncortaForUpdate();
    }
  } catch {
    notifyIncortaForUpdate();
  }
}, 300);

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
      hook: 'writeBundle'
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
    },
    {
      name: 'append-source-url',
      writeBundle() {
        let renderJSPath = resolvePath('./dist/content/render.js');
        let fileContent = fs.readFileSync(renderJSPath, 'utf-8');
        fileContent += '//# sourceURL=render.js\n';
        fs.writeFileSync(renderJSPath, fileContent);
      }
    }
  ],
  define: {
    'process.env': '({})'
  },
  build: {
    outDir: resolvePath('dist/content'),
    minify: false,
    sourcemap: 'inline',
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


