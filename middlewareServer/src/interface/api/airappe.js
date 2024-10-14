module.exports = () => {
  const publicCgi = ['generatetoken', 'maintaintoken', 'resetpassword'];
  const router = {

    generatetoken: require(`../../app/api/${global.params.prefix}/token/generate`),
    maintaintoken: require(`../../app/api/${global.params.prefix}/token/maintain`),

    createaccount: require(`../../app/api/${global.params.prefix}/account/create`),
    findaccount: require(`../../app/api/${global.params.prefix}/account/find`),
    modifyaccount: require(`../../app/api/${global.params.prefix}/account/modify`),
    removeaccount: require(`../../app/api/${global.params.prefix}/account/remove`),
    resetpassword: require(`../../app/api/${global.params.prefix}/account/resetpassword`),

    // createcamera: require(`../../app/api/${global.params.prefix}/camera/create`),
    // findcamera: require(`../../app/api/${global.params.prefix}/camera/find`),
    // modifycamera: require(`../../app/api/${global.params.prefix}/camera/modify`),
    // removecamera: require(`../../app/api/${global.params.prefix}/camera/remove`),
    // getcamerasnapshot: require(`../../app/api/${global.params.prefix}/camerasnapshot/get`),
    createcamera: require(`../../app/api/${global.params.prefix}/camerappe/create`),
    findcamera: require(`../../app/api/${global.params.prefix}/camerappe/find`),
    modifycamera: require(`../../app/api/${global.params.prefix}/camerappe/modify`),
    removecamera: require(`../../app/api/${global.params.prefix}/camerappe/remove`),
    getcamerasnapshot: require(`../../app/api/${global.params.prefix}/camerasnapshot/getppe`),

    createanalysis: require(`../../app/api/${global.params.prefix}/analysis/create`),
    findanalysis: require(`../../app/api/${global.params.prefix}/analysis/find`),
    modifyanalysis: require(`../../app/api/${global.params.prefix}/analysis/modify`),
    removeanalysis: require(`../../app/api/${global.params.prefix}/analysis/remove`),

    getdashboardsettings: require(`../../app/api/${global.params.prefix}/dashboardsettings/get`),
    setdashboardsettings: require(`../../app/api/${global.params.prefix}/dashboardsettings/set`),

    getsystemsettings: require(`../../app/api/${global.params.prefix}/systemsettings/get`),
    setsystemsettings: require(`../../app/api/${global.params.prefix}/systemsettings/set`),
    restartservice: require(`../../app/api/${global.params.prefix}/systemsettings/restartservice`),

    querysystemlog: require(`../../app/api/${global.params.prefix}/systemlog/query`),
    loglevel: require(`../../app/api/${global.params.prefix}/systemlog/loglevel`),

    addlicense: require(`../../app/api/${global.params.prefix}/license/add`),
    addlicenseex: require(`../../app/api/${global.params.prefix}/license/addex`),
    findlicense: require(`../../app/api/${global.params.prefix}/license/find`),
    removelicense: require(`../../app/api/${global.params.prefix}/license/remove`),
    defaultlicense: require(`../../app/api/${global.params.prefix}/license/default`),

    findeventhandle: require(`../../app/api/${global.params.prefix}/eventhandle/find`),
    createeventhandle: require(`../../app/api/${global.params.prefix}/eventhandle/create`),
    modifyeventhandle: require(`../../app/api/${global.params.prefix}/eventhandle/modify`),
    removeeventhandle: require(`../../app/api/${global.params.prefix}/eventhandle/remove`),
  };

  return {
    publicCgi,
    router,
  };
};
