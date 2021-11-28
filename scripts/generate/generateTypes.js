const generateTypes = {
  number: 'number',
  'page-size': 'number',
  'max-rows': 'number',
  'max-groups': 'number',

  boolean: 'boolean',
  'running-total': 'boolean',
  'row-total': 'boolean',
  'col-total': 'boolean',
  'show-empty-groups': 'boolean',

  dropdown: 'string',
  text: 'string',
  'number-format': 'string',
  'date-format': 'string',
  scale: 'string',
  color: 'string',
  'join-measures': 'string',
  'missing-values': 'string',
  'row-sub-total': 'string',
  'col-sub-total': 'string',

  range: {
    type: 'Range',
    imports: ['Range']
  },

  'drill-down': {
    type: 'DrillDown',
    imports: ['DrillDown']
  },

  filter: {
    type: 'FilterState[]',
    imports: ['FilterState']
  },

  'conditional-formatting': {
    type: 'Condition[]',
    imports: ['Condition']
  },

  sort: {
    type: 'SortState[]',
    imports: ['SortState']
  }
};

module.exports = generateTypes;
