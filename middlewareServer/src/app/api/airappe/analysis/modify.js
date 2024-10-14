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
    fieldName: 'zone_monitor',
    fieldType: 'array',
    required: true,
  },
];

const zoneFieldChecks = [
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

  if (data.algorithm.zone_monitor[0]) {
    data.algorithm.zone_monitor = global.spiderman.validate.data({
      data: data.algorithm.zone_monitor[0],
      fieldChecks: [...zoneFieldChecks],
    });
  }

  await global.domain.analysis.modify({ uuid, data });

  global.spiderman.systemlog.generateLog(4, `analysis modify uuid: ${data.uuid} name: ${data.name})}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
