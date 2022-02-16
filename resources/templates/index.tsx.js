const { camelCase, startCase } = require('lodash');

const componentIndexGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import React from 'react';
import { useContext } from '@incorta-org/component-sdk';
import './styles.less';

const ${pascalCaseName} = () => {
  const context = useContext();
  console.log(context);
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
