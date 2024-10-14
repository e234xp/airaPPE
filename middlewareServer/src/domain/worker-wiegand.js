module.exports = () => {
  let allConverter = [];

  let ignoreConnectionLog = [];

  function init() {
    global.spiderman.systemlog.generateLog(4, 'domain worker-wiegand init');

    allConverter.forEach(({ client }) => {
      client.end();
    });
    allConverter = [];

    setTimeout(() => {
      global.spiderman.systemlog.generateLog(4, 'domain worker-wiegand connectWiegandConverters');
      connectWiegandConverters();
    }, 100);
  }

  function connectWiegandConverters() {
    global.spiderman.systemlog.generateLog(5, 'domain worker-wiegand connectWiegandConverters');

    const wiegandConverters = global.spiderman.db.eventhandle.find({ action_type: 'wiegand' });
    global.spiderman.systemlog.generateLog(5, `domain worker-wiegand wiegandConverters.length ${wiegandConverters.length}`);

    wiegandConverters.forEach((w) => {
      // w.timeout = 15000;
      const hostBox = allConverter.findIndex((item) => (item ? item.host === w.host : false));

      if (hostBox <= -1) {
        global.spiderman.systemlog.generateLog(4, `domain worker-wiegand connect ${w.host}`);
        connect(w);
      } else if (
        allConverter[hostBox].connecting !== true
        && allConverter[hostBox].connected !== true
      ) {
        allConverter.splice(hostBox, 1);

        global.spiderman.systemlog.generateLog(4, `domain worker-wiegand re-connect ${w.host}`);
        connect(w);
      }
    });

    setTimeout(() => {
      global.spiderman.systemlog.generateLog(6, 'domain worker-wiegand connectWiegandConverters setInterval start');

      connectWiegandConverters();
    }, 15000);
  }

  function connect(w) {
    global.spiderman.systemlog.generateLog(5, `domain worker-wiegand connect ${w.host}`);

    // let intervalId;
    w.connecting = true;
    w.connected = false;

    const { host, port, timeout } = w;

    global.spiderman.tcp.connect({
      host,
      port,
      timeout,
      onConnect: (client) => {
        ignoreConnectionLog = ignoreConnectionLog.filter((item) => item !== w.host);

        w.connecting = false;
        w.connected = true;

        const wiegand = {
          ...w,
          client,
          sequence: 0,
          lastSendTimestamp: null,
        };

        global.spiderman.systemlog.generateLog(4, `domain worker-wiegand onConnect ${w.host}`);

        allConverter = allConverter.filter((item) => (item ? item.host !== w.host : false));
        allConverter.push(wiegand);

        send({ wiegand, isSendAlive: true });
        // intervalId =
        setInterval(() => {
          send({ wiegand, isSendAlive: true });
        }, 5 * 1000);
      },
      onClose: () => {
        if (ignoreConnectionLog.indexOf(w.host) < 0) {
          global.spiderman.systemlog.generateLog(2, `domain worker-wiegand onClose ${w.host}`);
          ignoreConnectionLog.push(w.host);
        }

        const idx = allConverter.findIndex((item) => (item ? item.host === w.host : false));
        if (idx >= 0) {
          allConverter[idx].connecting = false;
          allConverter[idx].connected = false;
        }
      },
      onError: () => {
        if (ignoreConnectionLog.indexOf(w.host) < 0) {
          global.spiderman.systemlog.generateLog(2, `domain worker-wiegand onError ${w.host}`);
          ignoreConnectionLog.push(w.host);
        }

        const idx = allConverter.findIndex((item) => (item ? item.host === w.host : false));
        if (idx >= 0) {
          allConverter[idx].connecting = false;
          allConverter[idx].connected = false;
        }
      },
      onTimeout: () => {
        if (ignoreConnectionLog.indexOf(w.host) < 0) {
          global.spiderman.systemlog.generateLog(2, `domain worker-wiegand onTimeout ${w.host}`);
          ignoreConnectionLog.push(w.host);
        }

        const idx = allConverter.findIndex((item) => (item ? item.host === w.host : false));
        if (idx >= 0) {
          allConverter[idx].connected = false;
        }
      },
    });
  }

  function trigger({ action, data }) {
    try {
      global.spiderman.systemlog.generateLog(5, `domain worker-wiegand trigger ${action.host} ${JSON.stringify(data).substring(0, 100)}`);
      const wiegand = allConverter.find((item) => (item ? item.host === action.host : false));

      let sendCardNumber = '';

      if (data.person) {
        sendCardNumber = data.person.card_facility_code + data.person.card_number;
      } else {
        sendCardNumber = action.special_card_number ? action.special_card_number : '';
      }

      if ((sendCardNumber !== '') && (wiegand !== undefined)) {
        global.spiderman.systemlog.generateLog(4, `domain worker-wiegand trigger ${action.host} ${sendCardNumber}`);

        send({ wiegand, isSendAlive: false, cardNumber: sendCardNumber });
      }
    } catch (ex) {
      global.spiderman.systemlog.generateLog(2, `domain worker-wiegand trigger host ${action.host} ${ex}`);
    }
  }

  function generateCommand({
    sequence, bits, index, syscode, cardNumber,
  }) {
    const _sequence = sequence.toString().padStart(3, '0');
    const _bits = bits.toString().padStart(2, '0');
    const _index = index.toString().padStart(2, '0');
    const _syscode = syscode.toString().padStart(3, '0');
    const _cardno = cardNumber.toString().padStart(13, '0');

    return `${_sequence}Wiegand${_bits}${_index}${_syscode}${_cardno}`;
  }

  function generateAliveCommand(sequence) {
    const _sequence = sequence.toString().padStart(3, '0');

    return `${_sequence}Imalive`;
  }

  function getNextSequence(sequence) {
    if (sequence >= 255) {
      return 0;
    }

    return sequence + 1;
  }

  function send({ wiegand, isSendAlive = true, cardNumber }) {
    if (!isSendAlive) {
      global.spiderman.systemlog.generateLog(4, `domain worker-wiegand send ${wiegand.host} ${isSendAlive} ${cardNumber}`);
    }

    const now = Date.now();
    if (wiegand.lastSendTimestamp && now - wiegand.lastSendTimestamp < 1000) {
      setTimeout(() => {
        send({ wiegand, isSendAlive, cardNumber });
      }, 500);
      return;
    }

    const command = (() => {
      const {
        sequence, bits, index, syscode,
      } = wiegand;

      if (isSendAlive) return generateAliveCommand(sequence);
      return generateCommand({
        sequence, bits, index, syscode, cardNumber,
      });
    })();

    if (!isSendAlive) {
      global.spiderman.systemlog.generateLog(4, `domain worker-wiegand send command=${command}`);
    }

    const buffer = Buffer.from(command, 'ascii');

    const sendOk = wiegand.client.write(buffer);


    wiegand.lastSendTimestamp = Date.now();
    wiegand.sequence = getNextSequence(wiegand.sequence);
  }

  return {
    init,
    trigger,
  };
};
