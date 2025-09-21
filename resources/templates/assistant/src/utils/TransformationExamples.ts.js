const { camelCase, startCase } = require('lodash');

const transformationExamplesGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `// Example transformation functions that the LLM can generate
// These show the power and flexibility of dynamic transformations

export const TRANSFORMATION_EXAMPLES = {
  
  // Basic Highcharts column chart
  highchartsColumn: \`
function transformData(data) {
  if (!data?.data || !Array.isArray(data.data)) return data;
  
  const series = [{
    name: 'Data',
    data: data.data.map((row, index) => ({
      name: row[0]?.formatted || row[0]?.value || \\\`Item \\\${index}\\\`,
      y: Number(row[1]?.value || row[1]?.formatted || 0)
    }))
  }];
  
  return {
    ...data,
    highchartsData: { series, originalData: data }
  };
}

return transformData(data);
  \`,

  // Advanced Highcharts pie chart with percentages
  highchartsPie: \`
function transformData(data) {
  if (!data?.data || !Array.isArray(data.data)) return data;
  
  const total = data.data.reduce((sum, row) => {
    return sum + (Number(row[1]?.value || row[1]?.formatted || 0));
  }, 0);
  
  const series = [{
    name: 'Distribution',
    type: 'pie',
    data: data.data.map((row, index) => {
      const value = Number(row[1]?.value || row[1]?.formatted || 0);
      return {
        name: row[0]?.formatted || row[0]?.value || \\\`Item \\\${index}\\\`,
        y: value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0
      };
    })
  }];
  
  return {
    ...data,
    highchartsData: { series, originalData: data }
  };
}

return transformData(data);
  \`,

  // Multi-series line chart with date parsing
  highchartsMultiSeries: \`
function transformData(data) {
  if (!data?.data || !Array.isArray(data.data)) return data;
  
  // Group data by series (assuming 3rd column is series identifier)
  const seriesMap = {};
  
  data.data.forEach(row => {
    const seriesName = row[2]?.formatted || row[2]?.value || 'Default Series';
    const xValue = row[0]?.formatted || row[0]?.value;
    const yValue = Number(row[1]?.value || row[1]?.formatted || 0);
    
    if (!seriesMap[seriesName]) {
      seriesMap[seriesName] = [];
    }
    
    seriesMap[seriesName].push([xValue, yValue]);
  });
  
  const series = Object.keys(seriesMap).map(seriesName => ({
    name: seriesName,
    data: seriesMap[seriesName]
  }));
  
  return {
    ...data,
    highchartsData: { series, originalData: data }
  };
}

return transformData(data);
  \`,

  // Advanced table with sorting and formatting
  advancedTable: \`
function transformData(data) {
  if (!data?.data || !Array.isArray(data.data)) return data;
  
  const dimensionHeaders = data.rowHeaders?.map(h => h.label || h.name) || [];
  const measureHeaders = data.measureHeaders?.map(h => h.label || h.name) || [];
  const headers = [...dimensionHeaders, ...measureHeaders];
  
  // Process rows with advanced formatting
  const rows = data.data.map(row => 
    row.map((cell, index) => {
      const value = cell?.formatted || cell?.value || '';
      
      // Apply special formatting for numeric columns
      if (index >= dimensionHeaders.length && !isNaN(Number(cell?.value))) {
        const num = Number(cell?.value);
        return {
          value: value,
          numericValue: num,
          formatted: num.toLocaleString(),
          isNumeric: true
        };
      }
      
      return {
        value: value,
        formatted: value,
        isNumeric: false
      };
    })
  );
  
  // Sort by first numeric column (descending)
  const firstNumericColumn = dimensionHeaders.length;
  rows.sort((a, b) => {
    const aVal = a[firstNumericColumn]?.numericValue || 0;
    const bVal = b[firstNumericColumn]?.numericValue || 0;
    return bVal - aVal;
  });
  
  return {
    ...data,
    tableData: { 
      headers, 
      rows: rows.map(row => row.map(cell => cell.formatted)),
      enhancedRows: rows,
      originalData: data 
    }
  };
}

return transformData(data);
  \`,

  // Creative HTML with cards layout
  htmlCards: \`
function transformData(data) {
  if (!data?.data || !Array.isArray(data.data)) return data;
  
  const items = data.data.map((row, index) => {
    const title = row[0]?.formatted || row[0]?.value || \\\`Item \\\${index}\\\`;
    const value = row[1]?.formatted || row[1]?.value || '0';
    const description = row[2]?.formatted || row[2]?.value || '';
    
    return {
      id: index,
      title: title,
      value: value,
      description: description,
      content: \\\`
        <div class="data-card" style="
          border: 1px solid #ddd; 
          border-radius: 8px; 
          padding: 16px; 
          margin: 8px; 
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          <h3 style="margin: 0 0 8px 0; color: #2c3e50;">\\\${title}</h3>
          <div style="font-size: 24px; font-weight: bold; color: #e74c3c; margin: 8px 0;">\\\${value}</div>
          \\\${description ? \\\`<p style="margin: 8px 0 0 0; color: #7f8c8d; font-size: 14px;">\\\${description}</p>\\\` : ''}
        </div>
      \\\`
    };
  });
  
  return {
    ...data,
    htmlData: { items, originalData: data }
  };
}

return transformData(data);
  \`,

  // Heatmap transformation for Highcharts
  highchartsHeatmap: \`
function transformData(data) {
  if (!data?.data || !Array.isArray(data.data)) return data;
  
  // Assuming data has x-category, y-category, and value
  const categories = [...new Set(data.data.map(row => row[0]?.formatted || row[0]?.value))];
  const yCategories = [...new Set(data.data.map(row => row[1]?.formatted || row[1]?.value))];
  
  const series = [{
    name: 'Heatmap',
    data: data.data.map(row => {
      const x = categories.indexOf(row[0]?.formatted || row[0]?.value);
      const y = yCategories.indexOf(row[1]?.formatted || row[1]?.value);
      const value = Number(row[2]?.value || row[2]?.formatted || 0);
      
      return [x, y, value];
    })
  }];
  
  return {
    ...data,
    highchartsData: { 
      series, 
      categories,
      yCategories,
      originalData: data 
    }
  };
}

return transformData(data);
  \`,
};

// Helper function to get example by chart type
export const getTransformationExample = (chartType: string, displayType: string): string => {
  const key = \`\${displayType}\${chartType.charAt(0).toUpperCase() + chartType.slice(1)}\`;
  return TRANSFORMATION_EXAMPLES[key as keyof typeof TRANSFORMATION_EXAMPLES] || TRANSFORMATION_EXAMPLES.highchartsColumn;
};
`;
};

module.exports = transformationExamplesGenerator;