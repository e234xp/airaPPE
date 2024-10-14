const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'f',
    fieldType: 'string',
    required: true,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `verifyresult fetchperson ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const faceImage = global.domain.verifyresult.fetchPhoto(data);

  return {
    face_image: faceImage,
  };
};
