const fieldChecks = [
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
  global.spiderman.systemlog.generateLog(4, `camera create name=[${data.name}]`);

  const { source_type: sourceType } = data;

  if (sourceType.toLowerCase() === 'file') {
    data = global.spiderman.validate.data({
      data,
      fieldChecks: [...fieldChecks],
    });
  } else {
    data = global.spiderman.validate.data({
      data,
      fieldChecks: [...fieldChecks, ...rtspfieldChecksData],
    });
  }

  await global.domain.camera.create(data);
  global.spiderman.systemlog.generateLog(2, `camera create uuid=${data.uuid} name=${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
