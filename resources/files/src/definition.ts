import {
  ChartDefinitionBase,
  InsightDefinition,
  LocaleHelper,
  QueryRole
} from '@incorta-org/visual-sdk';
import icon from './../assets/icon.png';
import enUS from './locales/en-US.json';

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

const locales = new LocaleHelper({
  'en-US': enUS
});

const visualDefinition: InsightDefinition<MyChartDefinition> = {
  info: {
    icon
  },
  settings: [
    {
      name: 'settings',
      settings: [
        {
          metaKey: 'autoRefresh',
          name: locales.formatMessage('autoRefresh'),
          datatype: 'boolean',
          defaultValue: true
        }
      ]
    }
  ],
  bindingsTrays: [
    {
      metaKey: 'measure',
      queryRole: QueryRole.measure,
      name: locales.formatMessage('measure'),
      minCount: 1,
      bindingSettings: [
        {
          name: locales.formatMessage('setting'),
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
