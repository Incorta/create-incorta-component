'use strict';

const chalk = require('chalk');
const fse = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

function resolveTemplate(templatesRoot, relPath) {
  const full = path.join(templatesRoot, relPath);
  try {
    delete require.cache[require.resolve(full)];
    return require(full);
  } catch (e) {
    return null;
  }
}

async function writeFile(absPath, content) {
  await fse.outputFile(absPath, content);
}

async function ensureDir(absDir) {
  await fse.mkdirp(absDir);
}

async function createFilesFromTemplates(baseDir, templatesRoot, options) {
  const files = [
    { tpl: 'package.json.js', out: 'package.json' },
    { tpl: 'tsconfig.json.js', out: 'tsconfig.json' },
    { tpl: 'vitest.config.ts.js', out: 'vitest.config.ts' },
    { tpl: '.gitignore.js', out: '.gitignore' },
    { tpl: 'src/components/renderers/TableRenderer.tsx.js', out: 'src/components/renderers/TableRenderer.tsx' },
    { tpl: 'src/components/renderers/HtmlRenderer.tsx.js', out: 'src/components/renderers/HtmlRenderer.tsx' },
    { tpl: 'src/components/renderers/HighchartsRenderer.tsx.js', out: 'src/components/renderers/HighchartsRenderer.tsx' },
    { tpl: 'src/components/VisualizationPipeline.tsx.js', out: 'src/components/VisualizationPipeline.tsx' },
    { tpl: 'src/hooks/useDataSource.ts.js', out: 'src/hooks/useDataSource.ts' },
    { tpl: 'src/hooks/useDataTransformation.ts.js', out: 'src/hooks/useDataTransformation.ts' },
    { tpl: 'src/types/constants.ts.js', out: 'src/types/constants.ts' },
    { tpl: 'src/types/pipeline.ts.js', out: 'src/types/pipeline.ts' },
    { tpl: 'src/utils/api.ts.js', out: 'src/utils/api.ts' },
    { tpl: 'src/utils/DynamicTransformer.tsx.js', out: 'src/utils/DynamicTransformer.tsx' },
    { tpl: 'src/utils/TransformationExamples.ts.js', out: 'src/utils/TransformationExamples.ts' },
    { tpl: 'src/utils/TransformationTest.ts.js', out: 'src/utils/TransformationTest.ts' },
    { tpl: 'src/index.tsx.js', out: 'src/index.tsx' },
    { tpl: 'src/PreviewApp.tsx.js', out: 'src/PreviewApp.tsx' }
  ];

  const dirs = new Set(files.map(f => path.join(baseDir, path.dirname(f.out))));
  await Promise.all(Array.from(dirs).map(d => ensureDir(d)));

  for (const f of files) {
    const mod = resolveTemplate(templatesRoot, f.tpl);
    if (!mod) {
      await writeFile(path.join(baseDir, f.out), `// ${path.basename(f.out)}`);
      continue;
    }

    const generated = typeof mod === 'function' ? mod(options) : mod;

    // Case 1: Generator returns a single string (most templates)
    if (typeof generated === 'string') {
      await writeFile(path.join(baseDir, f.out), generated);
      continue;
    }

    // Case 2: JSON object intended for .json outputs
    if (typeof generated === 'object' && !Array.isArray(generated) && f.out.endsWith('.json')) {
      await writeFile(path.join(baseDir, f.out), JSON.stringify(generated, null, 2));
      continue;
    }

    // Case 3: Advanced generators: { content: string } or { files: [{ out, content }] }
    if (generated && typeof generated === 'object') {
      // content form
      if (typeof generated.content === 'string') {
        await writeFile(path.join(baseDir, f.out), generated.content);
        continue;
      }
      // files array form
      if (Array.isArray(generated.files)) {
        for (const file of generated.files) {
          if (!file || typeof file.out !== 'string') continue;
          const outPath = path.join(baseDir, file.out);
          const outDir = path.dirname(outPath);
          await ensureDir(outDir);
          const fileContent = typeof file.content === 'object' && file.out.endsWith('.json')
            ? JSON.stringify(file.content, null, 2)
            : String(file.content ?? '');
          await writeFile(outPath, fileContent);
        }
        continue;
      }
    }

    // Fallback placeholder
    await writeFile(path.join(baseDir, f.out), `// ${path.basename(f.out)}`);
  }
}

function detectPackageManager(startDir) {
  let pm = 'npm';
  let cur = startDir;
  while (cur !== path.parse(cur).root) {
    if (fse.existsSync(path.join(cur, 'yarn.lock'))) return 'yarn';
    if (fse.existsSync(path.join(cur, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fse.existsSync(path.join(cur, 'package-lock.json'))) return 'npm';
    cur = path.dirname(cur);
  }
  return pm;
}

const definitionJsonGenerator = require('../../resources/templates/definition.json.js');

async function generateAssistantFiles(directory, options) {
  const cwd = process.cwd();
  const packageRoot = path.resolve(__dirname, '../..');
  const templatesRoot = path.join(packageRoot, 'resources', 'templates', 'assistant');
  const target = path.join(cwd, directory);

  console.log(chalk.gray(`Creating assistant project at ${chalk.green(directory)}.`));

  // Copy base files from resources/files (same as normal "new" command)
  const resourcesFiles = path.join(packageRoot, 'resources', 'files');
  await fse.copy(resourcesFiles, target);

  await createFilesFromTemplates(target, templatesRoot, options);

  // Write definition.json similar to default "new" flow
  try {
    const def = definitionJsonGenerator({
      directory: options.directory || directory,
      description: options.description || ''
    });
    await fse.writeJSON(path.join(target, 'definition.json'), def, { spaces: 2 });
  } catch (e) {
    console.log('[assistant] failed to write definition.json', e);
  }

  // Write visualization_result.json as an empty JSON object
  try {
    await fse.writeJSON(path.join(target,'src', 'visualization_result.json'), {}, { spaces: 2 });
  } catch (e) {
    console.log('[assistant] failed to write visualization_result.json', e);
  }

  // Write assistant marker for CLI start dispatch
  try {
    await fse.outputJSON(path.join(target, '.incorta-assistant.json'), { assistant: true }, { spaces: 2 });
  } catch {}

  const pm = detectPackageManager(cwd);
  console.log(chalk.grey(`Using ${pm} as the package manager`));

  try {
    execSync(`${pm} install`, { stdio: 'inherit', cwd: target });
  } catch (e) {
    console.log(chalk.yellow('Skipping install (non-fatal).'));
  }

  console.log(chalk.grey('Initialize git repo...'));
  try {
    execSync('git init', { stdio: 'inherit', cwd: target });
    execSync('git add -A', { stdio: 'inherit', cwd: target });
    execSync('git commit -m init', { stdio: 'inherit', cwd: target });
  } catch (e) {
    console.log(chalk.yellow('Git init skipped.'));
  }

  console.log(`
${chalk.gray.underline('Assistant project created 🎉')}
Next steps:
  ${chalk.cyan(`cd ${directory.replace(/(\s+)/g, '\\$1')}`)}
  ${chalk.cyan('npm run dev')} or ${chalk.cyan('npm start')} (depending on your assistant package.json)
  ${chalk.cyan('npm test')} to run tests
  ${chalk.cyan('npm run build')} to build
  `);
}

module.exports = generateAssistantFiles;


