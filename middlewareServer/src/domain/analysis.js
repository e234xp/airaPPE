module.exports = () => {
  async function find({
    uuid, keyword, sliceShift, sliceLength,
  }) {
    global.spiderman.systemlog.generateLog(4, `domain analysis find query=[${uuid} ${keyword}]`);

    const { totalLength, result } = await global.domain.crud
      .find({
        collection: 'analysis',
        query: {
          ...(!uuid ? {} : { uuid }),
          ...(!keyword ? {} : { $or: [{ name: { $regex: keyword } }] }),
        },
        sliceShift,
        sliceLength,
      });

    return {
      totalLength, result,
    };
  }

  async function create(data) {
    global.spiderman.systemlog.generateLog(4, `domain analysis create query=[${JSON.stringify(data)}]`);

    const source = global.domain.device.findByUuid(data.video_source);

    if (source.name == null) {
      global.spiderman.systemlog.generateLog(2, `${data.video_source} not existed`);
      throw Error(`${data.video_source} not existed`);
    }

    const repeatItem = await global.domain.analysis.find({
      keyword: data.name, sliceShift: 0, sliceLength: 10000,
    });

    if (repeatItem.totalLength >= 1) {
      global.spiderman.systemlog.generateLog(2, `${data.name} existed`);
      throw Error(`${data.name} existed`);
    }

    await global.domain.crud.insertOne({
      collection: 'analysis',
      data,
    });
  }

  async function modify({ uuid, data }) {
    global.spiderman.systemlog.generateLog(4, `domain analysis modify uuid=[${uuid}] name=[${data.name}]`);

    const source = global.domain.device.findByUuid(data.video_source);

    if (source.name == null) {
      global.spiderman.systemlog.generateLog(2, `${data.video_source} not existed`);
      throw Error(`${data.video_source} not existed`);
    }

    const repeatItem = await global.domain.analysis.find({
      keyword: data.name, sliceShift: 0, sliceLength: 10000,
    });

    if (repeatItem.totalLength >= 1) {
      if (repeatItem.result) {
        if (repeatItem.result[0].uuid !== uuid) {
          global.spiderman.systemlog.generateLog(2, `Name existed. type: ${repeatItem.type}`);
          throw Error(`Name existed. type: ${repeatItem.type}`);
        }
      }
    }

    await global.domain.crud.modify({
      collection: 'analysis',
      uuid,
      data,
    });

    global.spiderman.systemlog.generateLog(4, `domain analysis modify uuid=[${uuid}] name=[${data.name}] ok`);
  }

  function remove(data) {
    global.spiderman.systemlog.generateLog(4, `domain analysis remove ${JSON.stringify(data)}`);

    global.domain.crud.remove({
      collection: 'analysis',
      uuid: data.uuid,
    });
  }

  function removeByVideoSource(uuid) {
    global.spiderman.systemlog.generateLog(4, `domain analysis removeByVideoSource ${JSON.stringify(uuid)}`);

    global.spiderman.db.analysis.deleteMany({ video_source: { $in: uuid } });
  }

  return {
    find,
    create,
    modify,
    remove,
    removeByVideoSource,
  };
};
