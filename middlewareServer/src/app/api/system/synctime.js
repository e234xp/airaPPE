module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `synctime ${JSON.stringify(data)}`);

  const response = await global.spiderman.request.make({
    url: `http://${global.params.systemservice}/system/synctime`,
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
};
