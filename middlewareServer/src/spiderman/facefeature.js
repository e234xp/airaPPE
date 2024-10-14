module.exports = () => {
  function engineGenerate(base64Image) {
    return global.spiderman.request.make({
      url: `http://${global.params.localhost}/system/generatefacefeature`,
      method: 'POST',
      pool: { maxSockets: 10 },
      time: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      json: { base64_image: base64Image },
    });
  }

  return {
    engineGenerate,
  };
};
