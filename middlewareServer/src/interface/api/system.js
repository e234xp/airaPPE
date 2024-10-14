module.exports = () => {
  const publicCgi = ['initdb', 'systeminfo', 'downloadsyslog'];
  const router = {
    test: require('../../app/api/system/test'),
    initdb: require('../../app/api/system/initdb'),

    systeminfo: require('../../app/api/system/systeminfo'),
    factorydefault: require('../../app/api/system/factorydefault'),
    synctime: require('../../app/api/system/synctime'),
    enablentp: require('../../app/api/system/enablentp'),
    timeinfo: require('../../app/api/system/timeinfo'),
    supportedlanguagelist: require('../../app/api/system/supportedlanguagelist'),
    supportedtimezonelist: require('../../app/api/system/supportedtimezonelist'),
    changewifi: require('../../app/api/system/changewifi'),
    enableethernetdhcp: require('../../app/api/system/enableethernetdhcp'),
    enableethernetstatic: require('../../app/api/system/enableethernetstatic'),
    currentethernetinfo: require('../../app/api/system/currentethernetinfo'),
    currentwifiinfo: require('../../app/api/system/currentwifiinfo'),
    fetchwifilist: require('../../app/api/system/fetchwifilist'),
    restart: require('../../app/api/system/restart'),
    changelanguage: require('../../app/api/system/changelanguage'),
    triggerrelay1: require('../../app/api/system/triggerrelay1'),
    triggerrelay2: require('../../app/api/system/triggerrelay2'),
    checkdbbackupfile: require('../../app/api/system/checkdbbackupfile'),
    generatedbbackup: require('../../app/api/system/generatedbbackup'),
    downloadsyslog: require('../../app/api/system/downloadsyslog'),
    downloadcrashlog: require('../../app/api/system/downloadcrashlog'),
    downloaddb: require('../../app/api/system/downloaddb'),
    uploaddb: require('../../app/api/system/uploaddb'),
    upgradefw: require('../../app/api/system/upgradefw'),
  };

  return {
    publicCgi,
    router,
  };
};
