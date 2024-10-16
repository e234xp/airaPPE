module.exports = () => {
  async function create(data) {
    global.spiderman.systemlog.generateLog(4, `domain camera create query=[${JSON.stringify(data)}]`);

    // // todo 確認 MAX 數量
    // const MAX_ROI = 5;
    // const { roi } = data;
    // if (roi.length > MAX_ROI) {
    //   global.spiderman.systemlog.generateLog(2, `Roi number has exceeded ${MAX_ROI} (max).`);
    //   throw Error(`Roi number has exceeded ${MAX_ROI} (max).`);
    // }

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

    // data.divice_groups = generateGroups(data.divice_groups);

    const result = await global.domain.crud.insertOne({
      collection: 'cameras',
      data,
    });

    await generateMediaSetting({ type: 'device', mode: 'create', uuid: result.uuid });

    global.spiderman.systemlog.generateLog(4, `domain camera create query=[${JSON.stringify(data)}] ok`);
  }

  async function modify({ uuid, data }) {
    global.spiderman.systemlog.generateLog(4, `domain camera modify uuid=[${uuid}] name=[${data.name}]`);

    // const MAX_ROI = 5;
    // const { roi } = data;
    // if (roi.length > MAX_ROI) {
    //   global.spiderman.systemlog.generateLog(2, `Roi number has exceeded ${MAX_ROI} (max).`);
    //   throw Error(`Roi number has exceeded ${MAX_ROI} (max).`);
    // }

    const repeatItem = global.domain.device.findByName(data.name);
    if (repeatItem && repeatItem.uuid !== uuid) {
      global.spiderman.systemlog.generateLog(2, `Name existed. type: ${repeatItem.type}`);
      throw Error(`Name existed. type: ${repeatItem.type}`);
    }

    // data.divice_groups = generateGroups(data.divice_groups);

    await global.domain.crud.modify({
      collection: 'cameras',
      uuid,
      data,
    });

    await generateMediaSetting({ type: 'device', mode: 'modify', uuid });

    global.spiderman.systemlog.generateLog(4, `domain camera modify uuid=[${uuid}] name=[${data.name}] ok`);
  }

  async function remove({ uuid }) {
    global.spiderman.systemlog.generateLog(4, `domain camera remove uuid=[${uuid}]`);

    await global.domain.crud.remove({ collection: 'cameras', uuid });
    await global.domain.analysis.removeByVideoSource(uuid);

    await generateMediaSetting({ type: 'device', mode: 'remove', uuid });

    global.spiderman.systemlog.generateLog(4, `domain camera remove uuid=[${uuid}] ok`);
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

  function generateMediaSetting({ type, mode, uuid }) {
    console.log(type, mode, uuid);

    const mediaSetting = 'mediasetting.db';

    const cameras = global.spiderman.db.cameras.find();
    const analysis = global.spiderman.db.analysis.find();

    console.log('mediasetting.db', cameras, analysis);

    for (let i = 0; i < cameras.length; i += 1) {
      const an = analysis.filter((a) => a.video_source === cameras[i].uuid);

      // if (an.length >= 1) {
      //   for (let j = 0; j < an.length; j++) {
      //     let record = { ... cameras[i] };
      //     record.video_source

      //     delete record.snapshot ;

      //     let record = { ...cameras[i],
      //       name: `${cameras[i].name}-${an[j].name}`,
      //       divice_groups: cameras[i].divice_groups,
      //       show_video: cameras[i].show_video,
      //       use_gpu: cameras[i].use_gpu,
      //       video_source: { ...cameras[i], ...{snapshot: undefined} }
      //       }
      //     };
      //   }
      // }
    }
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
    remove,
    count,
    status,
  };
};
