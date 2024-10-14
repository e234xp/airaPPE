module.exports = () => {
  const { uuid: uuidv4 } = require('uuidv4');
  // const { db } = global.spiderman;

  async function find({
    data, token,
  }) {
    global.spiderman.systemlog.generateLog(4, `domain account find query=[${JSON.stringify(data)}]`);

    const { uuid, keyword } = data;

    let query = { ...(!uuid ? {} : { uuid }) };
    if (keyword) {
      query = { ...query, ...{ $or: [{ username: { $regex: keyword } }] } };
    }

    const accounts = (() => {
      const accountsTmp = global.spiderman.db.account.find(
        query,
      );
      const tokenUser = global.spiderman.token.decryptToAccount(token);

      return tokenUser.x === 'Admin'
        ? accountsTmp
        : accountsTmp.filter((d) => tokenUser.u === d.username);
    })();

    global.spiderman.systemlog.generateLog(4, `domain account find totalLength=[${accounts.length}]`);

    return { totalLength: accounts.length, result: accounts };
  }

  async function create({
    username, password, permission, remarks,
  }) {
    global.spiderman.systemlog.generateLog(4, `domain account create name=[${username}]`);

    const account = {
      uuid: uuidv4(),
      username,
      password,
      permission,
      remarks: remarks || '',
      fixed: false,
      create_date: Date.now(),
      last_modify_date: Date.now(),
    };

    global.spiderman.db.account.insertOne(account);

    global.spiderman.systemlog.generateLog(4, `domain account create uuid=[${account.uuid}] name=[${account.username}]`);

    return account;
  }

  async function modify({
    username, new_password: newPassword, new_permission: newPermission,
  }) {
    global.spiderman.systemlog.generateLog(4, `domain account modify name=[${username}]`);

    const set = {
      last_modify_date: Date.now(),
      password: newPassword,
      ...newPermission ? { permission: newPermission } : {},
    };

    global.spiderman.db.account.updateOne({ username }, set);

    global.spiderman.systemlog.generateLog(4, `domain account modify name=[${username}] ok`);
  }

  async function resetPassword(accounts, data) {
    global.spiderman.systemlog.generateLog(4, `domain account resetPassword name=[${data.username}]`);

    let response = null;

    try {
      response = await global.spiderman.request.make({
        url: `http://${global.params.localhost}/system/findlicense`,
        method: 'POST',
        pool: { maxSockets: 10 },
        time: true,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
        json: data,
      });

      // response.license = [
      //   {
      //     license_version: 10,
      //     corp_no: 1,
      //     trial_days: 0,
      //     vm: false,
      //     fre: true,
      //     frs: true,
      //     fcs_amount: 4,
      //     face_db_size: 0,
      //     api_call_amount: 1,
      //     uuid: '6E15024A-0835-628E-C4F9-48210B5179A8',
      //     mac: '48:21:0B:51:79:A830:89:4A:3B:F1:37',
      //     license_key: 'UVJUX-YYUSJ-TVFTY-TXTJY-IWRRG-XXJBB',
      //     activation_date: 1703041801441,
      //   },
      // ];
    } catch (e) {
      global.spiderman.systemlog.generateLog(4, `domain account resetPassword fatch license error. ${e}`);
      throw Error(`fatch license error. ${e}`);
    }

    if (response) {
      const licenses = response.license.filter((l) => l.license_key === data.license);
      if (licenses.length <= 0) {
        global.spiderman.systemlog.generateLog(4, 'domain account resetPassword license not found.');
        throw Error('license not found.');
      } else {
        accounts[0].last_modify_date = Date.now();
        accounts[0].password = data.password;

        global.spiderman.db.account.updateOne({ username: data.username }, accounts[0]);

        global.spiderman.systemlog.generateLog(4, `domain account resetPassword ${data.username}`);

        return {
          message: 'ok',
          username: data.username,
        };
      }
    } else {
      global.spiderman.systemlog.generateLog(4, 'domain account resetPassword license not found.');
      throw Error('license not found.');
    }
  }

  return {
    find,
    create,
    modify,
    resetPassword,
  };
};
