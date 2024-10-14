module.exports = () => {
  async function init() {
    const { db, defaultdata } = global.spiderman;

    let test = null;

    test = db.account.find();
    if (test == null || test.length === 0) {
      db.account.set(defaultdata.account);
    }

    test = db.analysis.find();
    if (test == null || test.length === 0) {
      db.analysis.set(defaultdata.analysis);
    }

    test = db.attendancesettings.find();
    if (test == null || test.length === 0) {
      db.attendancesettings.set(defaultdata.attendancesettings);
    }

    test = db.cameras.find();
    if (test == null || test.length === 0) {
      db.cameras.set([]);
    }

    test = db.dashboardsettings.find();
    if (test == null || test.length === 0) {
      db.dashboardsettings.set(defaultdata.dashboardsettings);
    }

    test = db.eventhandle.find();
    if (test == null || test.length === 0) {
      db.eventhandle.set(defaultdata.eventhandle);
    }

    test = db.groups.find();
    if (test == null || test.length === 0) {
      db.groups.set(defaultdata.groups);
    }

    test = db.ioboxes.find();
    if (test == null || test.length === 0) {
      db.ioboxes.set(defaultdata.ioboxes);
    }

    test = db.managersettings.find();
    if (test == null || test.length === 0) {
      db.managersettings.set(defaultdata.managersettings);
    }

    test = db.outputdevicegroups.find();
    if (test == null || test.length === 0) {
      db.outputdevicegroups.set(defaultdata.outputdevicegroups);
    }

    test = db.person.find();
    if (test == null || test.length === 0) {
      db.person.set(defaultdata.person);
    }

    test = db.system_settings.find();
    if (test == null || test.length === 0) {
      db.system_settings.set(defaultdata.system_settings);
    }

    // test = db.systemlog.find();
    // if (test == null || test.length === 0) {
    //   db.systemlog.set(defaultdata.systemlog);
    // }

    test = db.tablets.find();
    if (test == null || test.length === 0) {
      db.tablets.set(defaultdata.tablets);
    }

    test = db.videodevicegroups.find();
    if (test == null || test.length === 0) {
      db.videodevicegroups.set(defaultdata.videodevicegroups);
    }

    test = db.visitor.find();
    if (test == null || test.length === 0) {
      db.visitor.set(defaultdata.visitor);
    }

    test = db.wiegandconverters.find();
    if (test == null || test.length === 0) {
      db.wiegandconverters.set([]);
    }
  }

  return {
    init,
  };
};
