const { uuid } = require('uuidv4');

const fieldChecks = [
  {
    fieldName: 'name',
    fieldType: 'nonempty',
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

module.exports = async (data) => {
  const { db } = global.spiderman;

  global.spiderman.systemlog.generateLog(4, `videodevicegroup create name=[${data.name}]`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const doesExist = !!db.videodevicegroups.findOne({ name: data.name });

  if (doesExist) {
    global.spiderman.systemlog.generateLog(4, `videodevicegroup create The item name=[${data.name}] has already existed.`);
    throw Error('The item has already existed.');
  }

  if (!data.camera_uuid_list) data.camera_uuid_list = [];
  if (!data.tablet_uuid_list) data.tablet_uuid_list = [];

  await global.domain.videodevicegroup.create(data);

  const ret = {
    uuid: uuid(),
    name: data.name,
  };

  global.spiderman.systemlog.generateLog(4, `videodevicegroup create ${JSON.stringify(ret)}`);

  ret.message = 'ok';
  return ret;
};
