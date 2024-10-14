const fieldChecks = [
  {
    fieldName: 'records',
    fieldType: 'array',
    required: true,
  },
  {
    fieldName: 'commands',
    fieldType: 'string',
    required: true,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `verifyresult addcommands ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  global.domain.verifyresult.addcommands(data);

  global.spiderman.systemlog.generateLog(4, `verifyresult addcommands ${data.commands}`);

  return {
    message: 'ok',
  };
};
