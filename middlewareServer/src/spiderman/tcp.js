const net = require('net');

module.exports = () => {
  function connect({
    host, port, timeOut = 10000,
    onConnect = () => { },
    onData = () => { },
    onClose = () => { },
    onError = () => { },
    onTimeout = () => { },
  }) {
    // 建立 TCP 連線
    const client = new net.Socket();
    if (timeOut > 0) client.setTimeout(timeOut);

    // 連接到遠端伺服器
    client.connect(port, host, () => {
      // global.spiderman.systemlog.generateLog(4, `TCP connected ${host}:${port}`);

      onConnect(client);
    });

    // 監聽從伺服器接收的資料
    client.on('data', (data) => {
      onData(client, data);
    });

    // 監聽連線關閉事件
    client.on('close', () => {
      // global.spiderman.systemlog.generateLog(4, `TCP closed ${host}:${port}`);

      onClose(client);
    });

    // 監聽連線錯誤事件
    client.on('error', (err) => {
      // global.spiderman.systemlog.generateLog(4, `TCP error ${host}:${port} ${err}`);

      onError(client);
      client.destroy();
    });

    client.on('timeout', () => {
      // global.spiderman.systemlog.generateLog(4, `TCP timeout ${host}:${port}`);
      onTimeout(client);
      client.destroy();
    });

    return client;
  }

  return {
    connect,
  };
};
