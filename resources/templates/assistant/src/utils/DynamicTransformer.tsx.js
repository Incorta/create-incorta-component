const { camelCase, startCase } = require('lodash');

const dynamicTransformerGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import React from 'react';

// Safe function execution utility for LLM-generated transformations
export class DynamicTransformer {
  private static createSafeFunction(functionString: string): Function | null {
    try {
      // Clean and validate the function string
      let cleanedFunction = this.sanitizeFunctionString(functionString);
      
      // Check if the function string includes the function call
      // If not, add it automatically
      if (!cleanedFunction.includes('return transformData(data)') && 
          cleanedFunction.includes('function transformData(data)')) {
        console.log('Adding missing function call to transformation function');
        cleanedFunction += '\\n\\nreturn transformData(data);';
      }
      
      // Alternative pattern: if function ends with just closing brace, add the call
      if (cleanedFunction.trim().endsWith('}') && 
          cleanedFunction.includes('function transformData(data)') && 
          !cleanedFunction.includes('return transformData(data)')) {
        console.log('Adding missing function call after function definition');
        cleanedFunction += '\\n\\nreturn transformData(data);';
      }
      
      console.log('Final cleaned function:', cleanedFunction);
      
      // Create a safe execution context with limited scope
      const safeGlobals = {
        console: { log: console.log, warn: console.warn, error: console.error },
        Math,
        Object,
        Array,
        JSON,
        Date,
        // Add other safe globals as needed
      };
      
      // Create the function with controlled scope
      const func = new Function(
        ...Object.keys(safeGlobals),
        'data',
        \`
        "use strict";
        \${cleanedFunction}
        \`
      );
      
      // Bind the safe globals
      return func.bind(null, ...Object.values(safeGlobals));
    } catch (error) {
      console.error('Failed to create transformation function:', error);
      return null;
    }
  }
  
  private static sanitizeFunctionString(functionString: string): string {
    // Remove potentially dangerous patterns and external library references
    const dangerous = [
      /eval\\\s*\\\(/gi,
      /Function\\\s*\\\(/gi,
      /window\\\./gi,
      /document\\\./gi,
      /global\\\./gi,
      /process\\\./gi,
      /require\\\s*\\\(/gi,
      /import\\\s+/gi,
      /export\\\s+/gi,
      /__proto__/gi,
      /constructor/gi,
      // Block external library references
      /Highcharts\\\./gi,
      /jQuery\\\./gi,
      /\\\$\\\./gi,
      /lodash\\\./gi,
      /_\\\./gi,
      /moment\\\./gi,
      /React\\\./gi,
    ];
    
    let cleaned = functionString;
    dangerous.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '/* blocked external library */');
    });
    
    return cleaned;
  }
  
  public static executeTransformation(
    data: any,
    transformFunction: string,
    displayFormat: any
  ): any {
    console.log('Executing dynamic transformation:', { 
      transformFunction: transformFunction, 
      displayFormat,
      dataStructure: {
        hasData: !!data?.data,
        dataLength: data?.data?.length,
        rowHeaders: data?.rowHeaders?.length || 0,
        measureHeaders: data?.measureHeaders?.length || 0,
        firstRowSample: data?.data?.[0]
      }
    });
    
    try {
      // Create the safe function
      const func = this.createSafeFunction(transformFunction);
      console.log('func', func);
      
      if (!func) {
        console.warn('Failed to create transformation function, using fallback');
        return this.fallbackTransformation(data, displayFormat);
      }
      
      // Execute the transformation with timeout protection (synchronous)
      try {
        console.log('Executing transformation function with data:', data);
        const result = func(data);
        console.log('Transformation result:', result);
        return result;
      } catch (executionError) {
        console.error('Transformation execution failed:', executionError);
        return this.fallbackTransformation(data, displayFormat);
      }
      
    } catch (error) {
      console.error('Transformation error:', error);
      return this.fallbackTransformation(data, displayFormat);
    }
  }
  
  private static fallbackTransformation(data: any, displayFormat: any): any {
    // Simple fallback transformation based on display type
    console.log('Using fallback transformation for:', displayFormat.type);
    
    switch (displayFormat.type) {
      case 'highcharts':
        return this.basicHighchartsTransform(data);
      case 'table':
        return this.basicTableTransform(data);
      case 'html':
        return this.basicHtmlTransform(data);
      default:
        return data;
    }
  }
  
  private static basicHighchartsTransform(data: any): any {
    if (!data?.data || !Array.isArray(data.data)) return data;
    
    // Flexible fallback that works for most chart types
    const series = [{
      name: 'Data',
      data: data.data.map((row: any[], index: number) => {
        // Handle different chart type data structures
        const firstCol = row[0]?.formatted || row[0]?.value || \`Item \${index}\`;
        const secondCol = Number(row[1]?.value || row[1]?.formatted || 0);
        
        // Basic structure that works for most chart types
        return {
          name: firstCol,
          y: secondCol,
          value: secondCol, // For treemap, bubble charts
          // Could add more fields for specialized charts
        };
      })
    }];
    
    return {
      ...data,
      highchartsData: { 
        series, 
        categories: data.data.map((row: any[]) => row[0]?.formatted || row[0]?.value),
        originalData: data 
      }
    };
  }
  
  private static basicTableTransform(data: any): any {
    if (!data?.data || !Array.isArray(data.data)) return data;
    
    const headers = [
      ...(data.rowHeaders?.map((h: any) => h.label || h.name) || []),
      ...(data.measureHeaders?.map((h: any) => h.label || h.name) || [])
    ];
    
    const rows = data.data.map((row: any[]) => 
      row.map((cell: any) => cell?.formatted || cell?.value || '')
    );
    
    return {
      ...data,
      tableData: { headers, rows, originalData: data }
    };
  }
  
  private static basicHtmlTransform(data: any): any {
    if (!data?.data || !Array.isArray(data.data)) return data;
    
    const items = data.data.map((row: any[], index: number) => ({
      id: index,
      content: row.map(cell => cell?.formatted || cell?.value || '').join(' - ')
    }));
    
    return {
      ...data,
      htmlData: { items, originalData: data }
    };
  }
}

// Hook wrapper for easy use in React components
export const useDynamicTransformation = () => {
  const executeTransformation = React.useCallback(
    (data: any, transformFunction: string, displayFormat: any) => {
      return DynamicTransformer.executeTransformation(data, transformFunction, displayFormat);
    },
    []
  );
  
  return { executeTransformation };
};
`;
};

module.exports = dynamicTransformerGenerator;


