const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'array',
    required: true,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `analysis remove ${data.uuid}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  await global.domain.analysis.remove(data);

  global.spiderman.systemlog.generateLog(4, `analysis removed ${data.uuid} ok.`);

  return {
    message: 'ok',
  };
};
