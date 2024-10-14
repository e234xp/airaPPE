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
    fieldName: 'source_type',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'source_info',
    fieldType: 'string',
    required: false,
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
];

const rtspfieldChecksData = [
  {
    fieldName: 'ip',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'port',
    fieldType: 'port',
    required: true,
  },
  {
    fieldName: 'account',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'password',
    fieldType: 'string',
    required: false,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `camera modify uuid=[${data.uuid}] name=[${data.data.name}]`);

  const { uuid } = global.spiderman.validate.data({
    data,
    fieldChecks: [...fieldChecks],
  });

  const { source_type: sourceType } = data.data;

  if (sourceType.toLowerCase() === 'file') {
    data = global.spiderman.validate.data({
      data: data.data,
      fieldChecks: [...fieldChecksData],
    });
  } else {
    data = global.spiderman.validate.data({
      data: data.data,
      fieldChecks: [...fieldChecksData, ...rtspfieldChecksData],
    });
  }

  await global.domain.camera.modify({ uuid, data });

  global.spiderman.systemlog.generateLog(4, `camera modify uuid: ${data.uuid} name: ${data.name})}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
