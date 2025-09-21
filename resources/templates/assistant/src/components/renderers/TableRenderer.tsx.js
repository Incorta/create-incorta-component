const { camelCase, startCase } = require('lodash');

const tableRendererGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import React from 'react';
import { ChartConfig } from '../../types/pipeline';

interface TableRendererProps {
  data: any;
  tableType: string;
  config: ChartConfig;
}

export const TableRenderer: React.FC<TableRendererProps> = ({ 
  data, 
  tableType, 
  config 
}) => {
  const tableProps = useTableOptions(data, tableType, config);
  
  return tableType === 'simple' ? 
    <SimpleTable {...tableProps} /> : 
    <InteractiveTable {...tableProps} />;
};

const useTableOptions = (data: any, tableType: string, config: ChartConfig) => {
  const headers = data.tableData?.headers || extractHeaders(data);
  const rows = data.tableData?.rows || extractRows(data);
  
  return {
    title: config.title || 'Data Table',
    headers,
    rows,
    config: config.options || {}
  };
};

const extractHeaders = (data: any) => {
  if (data.counts) {
    return ['Category', 'Count'];
  }
  
  if (data?.measureHeaders || data?.rowHeaders) {
    const rowHeaders = data.rowHeaders?.map((h: any) => h.label || h.name) || [];
    const measureHeaders = data.measureHeaders?.map((h: any) => h.label || h.name) || [];
    return [...rowHeaders, ...measureHeaders];
  }
  
  if (Array.isArray(data?.data) && data.data.length > 0) {
    const firstRow = data.data[0];
    return firstRow.map((_: any, index: number) => \`Column \${index + 1}\`);
  }
  
  return ['Data'];
};

const extractRows = (data: any) => {
  if (data.counts) {
    return data.counts.map((item: any) => [item.category, item.count]);
  }
  
  if (Array.isArray(data?.data)) {
    return data.data.map((row: any[]) => 
      row.map((cell: any) => cell?.formatted ?? cell?.value ?? '')
    );
  }
  
  return [['No data available']];
};

interface TableProps {
  title: string;
  headers: string[];
  rows: any[][];
  config: any;
}

const SimpleTable: React.FC<TableProps> = ({ title, headers, rows, config }) => {
  return (
    <div style={{ width: '100%', padding: '16px' }}>
      <h3>{title}</h3>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        border: '1px solid #ddd'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            {headers.map((header, index) => (
              <th 
                key={index}
                style={{ 
                  padding: '12px', 
                  textAlign: 'left',
                  border: '1px solid #ddd',
                  fontWeight: 'bold'
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex}
                  style={{ 
                    padding: '8px 12px', 
                    border: '1px solid #ddd',
                    textAlign: typeof cell === 'number' ? 'right' : 'left'
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const InteractiveTable: React.FC<TableProps> = ({ title, headers, rows, config }) => {
  return <SimpleTable title={title} headers={headers} rows={rows} config={config} />;
};
`;
};

module.exports = tableRendererGenerator;


