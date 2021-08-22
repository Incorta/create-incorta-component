const { join } = require("path");
const express = require("express");
const chalk = require("chalk");
const socket = require("socket.io");
const cors = require("cors");
const chokidar = require("chokidar");

const serveBundleFiles = () => {
  console.log(chalk.gray("Starting dev server"));
  const currentProcessDir = process.cwd();
  const distPath = join(currentProcessDir, "dist");
  // App setup
  const PORT = 8000;
  const app = express();
  // TODO: Remove
  var corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  app.use(cors(corsOptions));
  const server = app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
  app.use(express.static(distPath));
  const io = socket(server);
  io.on("connection", function (socket) {
    const bundleJsFilePath = join(distPath, "bundle.modern.js");
    const watcher = chokidar.watch(bundleJsFilePath, {
      persistent: true,
      interval: 4000,
    });
    watcher.on("change", (path) => {
      io.emit("update", { message: "file updated" + `(${path})` });
      console.log("files updated");
    });
    console.log("Made socket connection");
  });
};

module.exports = serveBundleFiles;
