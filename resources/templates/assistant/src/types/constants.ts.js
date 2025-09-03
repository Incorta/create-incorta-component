const { camelCase, startCase } = require('lodash');

const constantsGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `export const CONFIG = {
  CHAT_ORIGIN: 'http://localhost:5173',
  PREVIEW_ORIGIN: 'http://localhost:3001',
  FASTAPI_BASE: 'http://localhost:8080',
  EXPORT_API_BASE: 'http://localhost:8080',
  EXPORT_WS_BASE: 'ws://localhost:8080/ws',
  PREVIEW_TEMPLATE_VERSION: 'latest',
  DEFAULT_SESSION_ID: 'dev',
  PREVIEW_REQUIRE_LLM_IN_DEV: true
    } as const;`;
};

module.exports = constantsGenerator;