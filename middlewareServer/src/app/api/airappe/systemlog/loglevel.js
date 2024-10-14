module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `loglevel ${JSON.stringify(data)}`);

  let loglevel = data.loglevel || 4;

  if ([1, 2, 3, 4, 5, 6].indexOf(loglevel) <= -1) {
    loglevel = 4;
  }

  global.params.loglevel = loglevel;
  global.params.logreset = new Date() - 0 + 600000; // 10 mins

  global.spiderman.systemlog.generateLog(4, `loglevel=${global.params.loglevel} logreset=${global.params.logreset}`);

  const ret = {
    message: 'ok',
  };

  return ret;
};
