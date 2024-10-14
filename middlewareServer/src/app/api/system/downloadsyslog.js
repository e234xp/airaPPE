module.exports = async () => {
  global.spiderman.systemlog.generateLog(4, 'downloadsyslog');

  await global.spiderman.request.make({
    url: `http://${global.params.localhost}/system/generatesyslog`,
    method: 'POST',
    pool: { maxSockets: 10 },
    time: true,
    timeout: 600000,
    headers: {
      'Content-Type': 'application/json',
    },
    json: {},
  });

  const path = '/data/user/0/com.aira.airatabletlite/files/syslog.log';
  const fileName = (() => {
    const now = new Date();

    return `airafacelite-syslog${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.log`;
  })();

  return {
    action: 'download',
    path,
    fileName,
  };
};
