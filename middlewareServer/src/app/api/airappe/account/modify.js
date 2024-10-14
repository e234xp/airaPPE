const fieldChecks = [
  {
    fieldName: 'username',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'new_password',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'new_permission',
    fieldType: 'string',
    required: false,
  },
];

module.exports = async (data, token) => {
  global.spiderman.systemlog.generateLog(4, `account modify ${data.username}`);

  // paramters checker
  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const tokenUser = global.spiderman.token.decryptToAccount(token);

  // 檢查使用者名稱和新密碼是否為空
  if (!tokenUser.u || !data.username || !data.new_password) {
    global.spiderman.systemlog.generateLog(4, 'Username or password cannot be empty.');
    throw Error('Username or password cannot be empty.');
  }

  // 檢查權限
  if (data.username === 'Admin' && tokenUser.u !== 'Admin') {
    global.spiderman.systemlog.generateLog(4, 'No permission.');
    throw Error('No permission.');
  }

  const accounts = global.spiderman.db.account.find();

  // 檢查是否為使用Admin權限
  const isAdmin = accounts.some((a) => a.username === tokenUser.u && a.permission === 'Admin');

  // 尋找要修改的帳號
  const account = accounts.find((a) => a.username === data.username);
  if (!account) {
    global.spiderman.systemlog.generateLog(4, `Item ${data.username} not found.`);
    throw Error('Item not found.');
  }

  // 檢查是否有修改帳號的權限
  const canModifyAccount = isAdmin || tokenUser.u === account.username;
  if (!canModifyAccount) {
    global.spiderman.systemlog.generateLog(4, 'No permission.');
    throw Error('No permission.');
  }

  // // 更新帳號資料
  // const set = {
  //   last_modify_date: Date.now(),
  //   password: data.new_password,
  //   ...data.new_permission ? { permission: data.new_permission } : {},
  // };

  // global.spiderman.db.account.updateOne({ username: account.username }, set);

  await global.domain.account.modify(data);

  global.spiderman.systemlog.generateLog(4, `account modify uuid=[${account.uuid}] username=[${account.username}]`);

  return {
    message: 'ok',
    uuid: account.uuid,
    username: account.username,
  };
};
