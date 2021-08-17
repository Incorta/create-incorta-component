"use strict";

const inquirer = require("inquirer");

/**
 * @param {string|null} projectName - The name/path of project
 * @param {string|null} template - The Github repo of the template
 * @returns Object containting prompt answers
 */
module.exports = async function promptUser(projectName) {
  const questions = await getPromptQuestions(projectName);
  const [initialResponse, templateQuestion] = await Promise.all([
    inquirer.prompt(questions),
  ]);

  return initialResponse;
};

/**
 *
 * @returns Array of prompt question objects
 */
async function getPromptQuestions(projectName, template) {
  return [
    {
      type: "input",
      default: "my-incorta-visual",
      name: "directory",
      message: "What would you like to name your Incorta visualization?",
      when: !projectName,
    },
    {
      type: "input",
      name: "description",
      message: "Describe you visualization in a few words?",
    },
    {
      type: "input",
      name: "author",
      message: "Author name?",
      default: "dev",
    },
  ];
}
