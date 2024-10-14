const fieldChecks = [
  {
    fieldName: 'mode', // SELFCHECKIN, WELCOME, OCCUPANCY, CAPACITY
    fieldType: 'string',
    required: false,
  },
];

module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `dashboardsettings get ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const { mode } = data;

  let settings = global.spiderman.db.dashboardsettings.findOne({});

  if (mode) {
    const modeNode = {};
    modeNode[mode] = settings[mode];
    settings = modeNode;
  }

  const ret = {
    message: 'ok',
    settings,
  };

  global.spiderman.systemlog.generateLog(4, `dashboardsettings get ${JSON.stringify(ret)}`);

  return ret;
};
