const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'keyword',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'slice_shift',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'slice_length',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'download_register_image',
    fieldType: 'boolean',
    required: false,
  },
  {
    fieldName: 'download_display_image',
    fieldType: 'boolean',
    required: false,
  },
  {
    fieldName: 'download_face_feature',
    fieldType: 'boolean',
    required: false,
  },
];

module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `person find ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  data.slice_shift = data.slice_shift ? data.slice_shift : 0;
  data.slice_length = data.slice_length ? data.slice_length : 100;

  data.download_register_image = data.download_register_image
    ? data.download_register_image : false;
  data.download_display_image = data.download_display_image
    ? data.download_display_image : false;
  data.download_face_feature = data.download_face_feature
    ? data.download_face_feature : false;

  const { uuid, keyword } = data;

  let query = { ...(!uuid ? {} : { uuid }) };
  if (keyword) {
    query = { ...query, ...{ $or: [{ id: { $regex: keyword } }, { name: { $regex: keyword } }] } };
  }

  const { totalLength, result } = global.domain.person
    .find({
      // query: { ...(!uuid ? {} : { uuid }) },
      query,
      shift: data.slice_shift,
      sliceLength: data.slice_length,
      data,
    });

  const ret = {
    message: 'ok',
    total_length: totalLength,
    slice_shift: data.slice_shift,
    slice_length: data.slice_length,
    person_list: result,
  };

  global.spiderman.systemlog.generateLog(4, `outputdevicegroup find ${JSON.stringify(ret)}`);

  return ret;
};
