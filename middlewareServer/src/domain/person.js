// const { uuid: uuidv4 } = require('uuidv4');

module.exports = (collection = global.spiderman.db.person) => {
  function find({
    query, shift, sliceLength, data,
  }) {
    global.spiderman.systemlog.generateLog(4, `domain person find ${query} ${shift} ${sliceLength} ${JSON.stringify(data)}`);

    const allData = collection
      .find(query);

    const totalLength = allData.length;

    const result = allData
      .slice(shift, shift + sliceLength)
      .map((item) => {
        delete item.___id;
        delete item.___s;
        if (!data.download_face_feature) delete item.face_feature;
        if (data.download_register_image || data.download_display_image) {
          const photo = fetchPhoto(item.uuid);
          if (data.download_register_image) item.register_image = photo.register_image;
          if (data.download_display_image) item.display_image = photo.display_image;
        }

        return item;
      });

    return { totalLength, result };
  }

  async function insert({
    data: { display_image: displayImage, register_image: _, ...otherData }, faceImage = '', faceFeature = '', upperFaceFeature = '',
  }) {
    global.spiderman.systemlog.generateLog(4, `domain person insert ${otherData}`);

    const now = Date.now();
    const dataToWrite = {
      // uuid: uuidv4(),
      ...otherData,
      // face_feature: faceFeature,
      // upper_face_feature: upperFaceFeature,
      create_date: now,
      last_modify_date: now,
      last_modify_date_by_manager: now,
    };

    if (faceFeature) dataToWrite.face_feature = faceFeature;
    if (upperFaceFeature) dataToWrite.upper_face_feature = upperFaceFeature;

    displayImage = await global.spiderman.image.resize(displayImage);

    const registerImage = faceImage;

    if (displayImage || registerImage) {
      savePhoto({
        uuid: dataToWrite.uuid,
        displayImage,
        registerImage,
      });
    }

    collection.insertOne(dataToWrite);

    if (dataToWrite.plugin_info) {
      const plugData = {
        uuid: dataToWrite.uuid,
        action: 'create',
        newData: dataToWrite.plugin_info,
        timestamp: Date.now(),
      };

      global.spiderman.db.personplugininfo.insertOne(plugData);
    }
  }

  async function modify({
    uuid, data: { display_image: displayImage, register_image: _, ...otherData }, faceImage = '', faceFeature = '', upperFaceFeature = '',
  }) {
    global.spiderman.systemlog.generateLog(4, `domain person modify ${otherData}`);

    const now = Date.now();
    const dataToWrite = {
      ...otherData,
      // face_feature: faceFeature,
      // upper_face_feature: upperFaceFeature,
      last_modify_date: now,
      last_modify_date_by_manager: now,
    };

    if (faceFeature) dataToWrite.face_feature = faceFeature;
    if (upperFaceFeature) dataToWrite.upper_face_feature = upperFaceFeature;

    displayImage = await global.spiderman.image.resize(displayImage);

    const registerImage = faceImage;

    if (displayImage || registerImage) {
      savePhoto({
        uuid,
        displayImage,
        registerImage,
      });
    }

    let original = {};
    if (dataToWrite.plugin_info) {
      const oriData = await collection.find({ uuid });

      if (oriData.length >= 1) {
        original = oriData[0].plugin_info;
      }
    }

    collection.updateOne({ uuid }, dataToWrite);

    if (dataToWrite.plugin_info) {
      const plugData = {
        uuid: dataToWrite.uuid,
        action: 'modify',
        oriData: original,
        newData: dataToWrite.plugin_info,
        timestamp: Date.now(),
      };

      global.spiderman.db.personplugininfo.insertOne(plugData);
    }
  }

  function remove({ uuid }) {
    global.spiderman.systemlog.generateLog(4, `domain person remove ${uuid}`);

    uuid.forEach(async (id) => {
      const oriData = await collection.find({ uuid: id });

      if (oriData.length >= 1) {
        if (oriData[0].plugin_info) {
          const plugData = {
            uuid: id,
            action: 'remove',
            oriData: oriData[0].plugin_info,
            timestamp: Date.now(),
          };

          global.spiderman.db.personplugininfo.insertOne(plugData);
        }
      }
    });

    collection.deleteMany({ uuid: { $in: uuid } });
    removePhoto(uuid);
  }

  function removeAll() {
    global.spiderman.systemlog.generateLog(4, 'domain person removeAll');

    const items = collection.deleteMany({});
    const uuids = items.map(({ uuid }) => uuid);
    removePhoto(uuids);
  }

  function savePhoto({ uuid, displayImage, registerImage }) {
    global.spiderman.systemlog.generateLog(4, `domain person savePhoto ${uuid}`);

    if (displayImage) {
      global.spiderman.db.dbPhoto.insertOne(`${uuid}.display`, displayImage);
    }

    if (registerImage) {
      global.spiderman.db.dbPhoto.insertOne(`${uuid}.register`, registerImage);
    }
  }

  function removePhoto(uuid) {
    global.spiderman.systemlog.generateLog(4, `domain person removePhoto ${uuid}`);

    const fileNames = uuid
      .map((item) => ([`${item}.display`, `${item}.register`]))
      .flat();

    global.spiderman.db.dbPhoto.deleteMany(fileNames);
  }

  function fetchPhoto(uuid) {
    global.spiderman.systemlog.generateLog(4, `domain person fetchPhoto ${uuid}`);

    const isFetch = uuid && uuid.length > 0;

    return isFetch
      ? {
        display_image: global.spiderman.db.dbPhoto.findOne(`${uuid}.display`),
        register_image: global.spiderman.db.dbPhoto.findOne(`${uuid}.register`),
      }
      : {
        display_image: '',
        register_image: '',
      };
  }

  return {
    find,
    insert,
    modify,
    remove,
    removeAll,
    fetchPhoto,
  };
};
