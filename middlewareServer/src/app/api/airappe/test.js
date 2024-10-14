module.exports = async () => {
  global.spiderman.socket.broadcastMessage({ wss: global.spiderman.server.wsVerifyresults, message: 'broadcastMessage!!' });
  return {
    message: 'ok',
  };
};

function findOne() {
  const account = global.spiderman.db.account.findOne({ uuid: 'd7745790-e482-4eff-bc15-5487bcf8a4ab' });

  return account;
}

function insertOne() {
  const account = {
    username: 'Test',
    password: '123456',
    permission: 'User',
    remarks: 'remarks',
    fixed: false,
    create_date: Date.now(),
    last_modify_date: Date.now(),
  };
  global.spiderman.db.account.insertOne(account);
}

function insertMany() {
  const accounts = [
    {
      username: 'Test',
      password: '123456',
      permission: 'User',
      remarks: 'remarks',
      fixed: false,
      create_date: Date.now(),
      last_modify_date: Date.now(),
    },
    {
      username: 'Test2',
      password: '123456',
      permission: 'User',
      remarks: 'remarks',
      fixed: false,
      create_date: Date.now(),
      last_modify_date: Date.now(),
    },
    {
      username: 'Test3',
      password: '123456',
      permission: 'User',
      remarks: 'remarks',
      fixed: false,
      create_date: Date.now(),
      last_modify_date: Date.now(),
    },
  ];

  global.spiderman.db.account.insertMany(accounts);
}

function updateOne() {
  const account = global.spiderman.db.account.updateOne({ username: 'Test' }, { permission: 'C' });
  // console.log(account);
}
