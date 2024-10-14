const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return undefined;
      }
      seen.add(value);
    }
    return value;
  };
};

module.exports = () => {
  function circularJson(data) {
    let reqData = null;
    const circularReplacedata = JSON.stringify(data, getCircularReplacer());
    try {
      reqData = JSON.parse(circularReplacedata);
    } catch (e) {
      global.spiderman.systemlog.generateLog(2, `spiderman parse circularJson ${e}`);
      console.log('circularJson', e);
    }
    return reqData;
  }

  function json(data) {
    let reqData = null;
    if (typeof data === 'string') {
      try {
        reqData = JSON.parse(data);
      } catch (e) {
        global.spiderman.systemlog.generateLog(2, `spiderman parse json ${e}`);
        console.log('json', e);
      }
    } else if (typeof data === 'object') {
      reqData = data;
    }

    return reqData;
  }

  return {
    circularJson,
    json,
  };
};
