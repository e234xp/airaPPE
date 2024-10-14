module.exports = () => {
  global.spiderman.systemlog.generateLog(4, 'managersettings get');

  const settings = global.spiderman.db.managersettings.findOne({});
  const { manager_token_key: _, ...others } = settings;

  const ret = {
    message: 'ok',
    settings: others,
  };

  global.spiderman.systemlog.generateLog(4, `license find ${JSON.stringify(ret)}`);

  return ret;
};
