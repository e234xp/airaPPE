const { uuid } = require('uuidv4');

const fieldChecks = [
  {
    fieldName: 'name',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'show_video',
    fieldType: 'object',
    required: true,
  },
  {
    fieldName: 'use_gpu',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'video_source',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'object_min_length',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'capture_interval',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'report_data_server_ip',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'report_data_server_port',
    fieldType: 'port',
    required: false,
  },
  {
    fieldName: 'report_alive_server_ip',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'report_alive_server_port',
    fieldType: 'port',
    required: false,
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
    required: true,
  },
  {
    fieldName: 'zone_monitor',
    fieldType: 'array',
    required: true,
  },
  {
    fieldName: 'cross_line',
    fieldType: 'array',
    required: true,
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

  if (data.algorithm.zone_detect[0]) {
    data.algorithm.zone_detect = global.spiderman.validate.data({
      data: data.algorithm.zone_detect[0],
      fieldChecks: [...zoneDetectFieldChecks],
    });
  }

  if (data.algorithm.zone_monitor[0]) {
    data.algorithm.zone_monitor = global.spiderman.validate.data({
      data: data.algorithm.zone_monitor[0],
      fieldChecks: [...zoneMonitorFieldChecks],
    });
  }

  if (data.algorithm.cross_line[0]) {
    data.algorithm.cross_line = global.spiderman.validate.data({
      data: data.algorithm.cross_line[0],
      fieldChecks: [...crossLineFieldChecks],
    });
  }

  data.uuid = uuid();

  data.algorithm.zone_detect.forEach((element) => {
    element.uuid = uuid();
  });

  data.algorithm.zone_monitor.forEach((element) => {
    element.uuid = uuid();
  });

  data.algorithm.cross_line.forEach((element) => {
    element.uuid = uuid();
  });

  await global.domain.analysis.create(data);
  global.spiderman.systemlog.generateLog(2, `analysis create uuid=${data.uuid} name=${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
