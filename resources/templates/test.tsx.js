const { camelCase, startCase } = require('lodash');

const componentIndexGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return {
    pascalCaseName,
    component: `import React from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import ${pascalCaseName} from './${pascalCaseName}';
import { Context, ResponseData, TContext } from '@incorta-org/component-sdk';

const exampleContext: Context<TContext> = {
  app: {
    color_palette: [],
    features: {},
    loginInfo: {},
    locale: {
      locale: 'en',
      formatMessage(key) {
        return '';
      }
    }
  },
  component: {
    dimensions: {
      width: 862,
      height: 1070
    },
    settings: {
      key1: true
    },
    bindings: {
      'tray-key': [
        {
          id: 'h-06D4X-Svy',
          name: 'Cost',
          field: {
            column: 'SALES.SALES.COST_OF_GOODS',
            datatype: 'double',
            supportHierarchy: false,
            function: 'measure'
          },
          settings: {}
        }
      ]
    },
    id: 'e95dafdc-bf08-451f-bb0d-f451496e22d4',
    version: '0.0.1',
    numberOfElementsInRow: 1,
    widthScale: 1,
    automaticHeight: 0
  }
};

const exampleData: ResponseData = {
  isSampled: false,
  subqueryComplete: true,
  rowHeaders: [],
  measureHeaders: [
    {
      label: 'Cost',
      dataType: 'double',
      id: 'h-06D4X-Svy',
      index: 0
    }
  ],
  data: [
    [
      {
        value: '1670.79',
        formatted: '1,670.79'
      }
    ]
  ],
  isAggregated: false,
  startRow: 0,
  endRow: 1000,
  totalRows: 918843,
  complete: false,
  raw: false
};

describe('<${pascalCaseName} />', () => {
  it('should render Hello Incorta Component', () => {
    let drilldown = vi.fn();

    let { getByText } = render(
      <${pascalCaseName} context={exampleContext} data={exampleData} drillDown={drilldown} prompts={{}} />
    );

    expect(getByText(/Hello Incorta Component/i)).toBeInTheDocument();
  });
});
`
  };
};

module.exports = componentIndexGenerator;
