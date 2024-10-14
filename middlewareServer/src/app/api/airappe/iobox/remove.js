const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'array',
    required: true,
  },
];

module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `iobox remove ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  global.domain.iobox.remove(data);
  global.domain.workerIobox.init();

  return {
    message: 'ok',
  };
};
