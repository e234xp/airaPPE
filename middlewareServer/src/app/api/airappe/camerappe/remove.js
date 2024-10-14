const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'array',
    required: true,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `camera remove ${data.uuid}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  await global.domain.crud.remove({ collection: 'cameras', uuid: data.uuid });

  global.spiderman.systemlog.generateLog(4, `camera removed ${data.uuid} ok.`);

  return {
    message: 'ok',
  };
};
