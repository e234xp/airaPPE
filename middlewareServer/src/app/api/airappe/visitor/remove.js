const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'array',
    required: true,
  },
];

module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `visitor remove ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  global.domain.visitor.remove(data);

  return {
    message: 'ok',
    uuid: data.uuid,
    id: data.id,
    name: data.name,
  };
};
