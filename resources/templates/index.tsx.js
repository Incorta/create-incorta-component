const { camelCase, startCase } = require('lodash');

const visualizationIndexGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import * as React from 'react';
import { VisualProps } from '@incorta-org/visual-sdk';
import './styles.less';

const ${pascalCaseName} = (props: VisualProps) => {
  console.log(props)
  return (
    <div className="test">
      <h1>Hello Incorta Visual</h1>
    </div>
  );
};

export default ${pascalCaseName};
`;
};

module.exports = visualizationIndexGenerator;
