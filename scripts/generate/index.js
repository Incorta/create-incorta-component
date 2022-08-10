const path = require('path');
const fs = require('fs');
const prettier = require('prettier');
const generateTypes = require('./generateTypes');
const chalk = require('chalk');

const imports = new Set();

function runGenerate() {
  const currentProcessDir = process.cwd();

  const definition = readJSON(path.join(currentProcessDir, 'definition.json'));

  let generatedTypes = `
    export interface Settings {
      ${join(generateTypesFromSettings(definition.settings))}
    }

    export interface Bindings {
      ${join(generateTypesFromBindings(definition.bindingsTrays))}
    }
  `;

  // prepend used types at the start
  generatedTypes = `
    ${getTypesImports()}

    ${generatedTypes}
  `;

  writeTypesToVisualSDKFolder(generatedTypes);
}

function readJSON(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function generateTypesFromSettings(settings) {
  const lines = [];

  settings?.forEach?.(settingGroup => {
    settingGroup.settings?.forEach(setting => {
      lines.push(`'${setting.key}': ${getTypeFromSetting(setting)}`);
    });
  });

  return lines;
}

function generateTypesFromBindings(bindings) {
  const lines = [];

  bindings.forEach(binding => {
    lines.push(`'${binding.key}': {`);
    if (binding.settings) {
      lines.push(...generateTypesFromSettings(binding.settings));
    }
    lines.push(`}`);
  });

  return lines;
}

function getTypeFromSetting(setting) {
  if (setting.type in generateTypes) {
    const type = generateTypes[setting.type];
    if (typeof type === 'string') {
      return type;
    } else {
      const { type: settingType, imports: settingImports } = type;
      settingImports?.forEach(type => imports.add(type));
      return settingType;
    }
  }
  return 'any';
}

function getTypesImports() {
  if (imports.size === 0) {
    return '';
  }

  const usedTypes = [];

  imports.forEach(typeDefinition => {
    usedTypes.push(typeDefinition);
  });

  return `import { ${usedTypes.join(', ')} } from '../index'`;
}

function join(lines) {
  return lines.join('\n');
}

function writeTypesToVisualSDKFolder(generatedTypes) {
  const currentProcessDir = process.cwd();

  const generatedTypesPath = path.join(
    currentProcessDir,
    'node_modules/@incorta-org/component-sdk/generated/context.ts'
  );

  const formattedGeneratedTypes = prettier.format(generatedTypes, { parser: 'typescript' });

  fs.writeFileSync(generatedTypesPath, formattedGeneratedTypes);

  if (process.env.NODE_ENV === 'development') {
    console.log(chalk.gray('Generated types:\n\n'), formattedGeneratedTypes, '\n');
  }
  console.log(chalk.gray('Types updated in: '), generatedTypesPath);
}

module.exports = runGenerate;
