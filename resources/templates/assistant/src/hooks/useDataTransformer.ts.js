const { camelCase, startCase } = require('lodash');

const useDataTransformerGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import { useMemo } from 'react';

export const useDataTransformer = (sourceData: any, transformation: any, displayFormat: any) => {
  const transformedData = useMemo(() => {
    // Data transformation logic will be implemented here
    return sourceData;
  }, [sourceData, transformation, displayFormat]);

  return transformedData;
};
`;
};

module.exports = useDataTransformerGenerator;
