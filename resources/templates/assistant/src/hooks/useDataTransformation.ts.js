const { camelCase, startCase } = require('lodash');

const useDataTransformationGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import { useMemo } from 'react';
import { DynamicTransformer } from '../utils/DynamicTransformer';

export const useDataTransformation = ({sourceData, transformation, displayFormat}: {sourceData: any, transformation: string, displayFormat: any}) => {
  console.log("configured data transformation", { sourceData, transformation, displayFormat })
  return useMemo(() => {
    if (!sourceData) {
      console.log('No source data, returning empty');
      return sourceData;
    }
    
    try {
      // If LLM provided a custom transformation function, use it
      if (transformation) {
        console.log('Using LLM-generated transformation function');
        return DynamicTransformer.executeTransformation(
          sourceData, 
          transformation, 
          displayFormat
        );
      }
      
      // Fallback to built-in format conversion
      return formatForDisplayType(sourceData, displayFormat);
    } catch (error) {
      console.error('Data transformation error:', error);
      return sourceData; // Return original data on error
    }
  }, [sourceData, transformation, displayFormat]);
};

// Dimension/measure-aware format conversion for each display type
const formatForDisplayType = (data: any, displayFormat: any) => {
  if (!displayFormat || !data) return data;
  
  switch (displayFormat.type) {
    case 'highcharts':
      return convertToHighchartsFormat(data);
    case 'table':
      return convertToTableFormat(data);
    case 'html':
      return convertToHtmlFormat(data);
    default:
      return data;
  }
};

// Convert Incorta format to Highcharts format
const convertToHighchartsFormat = (data: any) => {
  if (!data?.data || !Array.isArray(data.data)) return data;
  
  // Extract dimensions (rowHeaders) and measures (measureHeaders) metadata
  const dimensions = data.rowHeaders || [];
  const measures = data.measureHeaders || [];
  const totalColumns = dimensions.length + measures.length;
  
  // Convert Incorta's array of arrays with {value, formatted} objects
  // to Highcharts' simple array of objects format
  const series = [{
    name: 'Data',
    data: data.data.map((row: any[]) => {
      // Get dimension value from first column 
      const firstDimensionCell = row[0];
      const dimensionLabel = firstDimensionCell?.formatted ?? firstDimensionCell?.value ?? 'Unknown';
      
      // Get measure value from first measure column 
      let measureValue = 0;
      const dimensionCount = dimensions.length;
      
      for (let i = dimensionCount; i < row.length; i++) {
        const cell = row[i];
        const numValue = Number(cell?.value ?? cell?.formatted);
        if (!isNaN(numValue)) {
          measureValue = numValue;
          break;
        }
      }
      
      return {
        name: dimensionLabel,
        y: measureValue
      };
    })
  }];
  
  const dimensionValues = data.data.map((row: any[]) => {
    const firstDimensionCell = row[0];
    return firstDimensionCell?.formatted ?? firstDimensionCell?.value ?? 'Unknown';
  });
  
  return {
    ...data,
    highchartsData: {
      series,
      categories: dimensionValues,
      dimensions,
      measures,
      originalData: data
    }
  };
};

// Convert Incorta format to Table format
const convertToTableFormat = (data: any) => {
  if (!data?.data || !Array.isArray(data.data)) return data;
  
  // Extract headers from Incorta dimensions and measures
  const dimensionHeaders = data.rowHeaders?.map((h: any) => h.label || h.name) || [];
  const measureHeaders = data.measureHeaders?.map((h: any) => h.label || h.name) || [];
  const headers = [...dimensionHeaders, ...measureHeaders];
  
  // Convert data rows from {value, formatted} objects to simple values
  const rows = data.data.map((row: any[]) => 
    row.map((cell: any) => cell?.formatted ?? cell?.value ?? '')
  );
  
  return {
    ...data,
    tableData: {
      headers,
      dimensionHeaders,
      measureHeaders,
      rows,
      originalData: data
    }
  };
};

// Convert Incorta format to HTML format
const convertToHtmlFormat = (data: any) => {
  if (!data?.data || !Array.isArray(data.data)) return data;
  
  // Extract dimensions and measures metadata for better HTML structure
  const dimensions = data.rowHeaders || [];
  const measures = data.measureHeaders || [];
  
  // Convert to simple items for HTML rendering with dimension/measure awareness
  const items = data.data.map((row: any[], index: number) => ({
    id: index,
    content: row.map(cell => cell?.formatted ?? cell?.value ?? '').join(' - '),
    dimensionValues: row.slice(0, dimensions.length).map(cell => cell?.formatted ?? cell?.value ?? ''),
    measureValues: row.slice(dimensions.length).map(cell => cell?.formatted ?? cell?.value ?? '')
  }));
  
  return {
    ...data,
    htmlData: {
      items,
      dimensions,
      measures,
      originalData: data
    }
  };
};`;
};

module.exports = useDataTransformationGenerator;


