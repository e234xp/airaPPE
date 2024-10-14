module.exports = () => {
  async function create(data) {
    global.spiderman.systemlog.generateLog(4, `domain wiegandconverter create ${data.uuid} ${data.name}`);

    // todo 確認 MAX 數量
    const MAX_AMOUNT = 500;
    const wiegandConverters = global.spiderman.db.wiegandconverters.find();
    if (wiegandConverters.length >= MAX_AMOUNT) {
      global.spiderman.systemlog.generateLog(2, `domain wiegandconverter create Items in database has exceeded ${MAX_AMOUNT} (max).`);
      throw Error(`Items in database has exceeded ${MAX_AMOUNT} (max).`);
    }

    const repeatItem = global.domain.device.findByName(data.name);
    if (repeatItem) {
      global.spiderman.systemlog.generateLog(2, `domain wiegandconverter create Name existed. type: ${repeatItem.type}`);
      throw Error(`Name existed. type: ${repeatItem.type}`);
    }

    data.divice_groups = generateGroups(data.divice_groups);

    await global.domain.crud.insertOne({
      collection: 'wiegandconverters',
      data,
    });
  }

  async function modify({ uuid, data }) {
    global.spiderman.systemlog.generateLog(4, `domain wiegandconverter modify ${uuid} ${data.name}`);

    const repeatItem = global.domain.device.findByName(data.name);
    if (repeatItem && repeatItem.uuid !== uuid) {
      global.spiderman.systemlog.generateLog(2, `domain wiegandconverter modify Name existed. type: ${repeatItem.type}`);
      throw Error(`Name existed. type: ${repeatItem.type}`);
    }

    data.divice_groups = generateGroups(data.divice_groups);

    global.domain.crud.modify({
      collection: 'wiegandconverters',
      uuid,
      data,
    });
  }

  function generateGroups(uuids) {
    global.spiderman.systemlog.generateLog(4, `domain wiegandconverter generateGroups ${uuids} `);

    const defaultUUid = '0';
    if (!uuids.includes(defaultUUid)) uuids.push(defaultUUid);

    const result = global.spiderman.db.outputdevicegroups
      .find({ uuid: { $in: uuids } })
      .map(({ uuid }) => uuid);

    return result;
  }

  function remove(data) {
    global.spiderman.systemlog.generateLog(4, `domain wiegandconverter remove ${data.uuid} `);

    // global.domain.crud.handleRelatedUuids({
    //   collection: 'rules',
    //   field: 'actions.wiegand_converters',
    //   uuids: data.uuid,
    // });

    global.domain.crud.remove({
      collection: 'wiegandconverters',
      uuid: data.uuid,
    });
  }

  return {
    create,
    modify,
    remove,
  };
};
