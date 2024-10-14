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
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `analysis find uuid=[${data.uuid}] keyword=[${data.keyword}]`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const sliceShift = data.slice_shift ? data.slice_shift : 0;
  const sliceLength = data.slice_length ? data.slice_length : 100;

  const { totalLength, result } = await global.domain.analysis.find({
    uuid: data.uuid, keyword: data.keyword, sliceShift, sliceLength,
  });

  const ret = {
    message: 'ok',
    total_length: totalLength,
    slice_shift: sliceShift,
    slice_length: sliceLength,
    list: result,
  };

  global.spiderman.systemlog.generateLog(4, `analysis find total_length=${totalLength}`);

  return ret;
};
