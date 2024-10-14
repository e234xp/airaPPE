const dgram = require('dgram');

module.exports = () => {
  function create() {
    const client = dgram.createSocket('udp4');

    return client;
  }

  return {
    create,
  };
};
