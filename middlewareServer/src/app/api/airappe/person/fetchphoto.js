const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'string',
    required: true,
  },
];

module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `person fetchphoto ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const photos = global.domain.person.fetchPhoto(data.uuid);

  return photos;
};
