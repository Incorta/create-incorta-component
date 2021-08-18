const { camelCase, startCase } = require("lodash");

const visualizationIndexGenerator = ({ directory, description }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, "");
  return `
import * as React from "react";
import "./styles.less";

export const ${pascalCaseName} = ({ text }: { text: string }) => {
  return (
    <div className="test">
      <h1>Hello Incorta Visual</h1>
      <p>${description}</p>
      <p>{text}</p>
    </div>
  );
};

export { default as visualDefinition } from "./definition";`;
};

module.exports = visualizationIndexGenerator;
