module.exports = () => {
  async function resize(base64Image) {
    return (await global.spiderman.request.make({
      url: `http://${global.params.systemservice}/system/resizeimage`,
      method: 'POST',
      pool: { maxSockets: 10 },
      time: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      json: { base64_image: base64Image },
    }))?.base64_image || '';
  }

  return {
    resize,
  };
};
