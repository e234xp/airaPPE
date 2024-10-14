const fieldChecks = [
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

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `wiegandconverter create ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  try {
    await global.domain.wiegandconverter.create(data);
  } catch (ex) {
    global.spiderman.systemlog.writeError(ex);
    throw Error(ex);
  }

  global.domain.workerWiegand.init();

  global.spiderman.systemlog.generateLog(4, `wiegandconverter create ${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
