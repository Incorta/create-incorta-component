const { kebabCase } = require("lodash");

const generatedTemplate = ({
  directory,
  version = "0.0.1",
  description,
  author,
}) => {
  const kebabCaseDirectory = kebabCase(directory);
  return `import {
  ChartDefinitionBase,
  InsightDefinition,
  QueryRole,
} from "@incorta-org/visual-sdk";
import icon from "./../assets/icon.png";
import enUS from "../locales/en-US.json";

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

//@ts-ignore
const visualDefinition: InsightDefinition<MyChartDefinition> = {
  info: {
    id: "${kebabCaseDirectory}",
    version: "${version}",
    name: "${directory}",
    hint: "${description}",
    author: "${author}",
    icon,
    locale: {
      "en-US": enUS,
    },
    isGraph: false,
    supportEngineQuery: true,
    queryDetailedValues: () => true,
  },
  settings: [
    {
      name: "settings",
      settings: [
        {
          metaKey: "autoRefresh",
          name: { key: "common.settings.autoRefresh" },
          datatype: "boolean",
        },
      ],
    },
  ],
  bindingsTrays: [
    {
      metaKey: "measure",
      queryRole: QueryRole.measure,
      name: "measure",
      placeholder: "sortPlaceholder",
      bindingSettings: [
        {
          name: "setting1",
          settings: [
            {
              metaKey: "color",
              name: "color",
              datatype: "string",
              uiControlKey: "color-picker",
              affectsData: false,
            },
          ],
        },
      ],
    },
  ],
};

export default visualDefinition;
`;
};

const chartDefinitionGenerator = (options) => {
  return generatedTemplate(options);
};

module.exports = chartDefinitionGenerator;
