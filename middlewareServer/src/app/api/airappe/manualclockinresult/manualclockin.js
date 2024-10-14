module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `manualclockinresult manualclockin ${JSON.stringify(data)}`);

  const response = await global.spiderman.request.make({
    url: `http://${global.params.localhost}/system/manualclockin`,
    method: 'POST',
    pool: { maxSockets: 10 },
    time: true,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    json: data,
  });

  global.spiderman.systemlog.generateLog(4, `manualclockinresult manualclockin ${JSON.stringify(response)}`);
  return response;
};
