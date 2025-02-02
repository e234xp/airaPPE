module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `generatedbbackup ${JSON.stringify(data)}`);

  const response = await global.spiderman.request.make({
    url: `http://${global.params.systemservice}/system/zipdb`,
    method: 'POST',
    pool: { maxSockets: 10 },
    time: true,
    timeout: 600000,
    headers: {
      'Content-Type': 'application/json',
    },
    json: data,
  });

  return response;
};
