const packageJSON = require('../../package.json');
const { v4: uuid } = require('uuid');

module.exports = opts => {
  const { directory: name, description, author, useYarn } = opts;
  return {
    id: uuid(),
    version: '0.0.1',
    name,
    description,
    author: {
      name: author,
      email: ''
    },
    license: 'MIT',
    repository: '',
    main: 'dist/index.js',
    module: 'dist/index.modern.js',
    source: 'src/index.tsx',
    engines: {
      node: '>=10'
    },
    scripts: {
      build: 'create-incorta-visual package',
      start: 'create-incorta-visual start',
      test: 'run-s test:unit test:lint test:build',
      'test:build': 'run-s build',
      'test:lint': 'eslint "**/*.{ts,tsx}"',
      'test:unit': 'cross-env CI=1 react-scripts test --env=jsdom',
      'test:watch': 'react-scripts test --env=jsdom'
    },
    peerDependencies: {
      react: '^17.0.2',
      'react-dom': '^17.0.2'
    },
    devDependencies: {
      '@testing-library/jest-dom': '^4.2.4',
      '@testing-library/react': '^9.5.0',
      '@testing-library/user-event': '^7.2.1',
      '@types/jest': '^25.1.4',
      '@types/node': '^12.12.38',
      '@types/react': '^17.0.14',
      '@types/react-dom': '^16.9.7',
      '@typescript-eslint/eslint-plugin': '^2.26.0',
      '@typescript-eslint/parser': '^2.26.0',
      'babel-eslint': '^10.0.3',
      'cross-env': '^7.0.2',
      eslint: '^6.8.0',
      'eslint-config-prettier': '^6.7.0',
      'eslint-config-standard': '^14.1.0',
      'eslint-config-standard-react': '^9.2.0',
      'eslint-plugin-import': '^2.18.2',
      'eslint-plugin-node': '^11.0.0',
      'eslint-plugin-prettier': '^3.1.1',
      'eslint-plugin-promise': '^4.2.1',
      'eslint-plugin-react': '^7.17.0',
      'eslint-plugin-standard': '^4.0.1',
      less: '^4.1.1',
      microbundle: '^0.13.3',
      'npm-run-all': '^4.1.5',
      prettier: '^2.0.4',
      react: '^17.0.2',
      'react-dom': '^17.0.2',
      'react-scripts': '4.0.3',
      'replace-in-file': '^6.2.0',
      typescript: '^4.1.3',
      '@incorta-org/create-incorta-visual': packageJSON.version
    },
    files: ['dist'],
    dependencies: {
      '@incorta-org/visual-sdk': '^0.1.2-alpha.11'
    }
  };
};
