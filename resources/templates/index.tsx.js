const { camelCase, startCase } = require('lodash');

const componentIndexGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import React from 'react';
import {
  useContext,
  LoadingOverlay,
  ErrorOverlay,
  usePrompts,
  useQuery
} from '@incorta-org/component-sdk';
import './styles.less';

const ${pascalCaseName} = () => {
  const { prompts } = usePrompts();
  const { data, context, isLoading, isError, error } = useQuery(useContext(), prompts);

  console.log({ context, data });

  return (
    <ErrorOverlay isError={isError} error={error}>
      <LoadingOverlay isLoading={isLoading} data={data}>
        <div className="test">
          <h1>Hello incorta Component</h1>
        </div>
      </LoadingOverlay>
    </ErrorOverlay>
  );
};

export default ${pascalCaseName};
`;
};

module.exports = componentIndexGenerator;
