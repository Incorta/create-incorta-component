const _ = require('lodash');

module.exports = opts => {
  const { description, directory: name } = opts;
  return {
    icon: './assets/icon.svg',
    name,
    hint: description,
    settings: [
      {
        name: {
          key: 'group'
        },
        settings: [
          {
            name: {
              key: 'setting'
            },
            key: 'key1',
            type: 'boolean'
          }
        ]
      }
    ],
    bindingsTrays: [
      {
        key: 'tray-key',
        name: { key: 'tray' },
        queryRole: 'measure',
        minCount: 1
      }
    ]
  };
};
