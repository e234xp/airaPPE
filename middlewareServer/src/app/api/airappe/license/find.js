module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `license find ${JSON.stringify(data)}`);

  const response = await global.spiderman.request.make({
    url: `http://${global.params.systemservice}/system/findlicense`,
    method: 'POST',
    pool: { maxSockets: 10 },
    time: true,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    json: data,
  });

  global.spiderman.systemlog.generateLog(4, `license find ${JSON.stringify(response.body)}`);

  return response;
};
