module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `attendancesettings set ${JSON.stringify(data)}`);

  const setting = global.spiderman.db.attendancesettings.findOne({});

  if (!setting) {
    global.spiderman.db.attendancesettings.insertOne(data);

    global.spiderman.systemlog.generateLog(4, `attendancesettings set ${JSON.stringify(data)}`);

    return {
      message: 'ok',
    };
  }

  data = { ...setting, ...data };

  global.spiderman.db.attendancesettings.updateOne({}, data);

  global.spiderman.systemlog.generateLog(4, `attendancesettings set ${JSON.stringify(data)}`);

  return {
    message: 'ok',
  };
};
