module.exports = () => {
  async function create(data) {
    global.spiderman.systemlog.generateLog(4, `domain camera create query=[${JSON.stringify(data)}]`);

    // todo 確認 MAX 數量
    const MAX_ROI = 5;
    const { roi } = data;
    if (roi.length > MAX_ROI) {
      global.spiderman.systemlog.generateLog(2, `Roi number has exceeded ${MAX_ROI} (max).`);
      throw Error(`Roi number has exceeded ${MAX_ROI} (max).`);
    }

    // todo 確認 MAX 數量
    const MAX_AMOUNT = 500;
    const cameras = global.spiderman.db.cameras.find();
    if (cameras.length >= MAX_AMOUNT) {
      global.spiderman.systemlog.generateLog(2, `Items in database has exceeded ${MAX_AMOUNT} (max).`);
      throw Error(`Items in database has exceeded ${MAX_AMOUNT} (max).`);
    }

    const repeatItem = global.domain.device.findByName(data.name);
    if (repeatItem) {
      global.spiderman.systemlog.generateLog(2, `Name existed. type: ${repeatItem.type}`);
      throw Error(`Name existed. type: ${repeatItem.type}`);
    }

    data.divice_groups = generateGroups(data.divice_groups);

    await global.domain.crud.insertOne({
      collection: 'cameras',
      data,
    });
  }

  async function modify({ uuid, data }) {
    global.spiderman.systemlog.generateLog(4, `domain camera modify uuid=[${uuid}] name=[${data.name}]`);

    const MAX_ROI = 5;
    const { roi } = data;
    if (roi.length > MAX_ROI) {
      global.spiderman.systemlog.generateLog(2, `Roi number has exceeded ${MAX_ROI} (max).`);
      throw Error(`Roi number has exceeded ${MAX_ROI} (max).`);
    }

    const repeatItem = global.domain.device.findByName(data.name);
    if (repeatItem && repeatItem.uuid !== uuid) {
      global.spiderman.systemlog.generateLog(2, `Name existed. type: ${repeatItem.type}`);
      throw Error(`Name existed. type: ${repeatItem.type}`);
    }

    data.divice_groups = generateGroups(data.divice_groups);

    await global.domain.crud.modify({
      collection: 'cameras',
      uuid,
      data,
    });

    global.spiderman.systemlog.generateLog(4, `domain camera modify uuid=[${uuid}] name=[${data.name}] ok`);
  }

  function count() {
    global.spiderman.systemlog.generateLog(4, 'domain camera count');
    const { totalLength } = global.domain.crud
      .find({
        collection: 'cameras',
        query: {},
        sliceShift: 0,
        sliceLength: 1,
      });

    global.spiderman.systemlog.generateLog(4, `domain camera count ${totalLength || 0}`);

    return totalLength || 0;
  }

  function generateGroups(uuids) {
    global.spiderman.systemlog.generateLog(4, `domain camera generateGroups uuid=[${uuids}]`);

    const defaultUUid = '0';
    if (!uuids.includes(defaultUUid)) uuids.push(defaultUUid);

    const result = global.spiderman.db.videodevicegroups
      .find({ uuid: { $in: uuids } })
      .map(({ uuid }) => uuid);

    return result;
  }

  async function status() {
    global.runtimcache.camerasStatus = global.runtimcache.camerasStatus.filter(
      (t) => t.timestamp >= (Date.now() - 35000),
    );
    global.runtimcache.tabletsStatus = global.runtimcache.tabletsStatus.filter(
      (t) => t.timestamp >= (Date.now() - 35000),
    );

    global.spiderman.systemlog.generateLog(4, `domain camera status camerasStatus=[${JSON.stringify(global.runtimcache.camerasStatus)}]`);
    global.spiderman.systemlog.generateLog(4, `domain camera status tabletsStatus=[${JSON.stringify(global.runtimcache.tabletsStatus)}]`);

    return new Promise((resolve) => {
      resolve([...global.runtimcache.camerasStatus, ...global.runtimcache.tabletsStatus]);
    });
  }

  return {
    create,
    modify,
    count,
    status,
  };
};
