const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'keyword',
    fieldType: 'string',
    required: false,
  },
];

module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `group find ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const { uuid, keyword } = data;

  let query = { ...(!uuid ? {} : { uuid }) };
  if (keyword) {
    query = { ...query, ...{ $or: [{ name: { $regex: keyword } }] } };
  }

  const groupList = global.domain.group.findWithPerson(query);

  const ret = {
    message: 'ok',
    group_list: groupList,
  };

  // global.spiderman.systemlog.generateLog(4, `group find ${JSON.stringify(ret)}`);

  return ret;
};
