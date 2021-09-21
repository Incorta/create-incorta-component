const _ = require('lodash');

module.exports = opts => {
  const { description } = opts;
  return {
    icon: './assets/icon.png',
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
