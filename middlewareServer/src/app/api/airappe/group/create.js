const fieldChecks = [
  {
    fieldName: 'name',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'remarks',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'person_uuid_list',
    fieldType: 'array',
    required: false,
  },
  {
    fieldName: 'visitor_uuid_list',
    fieldType: 'array',
    required: false,
  },
];

module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `group create ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  // optional paramters set default value
  if (!data.remarks) data.remarks = '';
  if (!data.person_uuid_list) data.person_uuid_list = [];
  if (!data.visitor_uuid_list) data.visitor_uuid_list = [];

  if (data.name.length === 0) {
    global.spiderman.systemlog.writeError('Name cannot be empty.');
    throw Error('Name cannot be empty.');
  }

  global.domain.group.createAndModifyPersonGroup(data);

  global.spiderman.systemlog.generateLog(4, `group create ${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
