const chalk = require("chalk");
const fse = require("fs-extra");
const { join, resolve } = require("path");

const visualizationPackageJsonGenerator = require("../resources/templates/package.json.js");
const visualizationIndexGenerator = require("../resources/templates/index.tsx.js");
const chartDefinitionGenerator = require("../resources/templates/definition.ts.js");

const createPackageJSON = async ({ options, newVisualPath }) => {
  const { directory, author, description } = options;
  await fse.writeJSON(
    join(newVisualPath, "package.json"),
    visualizationPackageJsonGenerator({
      directory,
      author,
      description,
    }),
    {
      spaces: 2,
    }
  );
  console.log("package.json generated");
};

const createVisualizationIndexFile = async ({ options, newVisualPath }) => {
  const indexPath = join(newVisualPath, "src", "index.tsx");
  await fse.writeFile(indexPath, visualizationIndexGenerator(options));
  console.log("index.tsx file created");
};

const createVisualizationDefinitionFile = async ({
  options,
  newVisualPath,
}) => {
  const defPath = join(newVisualPath, "src", "definition.ts");
  await fse.writeFile(defPath, chartDefinitionGenerator(options));
  console.log("definition.ts file created");
};

async function generateFiles(directory, options) {
  // Place where process is opened
  const currentProcessDir = process.cwd();

  // Root path of create-incorta-visual
  const packageRootPath = resolve(__dirname, "..");

  // new Visual Path
  const newVisualPath = join(currentProcessDir, directory);

  const resources = join(packageRootPath, "resources");
  const resourcesFiles = join(resources, "files");

  console.log(`Creating a new Incorta visual at ${chalk.green(directory)}.`);
  console.log("Creating files...");

  try {
    await fse.copy(resourcesFiles, newVisualPath);
    console.log("Files copied successfully");

    await createPackageJSON({ options, newVisualPath });
    await createVisualizationIndexFile({ options, newVisualPath });
    await createVisualizationDefinitionFile({ options, newVisualPath });

    console.log(successMessage(directory));
  } catch (e) {
    console.error(e);
  }
  return Promise.resolve(directory);
}

const successMessage = (directory) => `

        ${chalk.gray.underline("files created successfully 🎉🎉🎉")}

        ${chalk.black("Go to your project directory:")}

        ${chalk.cyan(`cd ${directory}`)}

        ${chalk.black("Start your dev server by running:")}

        ${chalk.cyan("npx create-incorta-visual dev")}

        ${chalk.black("or package you visualization by running:")}

        ${chalk.cyan("npx create-incorta-visual package")}
        
`;

module.exports = generateFiles;
