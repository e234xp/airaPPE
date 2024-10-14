module.exports = () => {
  global.spiderman.systemlog.generateLog(4, 'attendancesettings get');

  const settings = global.spiderman.db.attendancesettings.findOne({});

  global.spiderman.systemlog.generateLog(4, `attendancesettings get ${JSON.stringify(settings)}`);

  return {
    message: 'ok',
    settings,
  };
};
