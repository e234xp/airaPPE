module.exports = () => {
  const publicCgi = ['checkin', 'verifyfaceservice', 'verifycardnoservice', 'getpersonface'];

  const router = {
    checkin: require('../../app/api/tablet/checkin'),
    verifyfaceservice: require('../../app/api/tablet/verifyfaceservice'),
    verifycardnoservice: require('../../app/api/tablet/verifycardnoservice'),
    getverifyresult: require('../../app/api/tablet/getverifyresult'),
    getpersonface: require('../../app/api/tablet/getpersonface'),
  };

  return {
    publicCgi,
    router,
  };
};
