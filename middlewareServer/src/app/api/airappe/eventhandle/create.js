const fieldChecks = [
  {
    fieldName: 'name',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'action_type',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'enable',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'group_list',
    fieldType: 'array',
    required: true,
  },
  {
    fieldName: 'divice_groups',
    fieldType: 'array',
    required: false,
  },
  {
    fieldName: 'temperature_trigger_rule',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'remarks',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'specify_time',
    fieldType: 'object',
    required: false,
  },
  {
    fieldName: 'weekly_schedule',
    fieldType: 'object',
    required: false,
  },
];

const lineFieldChecks = [
  {
    fieldName: 'token',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'language',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'data_list',
    fieldType: 'object',
    required: true,
  },
  {
    fieldName: 'note',
    fieldType: 'string',
    required: false,
  },
];

const httpFieldChecks = [
  {
    fieldName: 'https',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'method',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'user',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'pass',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'host',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'port',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'data_type',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'url',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'custom_data',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'note',
    fieldType: 'string',
    required: false,
  },
];

const mailFieldChecks = [
  {
    fieldName: 'method',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'secure',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'from',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'user',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'pass',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'host',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'port',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'language',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'subject',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'to',
    fieldType: 'array',
    required: true,
  },
  {
    fieldName: 'cc',
    fieldType: 'array',
    required: true,
  },
  {
    fieldName: 'bcc',
    fieldType: 'array',
    required: true,
  },
  {
    fieldName: 'data_list',
    fieldType: 'object',
    required: true,
  },
  {
    fieldName: 'note',
    fieldType: 'string',
    required: false,
  },

];

const wiegandFieldChecks = [
  {
    fieldName: 'host',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'port',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'bits',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'index',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'syscode',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'special_card_number',
    fieldType: 'string',
    required: false,
  },
];

const ioboxFieldChecks = [
  {
    fieldName: 'brand',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'model',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'host',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'port',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'user',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'pass',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'iopoint',
    fieldType: 'array',
    required: true,
  },
];

// const iopointFieldChecks = [
//   {
//     fieldName: 'no',
//     fieldType: 'number',
//     required: true,
//   },
//   {
//     fieldName: 'enable',
//     fieldType: 'boolean',
//     required: true,
//   },
//   {
//     fieldName: 'default',
//     fieldType: 'boolean',
//     required: true,
//   },
//   {
//     fieldName: 'trigger',
//     fieldType: 'boolean',
//     required: true,
//   },
//   {
//     fieldName: 'delay',
//     fieldType: 'number',
//     required: true,
//   },
// ];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `eventhandle create ${JSON.stringify(data)}`);

  const { action_type: actionType } = data;

  if (actionType === 'line') {
    data = global.spiderman.validate.data({
      data,
      fieldChecks: [...fieldChecks, ...lineFieldChecks],
    });
  } else if (actionType === 'http') {
    data = global.spiderman.validate.data({
      data,
      fieldChecks: [...fieldChecks, ...httpFieldChecks],
    });
  } else if (actionType === 'mail') {
    data = global.spiderman.validate.data({
      data,
      fieldChecks: [...fieldChecks, ...mailFieldChecks],
    });
  } else if (actionType === 'wiegand') {
    data = global.spiderman.validate.data({
      data,
      fieldChecks: [...fieldChecks, ...wiegandFieldChecks],
    });
  } else if (actionType === 'iobox') {
    data = global.spiderman.validate.data({
      data,
      fieldChecks: [...fieldChecks, ...ioboxFieldChecks],
    });
  } else {
    global.spiderman.systemlog.writeError('action_type error.');
    throw Error('action_type error.');
  }

  await global.domain.eventhandle.create(data);

  global.spiderman.systemlog.generateLog(4, `eventhandle create ${data.action_type} ${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
