const { camelCase, startCase } = require('lodash');

const visualizationPipelineGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import React from 'react';
import { LLMResponse } from '../types/pipeline';
import { useDataSource } from '../hooks/useDataSource';
import { useDataTransformation } from '../hooks/useDataTransformation';
import { HighchartsRenderer } from './renderers/HighchartsRenderer';
import { TableRenderer } from './renderers/TableRenderer';
import { HtmlRenderer } from './renderers/HtmlRenderer';

interface VisualizationPipelineProps {
  spec: LLMResponse;
  context: any;
  prompts: any;
  fallbackData: any;
}

export const VisualizationPipeline: React.FC<VisualizationPipelineProps> = ({ 
  spec, 
  context,
  prompts,
  fallbackData 
}) => {
  console.log('VisualizationPipeline received spec:', spec);
  // Step 1: Data Source
  const sourceData = useDataSource(spec.dataSource, context, prompts, fallbackData);
  
  // Step 2: Data Transformation (aware of display format)
  const transformedData = useDataTransformation({sourceData: sourceData, transformation: spec.transformationFunction, displayFormat: spec.recommendedDisplayFormat});
  
  // Step 3: Conditional Rendering
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {renderVisualization(transformedData, spec.recommendedDisplayFormat, spec.chartConfig)}
    </div>
  );
};

const renderVisualization = (data: any, displayFormat: any, chartConfig: any) => {
  console.log('Rendering with:', { data, displayFormat, chartConfig });
  
  switch (displayFormat) {
    case 'highcharts':
      return (
        <HighchartsRenderer 
          data={data} 
          chartType={chartConfig.functionType} 
          config={chartConfig} 
        />
      );
    case 'table':
      return (
        <TableRenderer 
          data={data} 
          tableType={displayFormat.subtype} 
          config={chartConfig} 
        />
      );
    case 'html':
      console.log('Rendering HTML with chartConfig:', chartConfig);
      console.log('HTML data:', data);
      return (
        <HtmlRenderer 
          data={data} 
          config={chartConfig} 
        />
      );
    default:
      return (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <h3>Unsupported display format: {displayFormat.type}</h3>
          <p>Supported formats: highcharts, table, html</p>
        </div>
      );
  }
};
`;
};

module.exports = visualizationPipelineGenerator;


