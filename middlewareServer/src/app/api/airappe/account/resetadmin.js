module.exports = () => {
  // not release
  global.spiderman.systemlog.generateLog(4, 'account resetAdmin');

  const accounts = global.spiderman.db.account.find();
  const adminAccount = accounts.find((a) => a.username === 'Admin');

  if (!adminAccount) {
    global.spiderman.systemlog.generateLog(4, 'Admin not found.');
    throw Error('Item not found.');
  }

  adminAccount.last_modify_date = Date.now();
  adminAccount.password = '123456';
  global.spiderman.db.account.set(accounts);

  global.spiderman.systemlog.generateLog(4, 'resetAdmin ok');

  return {
    message: 'ok',
  };
};
