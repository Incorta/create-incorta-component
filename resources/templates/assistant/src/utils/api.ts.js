const { camelCase, startCase } = require('lodash');

const apiGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import axios from 'axios';
import { CONFIG } from '../types/constants';

const api = axios.create({
  baseURL: CONFIG.FASTAPI_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ComponentRequest {
  prompt: string;
}

export interface ComponentResponse {
  analysis_result: any;
  definition_result: any;
  visualization_result: any;
  timestamp: string;
}

export const previewAPI = {
  /**
   * Generate component data directly (fallback if postMessage fails)
   */
  generateComponent: async (request: ComponentRequest): Promise<ComponentResponse> => {
    const response = await api.post<ComponentResponse>('/generate-component', request);
    return response.data;
  },

  /**
   * Health check
   */
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default previewAPI;
`;
};

module.exports = apiGenerator;