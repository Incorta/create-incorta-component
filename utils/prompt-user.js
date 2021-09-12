'use strict';

const inquirer = require('inquirer');

module.exports = async function promptUser(projectName) {
  const questions = await getPromptQuestions(projectName);
  const [initialResponse, templateQuestion] = await Promise.all([inquirer.prompt(questions)]);

  return initialResponse;
};

async function getPromptQuestions(projectName, template) {
  return [
    {
      type: 'input',
      default: 'my-incorta-visual',
      name: 'directory',
      message: 'What would you like to name your Incorta visualization?',
      when: !projectName
    },
    {
      type: 'input',
      name: 'description',
      message: 'Describe you visualization in a few words?'
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author name?',
      default: 'dev'
    }
  ];
}
