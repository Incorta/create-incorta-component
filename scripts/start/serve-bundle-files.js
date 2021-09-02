const { join } = require('path');
const express = require('express');
const chalk = require('chalk');
const socket = require('socket.io');
const cors = require('cors');
const chokidar = require('chokidar');
const debounce = require('debounce');

const serveBundleFiles = ({ currentProcessDir }) => {
  console.log(chalk.gray('Starting dev server'));
  const distContentPath = join(currentProcessDir, 'dist', 'content');
  const watcher = chokidar.watch(distContentPath, {
    persistent: true,
    awaitWriteFinish: true,
    disableGlobbing: true,
    ignoreInitial: true
  });
  const PORT = 8000;
  const app = express();
  const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  app.use(cors(corsOptions));
  const server = app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
  app.use(express.static(distContentPath));
  const io = socket(server, {
    cors: {
      origin: '*'
    }
  });
  function sendUpdate(path) {
    io.emit('update');
  }
  watcher.on('change', debounce(sendUpdate, 100));
  io.on('connection', function (socket) {});
  io.on('disconnect', () => {
    watcher.close();
  });
};

module.exports = serveBundleFiles;
