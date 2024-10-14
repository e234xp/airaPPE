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
    fieldName: 'action_type',
    fieldType: 'array',
    required: false,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `eventhandle find ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const sliceShift = data.slice_shift ? data.slice_shift : 0;
  const sliceLength = data.slice_length ? data.slice_length : 10000;
  const { uuid, keyword, action_type: actionType } = data;

  const { totalLength, result } = await global.domain.eventhandle.find({
    uuid, keyword, actionType, sliceShift, sliceLength,
  });

  const ret = {
    message: 'ok',
    total_length: totalLength,
    slice_shift: sliceShift,
    slice_length: sliceLength,
    list: result,
  };

  global.spiderman.systemlog.generateLog(4, `dashboardsettings get ${JSON.stringify(ret)}`);

  return ret;
};
