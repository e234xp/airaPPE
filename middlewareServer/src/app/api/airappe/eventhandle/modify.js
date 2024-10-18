const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'data',
    fieldType: 'object',
    required: true,
  },
];

const fieldChecksData = [
  {
    fieldName: 'name',
    fieldType: 'nonempty',
    required: true,
  },

  {
    fieldName: 'enable',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'duration',
    fieldType: 'number',
    required: true,
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
  {
    fieldName: 'action_type',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'algorithm_uuid',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'algorithm',
    fieldType: 'object',
    required: true,
  },
  {
    fieldName: 'notification',
    fieldType: 'object',
    required: true,
  },
];

const zoneMonitorChecks = [
  {
    fieldName: 'dwell_enable',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'dwell_time',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'depart_enable',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'depart_time',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'change_enable',
    fieldType: 'boolean',
    required: true,
  },
];
const zoneDetectChecks = [
  {
    fieldName: 'zone_uuid',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'count',
    fieldType: 'number',
    required: true,
  },
];

const crossLineChecks = [
  {
    fieldName: 'line_uuid',
    fieldType: 'string',
    required: true,
  },
];

const zoneDetectPpeChecks = [
  {
    fieldName: 'helmet',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'vest',
    fieldType: 'number',
    required: true,
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

module.exports = async (mData) => {
  global.spiderman.systemlog.generateLog(4, `eventhandle monfi ${mData}`);

  mData = global.spiderman.validate.data({
    data: mData,
    fieldChecks,
  });

  const { uuid } = mData;
  let { data } = mData;

  data = global.spiderman.validate.data({
    data,
    fieldChecks: [...fieldChecksData],
  });

  const { action_type: actionType, algorithm } = data;

  if (algorithm.zone_detect === undefined
    && algorithm.zone_monitor === undefined
    && algorithm.cross_line === undefined
    && algorithm.zone_detect_ppe === undefined
  ) {
    throw Error('Invalid parameter: algorithm (nonempty)');
  }

  if (data.algorithm.zone_detect) {
    data.algorithm.zone_detect = global.spiderman.validate.data({
      data: data.algorithm.zone_detect,
      fieldChecks: [...zoneDetectChecks],
    });
  } else if (data.algorithm.zone_monitor) {
    data.algorithm.zone_monitor = global.spiderman.validate.data({
      data: data.algorithm.zone_monitor,
      fieldChecks: [...zoneMonitorChecks],
    });
  } else if (data.algorithm.cross_line) {
    data.algorithm.cross_line = global.spiderman.validate.data({
      data: data.algorithm.cross_line,
      fieldChecks: [...crossLineChecks],
    });
  } else if (data.algorithm.zone_detect_ppe) {
    data.algorithm.zone_detect_ppe = global.spiderman.validate.data({
      data: data.algorithm.zone_detect_ppe,
      fieldChecks: [...zoneDetectPpeChecks],
    });
  }

  if (actionType === 'line') {
    data.notification = global.spiderman.validate.data({
      data: data.notification,
      fieldChecks: [...lineFieldChecks],
    });
  } else if (actionType === 'http') {
    data.notification = global.spiderman.validate.data({
      data: data.notification,
      fieldChecks: [...httpFieldChecks],
    });
  } else if (actionType === 'mail') {
    data.notification = global.spiderman.validate.data({
      data: data.notification,
      fieldChecks: [...mailFieldChecks],
    });
  } else if (actionType === 'wiegand') {
    data.notification = global.spiderman.validate.data({
      data: data.notification,
      fieldChecks: [...wiegandFieldChecks],
    });
  } else if (actionType === 'iobox') {
    data.notification = global.spiderman.validate.data({
      data: data.notification,
      fieldChecks: [...ioboxFieldChecks],
    });
  } else {
    global.spiderman.systemlog.writeError('action_type error.');
    throw Error('action_type error.');
  }

  await global.domain.eventhandle.modify({ uuid, data });

  global.spiderman.systemlog.generateLog(4, `eventhandle modify ${data.action_type} ${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
