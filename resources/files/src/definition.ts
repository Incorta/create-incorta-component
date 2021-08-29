import { ChartDefinitionBase, InsightDefinition, QueryRole } from '@incorta-org/visual-sdk';
import icon from './../assets/icon.png';
import enUS from '../locales/en-US.json';

interface MyChartDefinition extends ChartDefinitionBase {
  settings: {
    autoRefresh: boolean;
  };
  bindings: {
    measure: {
      color: string;
    };
  };
}

const visualDefinition: InsightDefinition<MyChartDefinition> = {
  info: {
    icon,
    locale: {
      'en-US': enUS
    }
  },
  settings: [
    {
      name: 'settings',
      settings: [
        {
          metaKey: 'autoRefresh',
          name: { key: 'common.settings.autoRefresh' },
          datatype: 'boolean'
        }
      ]
    }
  ],
  bindingsTrays: [
    {
      metaKey: 'measure',
      queryRole: QueryRole.measure,
      name: 'measure',
      placeholder: 'sortPlaceholder',
      bindingSettings: [
        {
          name: 'setting1',
          settings: [
            {
              metaKey: 'color',
              name: 'color',
              datatype: 'string',
              uiControlKey: 'color-picker',
              affectsData: false
            }
          ]
        }
      ]
    }
  ]
};

export default visualDefinition;
