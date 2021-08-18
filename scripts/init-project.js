const promptUser = require("../utils/prompt-user");
const validateDirectory = require("../utils/validate-directory");
const generateFiles = require("./generate-files");
const { hasYarn: checkHasYarn } = require("../utils/has-yarn");

async function initProject(dir, program) {
  const prompt = await promptUser(dir, program.template);
  const directory = prompt.directory || dir;
  const useNpm = prompt.tool === "npm";
  const hasYarn = await checkHasYarn();

  await validateDirectory(directory);

  const options = {
    description: prompt.description,
    author: prompt.author,
    useYarn: !useNpm && hasYarn,
    directory,
  };
  return generateFiles(directory, options).then(() => {
    if (process.platform === "win32") {
      process.exit(0);
    }
  });
}

module.exports = initProject;
