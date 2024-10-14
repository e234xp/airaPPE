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
  // person, visitor group is assigned by group name, so can't modify
  // {
  //   fieldName: 'name',
  //   fieldType: 'string',
  //   required: false,
  // },
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

module.exports = async (rData) => {
  global.spiderman.systemlog.generateLog(4, `group modify ${rData}`);

  const { uuid } = global.spiderman.validate.data({
    data: rData,
    fieldChecks,
  });

  const data = global.spiderman.validate.data({
    data: rData.data,
    fieldChecks: fieldChecksData,
  });

  if (!data.person_uuid_list) data.person_uuid_list = [];
  if (!data.visitor_uuid_list) data.visitor_uuid_list = [];

  await global.domain.group.modifyAndModifyPersonGroup({ uuid, ...data });

  global.spiderman.systemlog.generateLog(4, `group modify ${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
