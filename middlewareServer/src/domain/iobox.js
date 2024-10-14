module.exports = () => {
  async function create(data) {
    global.spiderman.systemlog.generateLog(4, `domain iobox create ${JSON.stringify(data)}`);

    // todo 確認 MAX 數量
    const MAX_AMOUNT = 500;
    const ioboxes = global.spiderman.db.ioboxes.find();
    if (ioboxes.length >= MAX_AMOUNT) {
      global.spiderman.systemlog.writeError(`Items in database has exceeded ${MAX_AMOUNT} (max).`);
      throw Error(`Items in database has exceeded ${MAX_AMOUNT} (max).`);
    }

    const repeatItem = global.domain.device.findByName(data.name);
    if (repeatItem) {
      global.spiderman.systemlog.writeError(`Name existed. type: ${repeatItem.type}`);
      throw Error(`Name existed. type: ${repeatItem.type}`);
    }

    data.divice_groups = generateGroups(data.divice_groups);

    await global.domain.crud.insertOne({
      collection: 'ioboxes',
      data,
    });
  }

  async function modify({ uuid, data }) {
    const repeatItem = global.domain.device.findByName(data.name);
    if (repeatItem && repeatItem.uuid !== uuid) {
      global.spiderman.systemlog.writeError(`Name existed. type: ${repeatItem.type}`);
      throw Error(`Name existed. type: ${repeatItem.type}`);
    }

    data.divice_groups = generateGroups(data.divice_groups);

    await global.domain.crud.modify({
      collection: 'ioboxes',
      uuid,
      data,
    });
  }

  function generateGroups(uuids) {
    global.spiderman.systemlog.generateLog(4, `domain iobox generateGroups ${uuids}`);

    const defaultUUid = '1';
    if (!uuids.includes(defaultUUid)) uuids.push(defaultUUid);

    const result = global.spiderman.db.outputdevicegroups
      .find({ uuid: { $in: uuids } })
      .map(({ uuid }) => uuid);

    return result;
  }

  function remove(data) {
    global.spiderman.systemlog.generateLog(4, `domain iobox remove ${JSON.stringify(data)}`);

    // global.domain.crud.handleRelatedUuids({
    //   collection: 'rules',
    //   field: 'actions.ioboxes',
    //   uuids: data.uuid,
    // });

    global.domain.crud.remove({
      collection: 'ioboxes',
      uuid: data.uuid,
    });
  }

  return {
    create,
    modify,
    remove,
  };
};
