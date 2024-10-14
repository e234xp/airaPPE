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
  global.spiderman.systemlog.generateLog(4, `videodevicegroup find uuid=[${data.uuid}] keyword=[${data.keyword}]`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  if (!data.slice_shift) data.slice_shift = 0;
  if (!data.slice_length) data.slice_length = 100;

  const { uuid, keyword } = data;

  data.query = { ...(!uuid ? {} : { uuid }) };
  if (keyword) {
    data.query = { ...data.query, ...{ $or: [{ name: { $regex: keyword } }] } };
  }

  const { totalLength, result } = await global.domain.videodevicegroup.find(data);

  const ret = {
    message: 'ok',
    total_length: totalLength,
    slice_shift: data.slice_shift,
    slice_length: data.slice_length,
    result,
  };

  global.spiderman.systemlog.generateLog(4, `videodevicegroup find total_length=${totalLength}`);

  return ret;
};
