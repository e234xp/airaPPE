const fieldChecks = [
  {
    fieldName: 'account_uuid_list',
    fieldType: 'array',
    required: true,
  },
];

module.exports = (data, token) => {
  global.spiderman.systemlog.generateLog(4, `account remove ${JSON.stringify(data.account_uuid_list)}`);

  // paramters checker
  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const tokenUser = global.spiderman.token.decryptToAccount(token);
  if (!tokenUser.u || data.account_uuid_list.length === 0) {
    global.spiderman.systemlog.generateLog(4, 'account_uuid_list cannot be empty');
    throw new Error('account_uuid_list cannot be empty');
  }

  const accounts = global.spiderman.db.account.find();

  // 檢查是否為使用Admin權限
  const isAdmin = accounts.some((a) => a.username === tokenUser.u && a.permission === 'Admin');
  if (!isAdmin) {
    global.spiderman.systemlog.generateLog(4, 'No permission.');
    throw Error('No permission.');
  }

  const newAccountList = accounts.filter((item) => {
    const isDeleting = data.account_uuid_list.includes(item.uuid);
    return !isDeleting || item.fixed;
  });

  if (newAccountList.length === accounts.length) {
    global.spiderman.systemlog.writeError('Item not found.');
    global.spiderman.systemlog.generateLog(4, `Item ${JSON.stringify(data.account_uuid_list)} not found.`);
    throw Error('Item not found.');
  }

  global.spiderman.db.account.set(newAccountList);

  global.spiderman.systemlog.generateLog(4, `account removed ${JSON.stringify(data.account_uuid_list.length)}.`);

  return {
    message: 'ok',
  };
};
