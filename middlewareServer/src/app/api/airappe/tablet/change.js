const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'ip_address',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'code',
    fieldType: 'string',
    required: false,
  },
];

module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `tablet change ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  global.domain.tablet.change(data);

  global.spiderman.systemlog.generateLog(4, `tablet change ${data.uuid} ${data.ip_address}`);

  return {
    message: 'ok',
  };
};
