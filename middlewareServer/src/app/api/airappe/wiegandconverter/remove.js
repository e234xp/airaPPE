const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'array',
    required: true,
  },
];

module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `wiegandconverter remove ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  global.domain.wiegandconverter.remove(data);
  global.domain.workerWiegand.init();

  return {
    message: 'ok',
  };
};
