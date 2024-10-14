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

module.exports = async (rData) => {
  global.spiderman.systemlog.generateLog(4, `wiegandconverter modify ${rData}`);

  const { uuid } = global.spiderman.validate.data({
    data: rData,
    fieldChecks,
  });

  const data = global.spiderman.validate.data({
    data: rData.data,
    fieldChecks: fieldChecksData,
  });

  try {
    await global.domain.wiegandconverter.modify({ uuid, data });
  } catch (ex) {
    global.spiderman.systemlog.writeError(ex);
    throw Error(ex);
  }

  global.domain.workerWiegand.init();

  global.spiderman.systemlog.generateLog(4, `wiegandconverter modify ${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
