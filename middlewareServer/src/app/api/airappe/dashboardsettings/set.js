module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `dashboardsettings set ${JSON.stringify(data)}`);

  const settings = global.spiderman.db.dashboardsettings.findOne({});

  data = { ...settings, ...data };

  global.spiderman.db.dashboardsettings.updateOne({}, data);

  return {
    message: 'ok',
  };
};
