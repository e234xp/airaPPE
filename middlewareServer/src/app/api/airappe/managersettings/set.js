module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `managersettings set ${JSON.stringify(data)}`);

  global.spiderman.db.managersettings.updateOne({}, data);

  return {
    message: 'ok',
  };
};
