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
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'wiegand_converter_uuid_list',
    fieldType: 'array',
    required: false,
  },
  {
    fieldName: 'iobox_uuid_list',
    fieldType: 'array',
    required: false,
  },
];

module.exports = async (rData) => {
  global.spiderman.systemlog.generateLog(4, `outputdevicegroup modify ${rData}`);

  const { uuid } = global.spiderman.validate.data({
    data: rData,
    fieldChecks,
  });

  const data = global.spiderman.validate.data({
    data: rData.data,
    fieldChecks: fieldChecksData,
  });

  if (!data.wiegand_converter_uuid_list) data.wiegand_converter_uuid_list = [];
  if (!data.iobox_uuid_list) data.iobox_uuid_list = [];

  await global.domain.outputdevicegroup.modify({ uuid, ...data });

  global.spiderman.systemlog.generateLog(4, `outputdevicegroup modify ${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
