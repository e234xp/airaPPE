module.exports = async () => {
  global.spiderman.systemlog.generateLog(4, 'downloaddb');

  const path = `${global.params.dataPath}/dbbak.dbf`;
  const fileName = (() => {
    const now = new Date();

    return `${global.params.prefix}db-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.dbf`;
  })();

  return {
    action: 'download',
    path,
    fileName,
  };
};
