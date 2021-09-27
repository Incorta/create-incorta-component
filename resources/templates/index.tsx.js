const { camelCase, startCase } = require('lodash');

const componentIndexGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import React from 'react';
import { ComponentProps } from '@incorta-org/component-sdk';
import './styles.less';

const ${pascalCaseName} = (props: ComponentProps) => {
  console.log(props);
  return (
    <div className="test">
      <h1>Hello incorta Component</h1>
    </div>
  );
};

export default ${pascalCaseName};
`;
};

module.exports = componentIndexGenerator;
