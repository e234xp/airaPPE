module.exports = () => {
  function findByName(name) {
    const result = {
      type: null,
      uuid: null,
    };

    const camera = global.spiderman.db.cameras.findOne({ name });
    if (camera) {
      result.type = 'camera';
      result.uuid = camera.uuid;
      return result;
    }

    const tablet = global.spiderman.db.tablets.findOne({ name });
    if (tablet) {
      result.type = 'tablet';
      result.uuid = tablet.uuid;
      return result;
    }

    const wiegandconverter = global.spiderman.db.wiegandconverters.findOne({ name });
    if (wiegandconverter) {
      result.type = 'wiegandconverter';
      result.uuid = wiegandconverter.uuid;
      return result;
    }

    const iobox = global.spiderman.db.ioboxes.findOne({ name });
    if (iobox) {
      result.type = 'iobox';
      result.uuid = iobox.uuid;
      return result;
    }

    return null;
  }

  function findByUuid(uuid) {
    const result = {
      type: null,
      name: null,
    };

    const camera = global.spiderman.db.cameras.findOne({ uuid });
    if (camera) {
      result.type = 'camera';
      result.name = camera.name;
      return result;
    }

    const tablet = global.spiderman.db.tablets.findOne({ uuid });
    if (tablet) {
      result.type = 'tablet';
      result.name = tablet.name;
      return result;
    }
    return result;
  }

  return {
    findByName,
    findByUuid,
  };
};
