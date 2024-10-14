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
    fieldName: 'brand',
    fieldType: 'nonempty',
    required: false,
  },
  {
    fieldName: 'model',
    fieldType: 'nonempty',
    required: false,
  },
  {
    fieldName: 'divice_groups',
    fieldType: 'array',
    required: false,
  },
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
    fieldName: 'username',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'password',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'iopoint',
    fieldType: 'array',
    required: true,
  },
];

module.exports = async (rData) => {
  global.spiderman.systemlog.generateLog(4, `iobox modify ${rData}`);

  const { uuid } = global.spiderman.validate.data({
    data: rData,
    fieldChecks,
  });

  const data = global.spiderman.validate.data({
    data: rData.data,
    fieldChecks: fieldChecksData,
  });

  try {
    await global.domain.iobox.modify({ uuid, data });
  } catch (ex) {
    global.spiderman.systemlog.writeError(ex);
    throw Error(ex);
  }

  global.domain.workerIobox.init();

  global.spiderman.systemlog.generateLog(4, `iobox modify ${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
