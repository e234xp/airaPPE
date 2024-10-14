module.exports = () => {
  const { db } = global.spiderman;

  async function find({
    query,
    slice_shift: sliceShift, slice_length: sliceLength,
  }) {
    global.spiderman.systemlog.generateLog(4, `domain videodevicegroup find query=[${JSON.stringify(query)}]`);

    const { totalLength, result } = await global.domain.crud
      .find({
        collection: 'videodevicegroups',
        query,
        sliceShift,
        sliceLength,
      });

    const resultWithDevices = result.map(({ uuid: theUuid, ...others }) => {
      const cameraUuidList = db.cameras
        .find({ divice_groups: { $some: [theUuid] } })
        .map((item) => item.uuid);

      const tabletUuidList = db.tablets
        .find({ divice_groups: { $some: [theUuid] } })
        .map((item) => item.uuid);

      return {
        uuid: theUuid,
        camera_uuid_list: cameraUuidList,
        tablet_uuid_list: tabletUuidList,
        ...others,
      };
    });

    global.spiderman.systemlog.generateLog(4, `domain videodevicegroup find totalLength=[${totalLength}]`);

    return { totalLength, result: resultWithDevices };
  }

  async function create({
    name,
    camera_uuid_list: cameraUuidList, tablet_uuid_list: tabletUuidList,
  }) {
    global.spiderman.systemlog.generateLog(4, `domain videodevicegroup create name=[${name}]`);

    const { uuid } = await global.domain.crud.insertOne({
      collection: 'videodevicegroups',
      data: { name },
    });

    addGroupToDevices({
      uuid,
      cameraUuidList,
      tabletUuidList,
    });

    global.spiderman.systemlog.generateLog(4, `domain videodevicegroup create uuid=[${uuid}] name=[${name}]`);
  }

  async function modify({
    uuid,
    name,
    camera_uuid_list: cameraUuidList,
    tablet_uuid_list: tabletUuidList,
  }) {
    global.spiderman.systemlog.generateLog(4, `domain videodevicegroup modify uuid=[${uuid}] name=[${name}]`);

    // const fixedUuids = ['0', '1'];
    // if (fixedUuids.includes(uuid)) throw Error('The item can not be change.');

    // const doesExist = !!db.videodevicegroups.findOne({ name, uuid: { $ne: uuid } });
    // if (doesExist) {
    //   global.spiderman.systemlog.generateLog(4, `domain videodevicegroup create The item uuid=[${uuid}] name=[${name}] has already existed.`);
    //   throw Error('The name has already existed.');
    // }

    await global.domain.crud.modify({
      collection: 'videodevicegroups',
      uuid,
      data: { name },
    });

    // global.domain.crud.handleRelatedUuids({
    //   collection: 'cameras',
    //   field: 'divice_groups',
    //   uuids: uuid,
    // });
    // global.domain.crud.handleRelatedUuids({
    //   collection: 'tablets',
    //   field: 'divice_groups',
    //   uuids: uuid,
    // });

    // addGroupToDevices({
    //   uuid,
    //   cameraUuidList,
    //   tabletUuidList,
    // });

    global.spiderman.systemlog.generateLog(4, `domain videodevicegroup modify uuid=[${uuid}] name=[${name}] ok`);
  }

  async function remove({ uuid }) {
    global.spiderman.systemlog.generateLog(4, `domain videodevicegroup remove uuid=[${uuid}]`);

    const fixedUuids = ['0', '1'];
    uuid = uuid.filter((item) => !fixedUuids.includes(item));

    // global.domain.crud.handleRelatedUuids({
    //   collection: 'rules',
    //   field: 'condition.video_device_groups',
    //   uuids: uuid,
    // });

    global.domain.crud.handleRelatedUuids({
      collection: 'cameras',
      field: 'divice_groups',
      uuids: uuid,
    });
    global.domain.crud.handleRelatedUuids({
      collection: 'tablets',
      field: 'divice_groups',
      uuids: uuid,
    });

    global.spiderman.systemlog.generateLog(4, `domain videodevicegroup remove uuid=[${uuid}] ok`);

    db.videodevicegroups.deleteMany({ uuid: { $in: uuid } });
  }

  function addGroupToDevices({
    uuid: groupUuid,
    cameraUuidList, tabletUuidList,
  }) {
    global.spiderman.systemlog.generateLog(4, `domain videodevicegroup addGroupToDevices uuid=[${groupUuid}]`);

    cameraUuidList.forEach((deviceUuid) => {
      const camera = db.cameras.findOne({ uuid: deviceUuid });
      if (!camera) return;
      db.cameras.updateOne({ uuid: deviceUuid }, {
        divice_groups: [...camera.divice_groups, groupUuid],
      });
    });

    tabletUuidList.forEach((deviceUuid) => {
      const tablet = db.tablets.findOne({ uuid: deviceUuid });
      if (!tablet) return;
      db.tablets.updateOne({ uuid: deviceUuid }, {
        divice_groups: [...tablet.divice_groups, groupUuid],
      });
    });

    global.spiderman.systemlog.generateLog(4, `domain videodevicegroup addGroupToDevices uuid=[${groupUuid}] ok`);
  }

  return {
    find,
    create,
    modify,
    remove,
  };
};
