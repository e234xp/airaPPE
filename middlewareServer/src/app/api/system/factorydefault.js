module.exports = async () => {
  global.spiderman.systemlog.generateLog(4, 'factorydefault');

  const response = await global.spiderman.request.make({
    url: `http://${global.params.localhost}/system/factorydefault`,
    method: 'POST',
    pool: { maxSockets: 10 },
    time: true,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    json: {},
  });

  return response;
};
