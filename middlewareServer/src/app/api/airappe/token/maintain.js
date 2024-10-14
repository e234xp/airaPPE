const fieldChecks = [
  {
    fieldName: 'token',
    fieldType: 'string',
    required: false,
  },
];

module.exports = (data) => {
  global.spiderman.systemlog.generateLog(5, `token maintain ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const validAccountData = global.spiderman.token.decryptToAccountInTime(data.token);
  if (!validAccountData) {
    global.spiderman.systemlog.generateLog(2, 'The token has expired.');
    throw Error('The token has expired.');
  }

  const { u: username, p: password } = validAccountData;
  const account = global.spiderman.db.account.findOne({ username, password });

  if (!account) {
    global.spiderman.systemlog.generateLog(2, `${account} Unauthorized`);
    throw Error('Unauthorized');
  }

  const ret = {
    message: 'ok',
    username: account.username,
    permission: account.permission,
    servertime: Date.now(),
    expire: Date.now() + 3600000,
    token: global.spiderman.token.encryptFromAccount({
      u: account.username,
      p: account.password,
      t: Date.now() + 3600000,
      x: account.permission,
    }),
  };

  global.spiderman.systemlog.generateLog(5, `token generate ${ret.username} ${ret.token} ${ret.expire}`);

  return ret;
};
