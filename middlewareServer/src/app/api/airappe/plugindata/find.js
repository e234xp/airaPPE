const fieldChecks = [
  {
    fieldName: 'start_time',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'end_time',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'uuid_list',
    fieldType: 'array',
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
  global.spiderman.systemlog.generateLog(4, `plugindata find ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  if (!data.slice_shift) data.slice_shift = 0;
  if (!data.slice_length) data.slice_length = 100;

  const { uuid_list: uuidList } = data;

  const query = { ...(!uuidList ? {} : uuidList.length >= 1 ? { uuid: { $in: uuidList } } : {}) };

  const resultList = global.spiderman.db.personplugininfo.queryResults({
    startTime: data.start_time,
    endTime: data.end_time,
    query,
  });

  const ret = {
    message: 'ok',
    result: {
      total_length: resultList ? resultList.length : 0,
      slice_shift: data.slice_shift,
      slice_length: data.slice_length,
      data: resultList
        ? resultList.slice(data.slice_shift, data.slice_shift + data.slice_length)
        : [],
    },
  };

  global.spiderman.systemlog.generateLog(4, `plugindata find ${JSON.stringify(ret)}`);

  return ret;
};
