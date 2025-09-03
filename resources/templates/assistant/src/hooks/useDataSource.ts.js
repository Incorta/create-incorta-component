const { camelCase, startCase } = require('lodash');

const useDataSourceGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import { useMemo } from 'react';
import { useContext, useQuery, useCustomQuery, useQueryBuilder } from '@incorta-org/component-sdk';
import { DataSourceConfig } from '../types/pipeline';


export const useDataSource = (dataSourceConfig: DataSourceConfig, context: any, prompts: any, fallbackData: any) => {
  console.log("configured data source", { dataSourceConfig });
  
  // Always call hooks at the top level - this is required by Rules of Hooks
  
  // Call useQueryBuilder for query building scenarios (always called, but only used when needed)
  const {data : queryBuilderResult} = useQueryBuilder(useContext(), prompts);
  
  // Create query object for custom queries
  const customQueryObject = useMemo(() => {
    if (dataSourceConfig.type === 'customQuery' && dataSourceConfig.query) {
      // Create a minimal InsightQuery object for custom SQL queries
      const insightQuery: any = {
        version: 1, // Required field
        measures: [], // Required field - empty for custom SQL
        sqlQuery: dataSourceConfig.query, // The custom SQL query
        formatted: true,
        showHeader: true,
        maxRows: 10000, 
      };
      
      console.log('Created InsightQuery for custom SQL:', insightQuery);
      return insightQuery;
    } else if (dataSourceConfig.type === 'useQuery') {
      return queryBuilderResult;
    }
    return null;
  }, [dataSourceConfig, queryBuilderResult]);
  
  // Call useCustomQuery (always called, but only used when needed)
  // Pass null when not using custom queries to avoid TypeScript errors
  const customQueryResult = useCustomQuery(customQueryObject);

  // Return the appropriate data based on configuration
  return useMemo(() => {
    if (dataSourceConfig.type === 'useQuery') {
      // Standard flow: useQuery handles everything internally (queryBuilder + execution)
      const { data: queryData } = customQueryResult || { data: null };
      return queryData || fallbackData;
    } else if (dataSourceConfig.type === 'customQuery') {
      // Both queryBuilder and customQuery types use useCustomQuery:
      // - queryBuilder: uses built query from useQueryBuilder
      // - customQuery: uses manually created InsightQuery with sqlQuery
      if (customQueryObject) {
        const { data: customData } = customQueryResult || { data: null };
        console.log(\`\${dataSourceConfig.type} result:\`, customData);
        return customData || fallbackData;
      } else {
        // No valid query object, return fallback
        console.warn(\`No valid \${dataSourceConfig.type} object provided, using fallback data\`);
        return fallbackData;
      }
    }

    // Default case - return fallback data
    return fallbackData;
  }, [dataSourceConfig, customQueryResult, customQueryObject, fallbackData]);
};
`;
};

module.exports = useDataSourceGenerator;


