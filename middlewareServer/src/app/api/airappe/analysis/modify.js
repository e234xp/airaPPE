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
    fieldName: 'video_source',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'algorithm',
    fieldType: 'object',
    required: true,
  },
];

const algorithmFieldChecks = [
  {
    fieldName: 'object_detect_threshold',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'object_color',
    fieldType: 'object',
    required: false,
  },
  {
    fieldName: 'zone_detect',
    fieldType: 'array',
    required: false,
  },
  {
    fieldName: 'zone_monitor',
    fieldType: 'array',
    required: false,
  },
  {
    fieldName: 'cross_line',
    fieldType: 'array',
    required: false,
  },
];

const zoneDetectFieldChecks = [
  {
    fieldName: 'show_zone',
    fieldType: 'boolean',
    required: false,
  },
  {
    fieldName: 'normal_color',
    fieldType: 'object',
    required: false,
  },
  {
    fieldName: 'normal_bold',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'polygon',
    fieldType: 'array',
    required: false,
  },
  {
    fieldName: 'snapshot',
    fieldType: 'string',
    required: false,
  },
];

const zoneMonitorFieldChecks = [
  {
    fieldName: 'show_zone',
    fieldType: 'boolean',
    required: false,
  },
  {
    fieldName: 'normal_color',
    fieldType: 'object',
    required: false,
  },
  {
    fieldName: 'normal_bold',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'enable_dwell',
    fieldType: 'boolean',
    required: false,
  },
  {
    fieldName: 'dwell_over_time',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'dwell_color',
    fieldType: 'object',
    required: false,
  },
  {
    fieldName: 'dwell_bold',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'enable_depart',
    fieldType: 'boolean',
    required: false,
  },
  {
    fieldName: 'depart_over_time',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'depart_color',
    fieldType: 'object',
    required: false,
  },
  {
    fieldName: 'depart_bold',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'polygon',
    fieldType: 'array',
    required: false,
  },
  {
    fieldName: 'snapshot',
    fieldType: 'string',
    required: false,
  },
];

const crossLineFieldChecks = [
  {
    fieldName: 'line_caption',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'line_start',
    fieldType: 'object',
    required: true,
  },
  {
    fieldName: 'line_end',
    fieldType: 'object',
    required: true,
  },
  {
    fieldName: 'cross_direction',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'line_color',
    fieldType: 'object',
    required: false,
  },
  {
    fieldName: 'show_line',
    fieldType: 'boolean',
    required: false,
  },
  {
    fieldName: 'snapshot',
    fieldType: 'string',
    required: false,
  },
];

module.exports = async (mData) => {
  global.spiderman.systemlog.generateLog(4, `analysis modify uuid=[${mData.uuid}] name=[${mData.data.name}]`);

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

  data.algorithm = global.spiderman.validate.data({
    data: data.algorithm,
    fieldChecks: [...algorithmFieldChecks],
  });

  if (data.algorithm.zone_detect === undefined
    && data.algorithm.zone_monitor === undefined
    && data.algorithm.cross_line === undefined
  ) {
    throw Error('Invalid parameter: algorithm (array)');
  } else {

    if (data.algorithm.zone_detect) {
      data.algorithm.zone_detect.forEach((item) => {
        item = global.spiderman.validate.data({
          data: item,
          fieldChecks: [...zoneDetectFieldChecks],
        });
      });
    }

    if (data.algorithm.zone_monitor) {
      data.algorithm.zone_monitor.forEach((item) => {
        item = global.spiderman.validate.data({
          data: item,
          fieldChecks: [...zoneMonitorFieldChecks],
        });
      });
    }

    if (data.algorithm.cross_line) {
      data.algorithm.cross_line.forEach((item) => {
        item = global.spiderman.validate.data({
          data: item,
          fieldChecks: [...crossLineFieldChecks],
        });
      });
    }
  }

  await global.domain.analysis.modify({ uuid, data });
  global.spiderman.systemlog.generateLog(4, `analysis modify uuid: ${data.uuid} name: ${data.name})}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
