const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'array',
    required: true,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `videodevicegroup remove ${data.uuid}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  await global.domain.videodevicegroup.remove(data);

  global.spiderman.systemlog.generateLog(4, `videodevicegroup removed ${data.uuid} ok.`);

  return {
    message: 'ok',
  };
};
