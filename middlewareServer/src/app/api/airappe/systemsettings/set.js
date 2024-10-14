module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `systemsettings set ${JSON.stringify(data)}`);

  const settings = global.spiderman.db.system_settings.find();

  data = { ...settings, ...data };

  global.spiderman.db.system_settings.updateOne({}, data);

  return {
    message: 'ok',
  };
};
