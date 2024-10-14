// const fieldChecks = [];

module.exports = () => {
  // data = global.spiderman.validate.data({
  //   data,
  //   fieldChecks,
  // });

  // const { mode } = data;
  global.spiderman.systemlog.generateLog(4, 'systemsettings get');

  let settings = global.spiderman.db.system_settings.find();

  const modeNode = {
    db: {
      verified_maintain_duration: 5184000000, // 86400000 * 30 day
      non_verified_maintain_duration: 604800000, // 86400000 * 7 day
      maintain_disk_space_in_gb: 50, // 50GB
    },
    smtp: {
      secure: true,
      from: '',
      user: '',
      pass: '',
      host: 'smtp.gmail.com',
      port: 587,
    },
  };

  modeNode.db.verified_maintain_duration = settings.db
    ? settings.db.verified_maintain_duration
    : 5184000000;

  modeNode.db.non_verified_maintain_duration = settings.db
    ? settings.db.non_verified_maintain_duration
    : 604800000;

  modeNode.db.maintain_disk_space_in_gb = settings.db
    ? settings.db.maintain_disk_space_in_gb
    : 50;

  modeNode.smtp.secure = settings.smtp
    ? settings.smtp.secure
    : true;

  modeNode.smtp.from = settings.smtp
    ? settings.smtp.from
    : '';

  modeNode.smtp.user = settings.smtp
    ? settings.smtp.user
    : '';

  modeNode.smtp.pass = settings.smtp
    ? settings.smtp.pass
    : '';

  modeNode.smtp.host = settings.smtp
    ? settings.smtp.host
    : 'smtp.gmail.com';

  modeNode.smtp.port = settings.smtp
    ? settings.smtp.port
    : 587;

  settings = modeNode;

  const ret = {
    message: 'ok',
    settings,
  };

  global.spiderman.systemlog.generateLog(4, `systemsettings find ${JSON.stringify(ret)}`);

  return ret;
};
