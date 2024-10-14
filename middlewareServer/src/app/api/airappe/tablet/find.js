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
  global.spiderman.systemlog.generateLog(4, `tablet find ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const sliceShift = data.slice_shift ? data.slice_shift : 0;
  const sliceLength = data.slice_length ? data.slice_length : 100;
  const { uuid, keyword } = data;

  let query = { ...(!uuid ? {} : { uuid }) };
  if (keyword) {
    query = { ...query, ...{ $or: [{ name: { $regex: keyword } }] } };
  }

  const { totalLength, result } = global.domain.crud
    .find({
      collection: 'tablets',
      query,
      sliceShift,
      sliceLength,
    });

  const status = await global.domain.tablet.status();
  result.forEach((e) => {
    const r = status.filter((s) => (s.uuid === e.uuid));
    if (r.length > 0) {
      e.alive = r[0].alive;
    } else e.alive = false;
  });

  const ret = {
    message: 'ok',
    total_length: totalLength,
    slice_shift: sliceShift,
    slice_length: sliceLength,
    list: result,
  };

  global.spiderman.systemlog.generateLog(4, `tablet find ${JSON.stringify(ret)}`);

  return ret;
};
