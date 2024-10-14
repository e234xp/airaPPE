module.exports = () => {
  let allIoboxes = [];

  let ignoreConnectionLog = [];

  function init() {
    global.spiderman.systemlog.generateLog(4, 'domain worker-iobox init');

    allIoboxes.forEach(({ client }) => {
      client.end();
    });
    allIoboxes = [];

    setTimeout(() => {
      global.spiderman.systemlog.generateLog(4, 'domain worker-iobox connectIoboxes');
      connectIoboxes();
    }, 100);
  }

  function connectIoboxes() {
    global.spiderman.systemlog.generateLog(5, 'domain worker-iobox connectIoboxes');

    const ioboxes = global.spiderman.db.eventhandle.find({ action_type: 'iobox' });

    global.spiderman.systemlog.generateLog(5, `domain worker-iobox ioboxes.length ${ioboxes.length}`);

    ioboxes.forEach((iobox) => {
      // iobox.timeout = 15000;
      const hostBox = allIoboxes.findIndex((item) => (item ? item.host === iobox.host : false));

      if (hostBox <= -1) {
        global.spiderman.systemlog.generateLog(4, `domain worker-iobox connect ${iobox.host}`);
        connect(iobox);
      } else if (
        allIoboxes[hostBox].connecting !== true
        && allIoboxes[hostBox].connected !== true
      ) {
        allIoboxes.splice(hostBox, 1);

        global.spiderman.systemlog.generateLog(4, `domain worker-iobox re-connect ${iobox.host}`);
        connect(iobox);
      }
    });

    setTimeout(() => {
      global.spiderman.systemlog.generateLog(6, 'domain worker-iobox connectIoboxes setInterval start');

      connectIoboxes();
    }, 15000);
  }

  function connect(io) {
    global.spiderman.systemlog.generateLog(5, `domain worker-iobox connect ${io.host}`);

    io.connecting = true;
    io.connected = false;

    const { host, port, timeout } = io;

    global.spiderman.tcpacxio.connect({
      host,
      port,
      timeout,
      onConnect: (client) => {
        ignoreConnectionLog = ignoreConnectionLog.filter((item) => item !== io.host);

        io.connecting = false;
        io.connected = true;

        const ioBox = {
          ...io,
          client,
        };

        global.spiderman.systemlog.generateLog(4, `domain worker-iobox onConnect ${io.host}`);

        allIoboxes = allIoboxes.filter((item) => (item ? item.host !== io.host : false));
        allIoboxes.push(ioBox);
      },
      onClose: () => {
        // console.log('onClose', host, port);

        if (ignoreConnectionLog.indexOf(io.host) < 0) {
          global.spiderman.systemlog.generateLog(2, `domain worker-iobox onClose ${io.host}`);
          ignoreConnectionLog.push(io.host);
        }

        const idx = allIoboxes.findIndex((item) => (item ? item.host === io.host : false));
        if (idx >= 0) {
          allIoboxes[idx].connecting = false;
          allIoboxes[idx].connected = false;
        }
      },
      onError: () => {
        if (ignoreConnectionLog.indexOf(io.host) < 0) {
          global.spiderman.systemlog.generateLog(2, `domain worker-iobox onError ${io.host}`);
          ignoreConnectionLog.push(io.host);
        }

        const idx = allIoboxes.findIndex((item) => (item ? item.host === io.host : false));
        if (idx >= 0) {
          allIoboxes[idx].connecting = false;
          allIoboxes[idx].connected = false;
        }
      },
      onTimeout: () => {
        if (ignoreConnectionLog.indexOf(io.host) < 0) {
          global.spiderman.systemlog.generateLog(2, `domain worker-iobox onTimeout ${io.host}`);
          ignoreConnectionLog.push(io.host);
        }

        const idx = allIoboxes.findIndex((item) => (item ? item.host === io.host : false));
        if (idx >= 0) {
          allIoboxes[idx].connected = false;
        }
      },
    });
  }

  function trigger({ action, data }) {
    try {
      global.spiderman.systemlog.generateLog(5, `domain worker-iobox trigger ${action.host} ${JSON.stringify(data).substring(0, 100)}`);
      const ioBox = allIoboxes.find((item) => (item ? item.host === action.host : false));

      if (ioBox) {
        if (ioBox.client && ioBox.iopoint) {
          ioBox.iopoint.forEach(async (iopoint) => {
            const { no, trigger: triggerStatus, delay: d } = iopoint;

            const command = generateCommand({ no, status: triggerStatus, delay: d });
            global.spiderman.systemlog.generateLog(4, `domain worker-iobox trigger host ${action.host} command ${command} `);

            send({ ioBox, command });
          });
        }
      }
    } catch (ex) {
      global.spiderman.systemlog.generateLog(2, `domain worker-iobox trigger host ${action.host} ${ex}`);
    }
  }

  function generateCommand({ no, status, delay = '' }) {
    status = status ? 1 : 0;
    if (!delay) return `AT+STACH${no}=${status}\n`;

    const ret = `AT+STACH${no}=${status},${delay}\n`;

    return ret;
  }

  function send({ ioBox, command }) {
    global.spiderman.systemlog.generateLog(4, `domain worker-iobox send command=${command}`);

    const buffer = Buffer.from(command, 'ascii');

    const sendOk = ioBox.client.write(buffer);

    if (sendOk === false) {
      const idx = allIoboxes.findIndex((item) => (item ? item.host === ioBox.host : false));
      if (idx >= 0) {
        allIoboxes[idx].connected = false;
      }
    }
  }

  return {
    init,
    trigger,
  };
};
