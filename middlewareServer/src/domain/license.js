module.exports = () => {
  const amount = 0;

  async function addLicense(data) {
    global.spiderman.systemlog.generateLog(4, `domain license add ${JSON.stringify(data)}`);

    const response = await global.spiderman.request.make({
      url: `http://${global.params.localhost}/system/addlicense`,
      method: 'POST',
      pool: { maxSockets: 10 },
      time: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      json: data,
    });

    return response;
  }

  async function findLicense(data) {
    const response = await global.spiderman.request.make({
      url: `http://${global.params.localhost}/system/findlicense`,
      method: 'POST',
      pool: { maxSockets: 10 },
      time: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      json: data,
    });
  }

  async function defaultLicense(data) {
    const response = await global.spiderman.request.make({
      url: `http://${global.params.localhost}/system/gendefaultlicense`,
      method: 'POST',
      pool: { maxSockets: 10 },
      time: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      json: data,
    });

    return response;
  }

  async function removeLicense(data) {
    const response = await global.spiderman.request.make({
      url: `http://${global.params.localhost}/system/removelicense`,
      method: 'POST',
      pool: { maxSockets: 10 },
      time: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      json: data,
    });

    return response;
  }

  return {
    addLicense,
    defaultLicense,
    removeLicense,
  };
};
