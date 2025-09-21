const { camelCase, startCase } = require('lodash');

const pipelineTypesGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `export interface ChartConfig {
  title?: string;
  functionType?: string;
  options?: any;
}

export interface DataSourceConfig {
  type: 'useQuery' | 'customQuery';
  query?: string;
}

export interface LLMResponse {
  explanation: string;
  dataRelationships: string;
  dataSource: DataSourceConfig;
  recommendedDisplayFormat: 'highcharts' | 'table' | 'html';
  recommendedChartType?: string;
  transformationFunction: string ;
  reasoning: string;
  chartConfig: {
    title: string;
    functionType: 'highcharts' | 'table' | 'html';
    generatedCode?: string;
    options: any;
  };
}

export interface DisplayConfig {
  type: 'highcharts' | 'table' | 'html';
  subtype: string;
}

export interface ChartConfig {
  title?: string;
  options?: any;
}
`;
};

module.exports = pipelineTypesGenerator;