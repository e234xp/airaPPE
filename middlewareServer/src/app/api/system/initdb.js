module.exports = async () => {
  global.spiderman.systemlog.generateLog(4, 'initdb');

  const { initdb } = global.domain;
  initdb.init();

  return 'success';
};
