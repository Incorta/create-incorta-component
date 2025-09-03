const { camelCase, startCase } = require('lodash');

const transformationTestGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `// Test file to validate LLM-generated transformation functions
import { DynamicTransformer } from './DynamicTransformer';

// Sample data that matches the actual structure from your error
const testData = {
  data: [
    [
      { value: "Bikes", formatted: "Bikes" },
      { value: 15, formatted: "15" }
    ],
    [
      { value: "Components", formatted: "Components" },
      { value: 8, formatted: "8" }
    ],
    [
      { value: "Clothing", formatted: "Clothing" },
      { value: 12, formatted: "12" }
    ]
  ],
  rowHeaders: [],
  measureHeaders: [
    { label: "Category", dataType: "string", id: "cat_1" },
    { label: "Product Count", dataType: "number", id: "count_1" }
  ]
};

// Example of a robust transformation function (what the optimized LLM should generate)
const robustTransformFunction = \`
function transformData(data) {
  if (!data?.data || !Array.isArray(data.data)) return data;
  
  // Use simple column indices instead of header name matching
  const series = [{
    name: 'Product Count by Category',
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
\`;

// Test the transformation
export function testTransformation() {
  console.log('=== Testing Robust Transformation Function ===');
  console.log('Input data:', JSON.stringify(testData, null, 2));
  
  const result = DynamicTransformer.executeTransformation(
    testData,
    robustTransformFunction,
    { type: 'highcharts', subtype: 'column' }
  );
  
  console.log('Transformation result:', JSON.stringify(result, null, 2));
  
  // Verify the result structure
  const isValid = result?.highchartsData?.series?.[0]?.data?.length === 3;
  console.log('Transformation valid:', isValid);
  
  return { result, isValid };
}

// Example of what the old problematic function looked like (for comparison)
const problematicTransformFunction = \`
function transformData(data) {
  if (!data?.data || !Array.isArray(data.data)) return data;
  
  const dimensions = data.rowHeaders || [];
  const measures = data.measureHeaders || [];
  
  // This fails because it looks for exact name matches
  const categoryIndex = dimensions.findIndex(header => header.name === 'Category');
  const productCountIndex = measures.findIndex(header => header.name === 'Product');

  if (categoryIndex === -1 || productCountIndex === -1) {
    console.error("Could not find 'Category' or 'Product' headers.");
    return data; 
  }

  // ... rest of function never executes due to the error above
}

return transformData(data);
\`;

export function testProblematicFunction() {
  console.log('=== Testing Problematic Function (for comparison) ===');
  
  const result = DynamicTransformer.executeTransformation(
    testData,
    problematicTransformFunction,
    { type: 'highcharts', subtype: 'column' }
  );
  
  console.log('Problematic function result:', result);
  return result;
}
`;
};

module.exports = transformationTestGenerator;