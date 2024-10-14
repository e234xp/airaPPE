const fieldChecks = [
  {
    fieldName: 'uuid',
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
  global.spiderman.systemlog.generateLog(4, `visitor find ${JSON.stringify(data)}`);

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

  const { uuid } = data;

  const { totalLength, result } = global.domain.visitor
    .find({
      query: { ...(!uuid ? {} : { uuid }) },
      shift: data.slice_shift,
      sliceLength: data.slice_length,
      data,
    });

  const ret = {
    message: 'ok',
    total_length: totalLength,
    slice_shift: data.slice_shift,
    slice_length: data.slice_length,
    visitor_list: result,
  };

  global.spiderman.systemlog.generateLog(4, `visitor find ${JSON.stringify(ret)}`);

  return ret;
};
