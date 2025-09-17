import express from 'express';
import fs from 'fs';
import copy from 'rollup-plugin-copy';
const { defineConfig } = require('vite');
const { resolvePath } = require('../utils');
const path = require('path');
const cors = require('cors');
const socket = require('socket.io');
const { Server: SocketIOServer } = require('socket.io');
const { io: SocketIOClient } = require('socket.io-client');
const WebSocket = require('ws');
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

    // Write visualization_result.json to both locations for development
    try {
      // Write to root for backwards compatibility
      const rootVisPath = path.resolve(process.cwd(), 'visualization_result.json');
      // Write to src/ for new import path
      const srcDir = path.resolve(process.cwd(), 'src');
      const srcVisPath = path.resolve(srcDir, 'visualization_result.json');
      
      const visContent = typeof visualization_result === 'string'
        ? visualization_result
        : JSON.stringify(visualization_result ?? {}, null, 2);
      
      // Ensure src directory exists
      if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
      }
      
      // Write to both locations
      fs.writeFileSync(rootVisPath, visContent);
      fs.writeFileSync(srcVisPath, visContent);
      
      console.log('[assistant-dev] Updated visualization_result.json in both root and src/');
    } catch (e) {
      console.log('[assistant-dev] failed writing visualization_result.json', e);
    }

    return res.json({ explanation: explanation ?? '' });
  } catch (e) {
    console.log('[assistant-dev] prompt handler error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// Single Socket.IO server for all communications
let io = socket(server, {
  cors: {
    origin: '*'
  }
});

// Socket.IO client to connect to chat app at localhost:5173
let chatAppClient = null;
let chatAppReconnectInterval = null;
let lastConnectionAttempt = 0;
let connectionFailCount = 0;
const MAX_LOG_INTERVAL = 30000; // Log at most every 30 seconds
const MAX_RECONNECT_ATTEMPTS = 10;

function connectToChatApp() {
  const now = Date.now();
  
  // Throttle connection attempts and logging
  if (now - lastConnectionAttempt < 5000) {
    return; // Don't attempt connection more than once every 5 seconds
  }
  lastConnectionAttempt = now;

  try {
    // Stop trying after too many failures to prevent spam
    if (connectionFailCount >= MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    chatAppClient = SocketIOClient('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
      reconnection: false, // Disable auto-reconnection to prevent spam
    });

    chatAppClient.on('connect', () => {
      console.log(chalk.green('[assistant-dev] Connected to chat app at localhost:3000'));
      connectionFailCount = 0; // Reset fail count on successful connection
      if (chatAppReconnectInterval) {
        chatAppReconnectInterval = null;
      }
    });

    chatAppClient.on('disconnect', (reason) => {
      scheduleReconnectToChatApp();
    });

    chatAppClient.on('connect_error', (error) => {
      connectionFailCount++;
      scheduleReconnectToChatApp();
    });

  } catch (error) {
    connectionFailCount++;
    scheduleReconnectToChatApp();
  }
}

function scheduleReconnectToChatApp() {
  if (!chatAppReconnectInterval && connectionFailCount < MAX_RECONNECT_ATTEMPTS) {
    // Exponential backoff for reconnection attempts
    const delay = Math.min(5000 * Math.pow(2, Math.min(connectionFailCount, 5)), 60000);
    
    chatAppReconnectInterval = setTimeout(() => {
      chatAppReconnectInterval = null;
      connectToChatApp();
    }, delay);
  }
}

// Initialize connection to chat app
connectToChatApp();

// Handle all Socket.IO connections
let connectionCount = 0;
io.on('connection', (socket) => {
  connectionCount++;

  // Handle backend notifications (from Python WebSocketManager)
  socket.on('backend_notification', (data) => {
    try {
      console.log(chalk.blue(`[assistant-dev] Backend notification: ${data.type}`));

      // Forward chain completion notifications to chat app
      // if (data.type === 'CHAIN_COMPLETION' && chatAppClient && chatAppClient.connected) {
      //   chatAppClient.emit('chain_completion', {
      //     chain_name: data.payload?.chain_name,
      //     status: data.payload?.status,
      //     session_id: data.payload?.session_id,
      //     timestamp: data.timestamp
      //   });
      // }

      io.emit('chain_completion', {
        chain_name: data.payload?.chain_name,
        status: data.payload?.status,
        session_id: data.payload?.session_id,
        timestamp: data.timestamp
      });

    } catch (error) {
      io.emit('error', error);
    }
  });

  socket.on('disconnect', (reason) => {
    connectionCount--;
  });

  socket.on('error', (error) => {
  });
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


