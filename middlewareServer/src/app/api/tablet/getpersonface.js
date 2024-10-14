const fieldChecks = [
  {
    fieldName: 'person_id',
    fieldType: 'nonempty',
    required: true,
  },
];

module.exports = async (data) => {
  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const { person_id: uuid } = data;

  const photos = global.domain.person.fetchPhoto(uuid);

  const result = photos.register_image;

  return {
    message: 'ok',
    face_list: [{ image: result }],
  };
};
