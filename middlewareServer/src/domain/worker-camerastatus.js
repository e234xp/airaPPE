module.exports = () => {
  function init() {
    global.spiderman.systemlog.generateLog(4, 'domain worker-camerastatus init');

    const receivePort = 2221;

    const server = global.spiderman.udp.create();

    server.on('listening', () => {
      const address = server.address();
      global.spiderman.systemlog.generateLog(5, `domain worker-camerastatus camerastatus ${address.address}:${address.port}`);
    });

    server.on('message', (msg) => {
      const camerasStatus = [];

      let currentPos = 4;
      while (msg.length > currentPos) {
        const mediaAlive = Number(msg.readUInt32LE(currentPos));
        currentPos += 4;
        const mediaIdLen = Number(msg.readUInt32LE(currentPos));
        currentPos += 4;
        const mediaId = msg.toString('utf8', currentPos, currentPos + mediaIdLen);
        currentPos += mediaIdLen;

        camerasStatus.push({
          uuid: mediaId,
          alive: (mediaAlive === 1),
          timestamp: Date.now(),
        });
      }

      global.runtimcache.camerasStatus = camerasStatus;

      global.spiderman.systemlog.generateLog(5, `domain worker-camerastatus camerastatus ${global.runtimcache.camerasStatus}`);
    });
    server.bind(receivePort);
  }

  return {
    init,
  };
};
