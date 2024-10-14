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
    fieldName: 'camera_uuid_list',
    fieldType: 'array',
    required: false,
  },
  {
    fieldName: 'tablet_uuid_list',
    fieldType: 'array',
    required: false,
  },
];

module.exports = async (rData) => {
  const { db } = global.spiderman;
  global.spiderman.systemlog.generateLog(4, `videodevicegroup modify uuid=[${rData.uuid}] name=[${rData.data.name}]`);

  const { uuid } = global.spiderman.validate.data({
    data: rData,
    fieldChecks,
  });

  const data = global.spiderman.validate.data({
    data: rData.data,
    fieldChecks: fieldChecksData,
  });

  const fixedUuids = ['0', '1'];
  if (fixedUuids.includes(uuid)) {
    global.spiderman.systemlog.generateLog(4, `domain videodevicegroup create The item uuid=[${uuid}] name=[${data.name}] can not be change.`);
    throw Error('The item can not be change.');
  }

  const doesExist = !!db.videodevicegroups.findOne({ name: data.name, uuid: { $ne: uuid } });
  if (doesExist) {
    global.spiderman.systemlog.generateLog(4, `domain videodevicegroup create The item uuid=[${uuid}] name=[${data.name}] has already existed.`);
    throw Error('The name has already existed.');
  }

  if (!data.camera_uuid_list) data.camera_uuid_list = [];
  if (!data.tablet_uuid_list) data.tablet_uuid_list = [];

  await global.domain.videodevicegroup.modify({ uuid, ...data });

  global.spiderman.systemlog.generateLog(4, `videodevicegroup modify ${JSON.stringify({ uuid: data.uuid, name: data.name })}`);
  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
