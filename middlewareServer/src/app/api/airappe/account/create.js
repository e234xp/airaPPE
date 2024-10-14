// const { uuid } = require('uuidv4');

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
  {
    fieldName: 'permission',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'remarks',
    fieldType: 'string',
    required: true,
  },
];

module.exports = async (data, token) => {
  global.spiderman.systemlog.generateLog(4, `account create ${data.username}`);

  // paramters checker
  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const tokenUser = global.spiderman.token.decryptToAccount(token);
  const isPassed = tokenUser.u.length > 0
    && data.username.length > 0
    && data.password.length > 0
    && data.permission.length > 0;
  if (!isPassed) {
    global.spiderman.systemlog.generateLog(4, 'Username or password cannot be empty.');
    throw Error('Username or password cannot be empty.');
  }

  const accounts = global.spiderman.db.account.find();

  const adminAccount = accounts.find((item) => (item.username === tokenUser.u) && (item.permission === 'Admin'));
  if (!adminAccount) {
    global.spiderman.systemlog.generateLog(4, 'No permission.');
    throw Error('No permission.');
  }

  const existededAccount = accounts.find((item) => (item.username === data.username));
  if (existededAccount) {
    global.spiderman.systemlog.generateLog(4, 'The item has already existed.');
    throw Error('The item has already existed.');
  }

  const account = await global.domain.account.create(data);

  global.spiderman.systemlog.generateLog(4, `account create ${JSON.stringify({ uuid: account.uuid, username: account.username })}`);

  return {
    message: 'ok',
    uuid: account.uuid,
    username: account.username,
  };
};
