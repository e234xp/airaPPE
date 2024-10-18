const fieldChecks = [
  {
    fieldName: 'name',
    fieldType: 'nonempty',
    required: true,
  },
  // {
  //   fieldName: 'divice_groups',
  //   fieldType: 'array',
  //   required: false,
  // },
  // {
  //   fieldName: 'show_video',
  //   fieldType: 'object',
  //   required: false,
  // },
  // {
  //   fieldName: 'use_gpu',
  //   fieldType: 'boolean',
  //   required: false,
  // },
  {
    fieldName: 'video_source',
    fieldType: 'object',
    required: true,
  },
];

const sourcefieldChecksData = [
  {
    fieldName: 'enable_gpu',
    fieldType: 'boolean',
    required: false,
  },
  {
    fieldName: 'source_type',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'fps',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'roi',
    fieldType: 'array',
    required: true,
  },
  {
    fieldName: 'object_min_length',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'capture_interval',
    fieldType: 'number',
    required: false,
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
    fieldName: 'snapshot',
    fieldType: 'string',
    required: false,
  },
];

const filefieldChecksData = [
  {
    fieldName: 'source_info',
    fieldType: 'nonempty',
    required: true,
  },
];

const rtspfieldChecksData = [
  {
    fieldName: 'ip_address',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'port',
    fieldType: 'port',
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
    fieldName: 'source_info',
    fieldType: 'string',
    required: false,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `camera create name=[${data.name}]`);

  data.divice_groups = [];
  data.use_gpu = data.use_gpu || false;
  data.show_video = {
    show: false,
    ratio: 1.0,
  };

  data = global.spiderman.validate.data({
    data,
    fieldChecks: [...fieldChecks],
  });

  const { video_source: videoSource } = data;
  const { source_type: sourceType } = videoSource;

  data.video_source = {
    ...{
      enable_gpu: false,
      object_min_length: 0,
      capture_interval: 200,
      report_data_server_ip: '127.0.0.1',
      report_data_server_port: 5552,
      report_alive_server_ip: '127.0.0.1',
      report_alive_server_port: 5551,
    },
    ...data.video_source,
  };

  if (sourceType !== undefined) {
    if (sourceType.toLowerCase() === 'rtsp') {
      data.video_source = global.spiderman.validate.data({
        data: data.video_source,
        fieldChecks: [...sourcefieldChecksData, ...rtspfieldChecksData],
      });
    } else {
      data.video_source = global.spiderman.validate.data({
        data: data.video_source,
        fieldChecks: [...sourcefieldChecksData, ...filefieldChecksData],
      });
    }
  } else {
    throw Error('Invalid parameter: source_type (nonempty)');
  }

  await global.domain.camera.create(data);

  global.spiderman.systemlog.generateLog(4, `camera create uuid=${data.uuid} name=${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
