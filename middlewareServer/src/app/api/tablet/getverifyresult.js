const fieldChecks = [
  {
    fieldName: 'verify_face_id',
    fieldType: 'nonempty',
    required: true,
  },
];

module.exports = async (data) => {
  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const result = global.domain.tabletverify.getResult(data.verify_face_id);

  return {
    message: 'ok',
    result,
  };
};
