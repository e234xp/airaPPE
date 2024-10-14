module.exports = () => {
  async function create(data) {
    global.spiderman.systemlog.generateLog(4, `domain tablet create ${JSON.stringify(data)}`);

    // todo 確認 MAX 數量
    const MAX_AMOUNT = 500;
    const tablets = global.spiderman.db.tablets.find();
    if (tablets.length >= MAX_AMOUNT) throw Error(`Items in database has exceeded ${MAX_AMOUNT} (max).`);

    const repeatItem = global.domain.device.findByName(data.name);
    if (repeatItem) throw Error(`Name existed. type: ${repeatItem.type}`);

    data.divice_groups = generateGroups(data.divice_groups);
    data.group_list_to_pass = generatePersonGroups(data.group_list_to_pass);

    await global.domain.crud.insertOne({
      collection: 'tablets',
      data,
    });
  }

  async function modify({ uuid, data }) {
    global.spiderman.systemlog.generateLog(4, `domain tablet modify ${uuid} ${JSON.stringify(data)}`);

    const repeatItem = global.domain.device.findByName(data.name);
    if (repeatItem && repeatItem.uuid !== uuid) throw Error(`Name existed. type: ${repeatItem.type}`);

    data.divice_groups = generateGroups(data.divice_groups);
    data.group_list_to_pass = generatePersonGroups(data.group_list_to_pass);

    await global.domain.crud.modify({
      collection: 'tablets',
      uuid,
      data,
    });
  }

  function count() {
    const { totalLength } = global.domain.crud
      .find({
        collection: 'tablets',
        query: {},
        sliceShift: 0,
        sliceLength: 1,
      });

    return totalLength || 0;
  }

  function generateGroups(uuids) {
    global.spiderman.systemlog.generateLog(4, `domain tablet generateGroups ${uuids}`);

    const defaultUUid = '1';
    if (!uuids.includes(defaultUUid)) uuids.push(defaultUUid);

    const result = global.spiderman.db.videodevicegroups
      .find({ uuid: { $in: uuids } })
      .map(({ uuid }) => uuid);

    return result;
  }

  function generatePersonGroups(uuids) {
    global.spiderman.systemlog.generateLog(4, `domain tablet generatePersonGroups ${uuids}`);

    const result = global.spiderman.db.groups
      .find({ uuid: { $in: uuids } })
      .map(({ uuid }) => uuid);

    return result;
  }

  async function status() {
    global.spiderman.systemlog.generateLog(4, 'domain tablet status');

    global.runtimcache.camerasStatus = global.runtimcache.camerasStatus.filter(
      (t) => t.timestamp >= (Date.now() - 35000),
    );

    global.runtimcache.tabletsStatus = global.runtimcache.tabletsStatus.filter(
      (t) => t.timestamp >= (Date.now() - 35000),
    );

    return new Promise((resolve) => {
      resolve([...global.runtimcache.camerasStatus, ...global.runtimcache.tabletsStatus]);
    });
  }

  async function change(data) {
    global.spiderman.systemlog.generateLog(4, `domain tablet change ${JSON.stringify(data)}`);

    const { uuid } = data;
    await global.domain.crud.modify({
      collection: 'tablets',
      uuid,
      data: { ip_address: '', code: '' },
    });
  }

  return {
    create,
    modify,
    count,
    status,
    change,
  };
};
