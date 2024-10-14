const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'array',
    required: true,
  },
];

module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `group remove ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  global.domain.group.removeAndModifyPersonGroup(data);

  return {
    message: 'ok',
  };
};
