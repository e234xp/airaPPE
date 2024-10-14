// 指定要列出檔案的資料夾路徑
module.exports = () => {
  const items = [
    'account.js',
    'analysis.js',
    'attendancesettings.js',
    'cameras.js',
    'dashboardsettings.js',
    'eventhandle.js',
    'groups.js',
    'ioboxes.js',
    'managersettings.js',
    'outputdevicegroups.js',
    'person.js',
    'system_settings.js',
    'systemlog.js',
    'tablets.js',
    'videodevicegroups.js',
    'visitor.js',
    'wiegandconverters.js',
  ];

  const defaultData = (() => {
    const tmp = {};

    items.forEach((item) => {
      const name = item.split('.')[0];
      tmp[name] = require(`./${item}`);
    });

    return tmp;
  })();

  return defaultData;
};
