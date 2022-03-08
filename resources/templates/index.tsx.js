const { camelCase, startCase } = require('lodash');

const componentIndexGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return {
    pascalCaseName,
    component: `import {
  AppliedPrompts,
  Context,
  onDrillDownFunction,
  ResponseData,
  TContext
} from '@incorta-org/component-sdk';
import React from 'react';

interface Props {
  context: Context<TContext>;
  prompts: AppliedPrompts;
  data: ResponseData;
  drillDown: onDrillDownFunction;
}

const ${pascalCaseName} = ({ context, prompts, data, drillDown }: Props) => {
  console.log({ context, prompts, data, drillDown });
  return (
    <div className="test">
      <h1>Hello Incorta Component</h1>
    </div>
  );
};

export default ${pascalCaseName};
`,
    index: `import React from 'react';
import {
  useContext,
  LoadingOverlay,
  ErrorOverlay,
  usePrompts,
  useQuery
} from '@incorta-org/component-sdk';
import ${pascalCaseName} from './${pascalCaseName}';
import './styles.less';

export default () => {
  const { prompts, drillDown } = usePrompts();
  const { data, context, isLoading, isError, error } = useQuery(useContext(), prompts);
  return (
    <ErrorOverlay isError={isError} error={error}>
      <LoadingOverlay isLoading={isLoading} data={data}>
        {context && data ? (
          <${pascalCaseName} data={data} context={context} prompts={prompts} drillDown={drillDown} />
        ) : null}
      </LoadingOverlay>
    </ErrorOverlay>
  );
};
`
  };
};

module.exports = componentIndexGenerator;
