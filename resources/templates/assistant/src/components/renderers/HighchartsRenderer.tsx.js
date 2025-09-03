const { camelCase, startCase } = require('lodash');

const highchartsRendererGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ChartConfig } from '../../types/pipeline';

// Import additional Highcharts modules for advanced chart types
// Using side-effect imports which automatically register with Highcharts
import 'highcharts/highcharts-more';
import 'highcharts/modules/treemap';
import 'highcharts/modules/sunburst';
import 'highcharts/modules/sankey';
import 'highcharts/modules/networkgraph';
import 'highcharts/modules/timeline';
import 'highcharts/modules/heatmap';
import 'highcharts/modules/map';
import 'highcharts/modules/organization';
import 'highcharts/modules/wordcloud';

console.log('Highcharts advanced modules loaded via side-effect imports');

interface HighchartsRendererProps {
  data: any;
  chartType: string;
  config: ChartConfig;
}

export const HighchartsRenderer: React.FC<HighchartsRendererProps> = ({ 
  data, 
  chartType, 
  config 
}) => {
  const chartOptions = useMemo(() => {
    console.log('HighchartsRenderer received:', { data, chartType, config });
    
    // Use LLM-provided chart options as base
    if (config.options && typeof config.options === 'object') {
      const baseOptions = {
        credits: { enabled: false },
        ...config.options,
        title: {
          text: config.title || 'Chart',
          ...config.options.title
        }
      };

      const hierarchicalCharts = ['sunburst', 'treemap', 'sankey', 'networkgraph', 'organization'];
      
      const finalOptions = {
        ...baseOptions,
        series: data.highchartsData?.series?.length > 0 ? data.highchartsData.series : baseOptions.series
      };
      
      // Only add xAxis for charts that need it (not hierarchical charts)
      if (!hierarchicalCharts.includes(chartType)) {
        finalOptions.xAxis = {
          ...baseOptions.xAxis,
          categories: data.highchartsData?.categories?.length > 0 ? data.highchartsData.categories : baseOptions.xAxis?.categories
        };
      }
      console.log('finalOptions', finalOptions);
      return finalOptions;
    }

    // Fallback if no valid options provided
    return {
      chart: { type: 'column' },
      title: { text: config.title || 'No chart configuration provided' },
      credits: { enabled: false },
      series: [{ name: 'No Data', data: [] }]
    };
  }, [data, chartType, config]);

  if (!chartOptions) {
    return <div>No chart configuration provided by LLM</div>;
  }

  console.log('series', chartOptions.series);

  return (
    <div style={{ width: '100%'}}>
      <HighchartsReact
        highcharts={Highcharts}
        options={{...chartOptions, chart: {...chartOptions.chart, zooming: {type: 'xy' }}}}
        // options={chartOptions}
      />
    </div>
  );
};
`;
};

module.exports = highchartsRendererGenerator;


