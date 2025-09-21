const _ = require('lodash');

module.exports = ({ directory, description = '', author = 'dev' } = {}) => {
  const name = directory ? _.kebabCase(directory) : 'assistant-project';
  return {
    name,
    version: '0.0.1',
    private: true,
    description,
    author,
    license: 'MIT',
    main: 'dist/index.js',
    module: 'dist/index.modern.js',
    source: 'src/index.tsx',
    scripts: {
      start: 'create-incorta-component start',
      build: 'create-incorta-component package',
      dev: 'vite',
      preview: 'vite preview',
      test: 'vitest'
    },
    dependencies: {
        "@incorta-org/component-sdk": "~2.0.0",
        "axios": "^1.11.0",
        "highcharts": "^12.3.0",
        "highcharts-react-official": "^3.2.2",
        "react": "^17.0.2",
        "react-dom": "^17.0.2"
    },
    devDependencies: {
        "@incorta-org/create-incorta-component": "2.0.6",
        "@vitejs/plugin-react": "^5.0.2",
        "vite": "^4.3.9",
        "@testing-library/jest-dom": "^4.2.4",
        "@testing-library/react": "^9.5.0",
        "@testing-library/user-event": "^7.2.1",
        "@types/jest": "^25.1.4",
        "@types/node": "^20.10.4",
        "@types/react": "^17.0.14",
        "@types/react-dom": "^17.0.9",
        "@typescript-eslint/eslint-plugin": "^2.26.0",
        "@typescript-eslint/parser": "^2.26.0",
        "babel-eslint": "^10.0.3",
        "cross-env": "^7.0.2",
        "eslint": "^6.8.0",
        "eslint-config-prettier": "^6.7.0",
        "eslint-config-standard": "^14.1.0",
        "eslint-config-standard-react": "^9.2.0",
        "eslint-plugin-import": "^2.18.2",
        "eslint-plugin-node": "^11.0.0",
        "eslint-plugin-prettier": "^3.1.1",
        "eslint-plugin-promise": "^4.2.1",
        "eslint-plugin-react": "^7.17.0",
        "eslint-plugin-standard": "^4.0.1",
        "less": "^4.1.1",
        "npm-run-all": "^4.1.5",
        "prettier": "^2.0.4",
        "react-scripts": "4.0.3",
        "typescript": "^4.1.3",
        "vitest": "^0.31.4",
        "vitest-dom": "^0.1.0"
    }
  };
};


