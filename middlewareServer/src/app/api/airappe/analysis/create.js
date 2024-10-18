const { uuid } = require('uuidv4');

const fieldChecks = [
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
  {
    fieldName: 'zone_detect_ppe',
    fieldType: 'array',
    required: false,
  },
];

const zoneDetectFieldChecks = [
  {
    fieldName: 'report_image',
    fieldType: 'boolean',
    required: false,
  },
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
    fieldName: 'report_image',
    fieldType: 'boolean',
    required: false,
  },
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
    fieldName: 'report_image',
    fieldType: 'boolean',
    required: false,
  },
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

const zoneDetectPPEFieldChecks = [
  {
    fieldName: 'report_image',
    fieldType: 'boolean',
    required: false,
  },
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
    fieldName: 'alert_color',
    fieldType: 'object',
    required: false,
  },
  {
    fieldName: 'detect_helmet',
    fieldType: 'boolean',
    required: false,
  },
  {
    fieldName: 'detect_no_helmet',
    fieldType: 'boolean',
    required: false,
  },
  {
    fieldName: 'detect_vest',
    fieldType: 'boolean',
    required: false,
  },
  {
    fieldName: 'detect_no_vest',
    fieldType: 'boolean',
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

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `analysis create name=[${data.name}]`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  data.algorithm = global.spiderman.validate.data({
    data: data.algorithm,
    fieldChecks: [...algorithmFieldChecks],
  });

  if (data.algorithm.zone_detect === undefined
    && data.algorithm.zone_detect_ppe === undefined
    && data.algorithm.zone_monitor === undefined
    && data.algorithm.cross_line === undefined
  ) {
    throw Error('Invalid parameter: algorithm (array)');
  } else {
    data.uuid = uuid();

    if (data.algorithm.zone_detect) {
      for (let i = 0; i < data.algorithm.zone_detect.length; i += 1) {
        data.algorithm.zone_detect[i] = global.spiderman.validate.data({
          data: data.algorithm.zone_detect[i],
          fieldChecks: [...zoneDetectFieldChecks],
        });

        data.algorithm.zone_detect[i].uuid = `${data.uuid}_${uuid()}`;
      }
    }

    if (data.algorithm.zone_detect_ppe) {
      for (let i = 0; i < data.algorithm.zone_detect_ppe.length; i += 1) {
        data.algorithm.zone_detect_ppe[i] = global.spiderman.validate.data({
          data: data.algorithm.zone_detect_ppe[i],
          fieldChecks: [...zoneDetectPPEFieldChecks],
        });

        data.algorithm.zone_detect_ppe[i].uuid = `${data.uuid}_${uuid()}`;
      }
    }

    if (data.algorithm.zone_monitor) {
      for (let i = 0; i < data.algorithm.zone_monitor.length; i += 1) {
        data.algorithm.zone_monitor[i] = global.spiderman.validate.data({
          data: data.algorithm.zone_monitor[i],
          fieldChecks: [...zoneMonitorFieldChecks],
        });

        data.algorithm.zone_monitor[i].uuid = `${data.uuid}_${uuid()}`;
      }
    }

    if (data.algorithm.cross_line) {
      for (let i = 0; i < data.algorithm.cross_line.length; i += 1) {
        data.algorithm.cross_line[i] = global.spiderman.validate.data({
          data: data.algorithm.cross_line[i],
          fieldChecks: [...crossLineFieldChecks],
        });

        data.algorithm.cross_line[i].uuid = `${data.uuid}_${uuid()}`;
      }
    }
  }

  await global.domain.analysis.create(data);
  global.spiderman.systemlog.generateLog(2, `analysis create uuid=${data.uuid} name=${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
