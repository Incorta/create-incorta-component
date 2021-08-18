const promptUser = require("../utils/prompt-user");
const generateFiles = require("./generate-files");

async function initProject(dir, program) {
  const prompt = await promptUser(dir, program.template);
  const directory = prompt.directory || dir;

  if (!directory) {
    console.error("Please specify the <directory> of your project");
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }

  const options = {
    description: prompt.description,
    author: prompt.author,
    directory,
  };

  return generateFiles(directory, options).then(() => {
    if (process.platform === "win32") {
      process.exit(0);
    }
  });
}

module.exports = initProject;
