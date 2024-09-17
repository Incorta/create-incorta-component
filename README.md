## Incorta Component SDK

The Incorta Component SDK is used to create new visualizations or plugins for Incorta Analyzer and Dashboards.

Development of Incorta Components presumes knowledge of HTML, CSS, JSON, Javascript, Node.js, NPM, React, and Typescript. You will also need to be familiar with Incorta, including Incorta Analyzer, and analytics concepts in general.

#### Prerequisites

- You'll need access to an Incorta cluster. [Incorta Cloud signup](https://cloud.incorta.com/signup/) is quick and easy.
- A code editor. Even if you have another favorite editor, we recommend [Visual Studio Code](https://code.visualstudio.com) so that you can take advantage of the auto-complete in the configuration JSON files.
- [Node.js](https://nodejs.org/) in order to get NPM (Node Package Manager)

#### Install the Incorta component package

This lets you create new Incorta components and run the testing server.

```bash
% npm install -g @incorta-org/create-incorta-component
```

#### To Create a new Incorta Component

```bash
% create-incorta-component new
```

#### Compatibility

- Components created with create-incorta-component version `2.x.x` are compatible with incorta release `2022.12.0` or higher
