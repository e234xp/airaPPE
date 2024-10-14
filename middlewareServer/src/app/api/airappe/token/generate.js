const fieldChecks = [
  {
    fieldName: 'username',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'password',
    fieldType: 'string',
    required: true,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `token generate ${data.username}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const { username, password } = data;
  const account = global.spiderman.db.account.findOne({ username, password });

  if (!account) {
    global.spiderman.systemlog.generateLog(2, `${data.username} Unauthorized`);
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

  global.spiderman.systemlog.generateLog(4, `token generate ${ret.username} ${ret.token} ${ret.expire}`);

  return ret;
};
