module.exports = async () => {
  global.spiderman.systemlog.generateLog(4, 'downloadcrashlog');

  const path = '/data/user/0/com.aira.airatabletlite/files/lastcrashlog.log';
  const fileName = (() => {
    const now = new Date();

    return `airafacelite-crashlog${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.log`;
  })();

  return {
    action: 'download',
    path,
    fileName,
  };
};
