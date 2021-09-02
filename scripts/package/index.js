const { bundle } = require('../../utils/dist-utils');

const createBuildPackage = async () => {
  const currentProcessDir = process.cwd();
  await bundle({ currentProcessDir, package: true });
};

module.exports = createBuildPackage;
