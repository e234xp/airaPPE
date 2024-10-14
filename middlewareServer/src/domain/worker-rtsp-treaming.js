module.exports = () => {
  let statusChecker = null;
  let allWiegandConverters = [];

  function init() {
    global.spiderman.systemlog.generateLog(4, 'domain worker-rtsp-treaming init');

    allWiegandConverters.forEach(({ client }) => {
      client.end();
    });
    allWiegandConverters = [];

    // global.spiderman.systemlog.generateLog(4, 'domain worker-wiegand init clearInterval');
    clearTimeout(statusChecker);
    statusChecker = null;

    statusChecker = setTimeout(() => {
      connectWiegandConverters();
    }, 1000);
  }

  function connectWiegandConverters() {
    clearTimeout(statusChecker);
    statusChecker = null;

    const wiegandConverters = global.spiderman.db.eventhandle.find({ action_type: 'wiegand' });

    wiegandConverters.forEach((w) => {
      const hostBox = allWiegandConverters.findIndex((item) => item.host === w.host);
      if (hostBox >= 0) {
        if ((allWiegandConverters[hostBox].connected === undefined)
          || (allWiegandConverters[hostBox].connected === false)) {
          // delete allWiegandConverters[hostBox];
          allWiegandConverters.splice(hostBox, 1);
          connect(w);
        }
      } else {
        connect(w);
      }
    });

    statusChecker = setTimeout(() => {
      // global.spiderman.systemlog.generateLog(4, 'domain worker-wiegand connectWiegandConverters setInterval start');

      connectWiegandConverters();
    }, 15000);
  }

  function connect(w) {
    global.spiderman.systemlog.generateLog(4, `domain worker-wiegand connect ${w.host}`);

    let intervalId;
    const { host, port } = w;

    global.spiderman.tcp.connect({
      host,
      port,
      onConnect: (client) => {
        w.connected = true;

        const wiegand = {
          ...w,
          client,
          sequence: 0,
          lastSendTimestamp: null,
        };
        allWiegandConverters.push(wiegand);

        send({ wiegand, isSendAlive: true });
        intervalId = setInterval(() => {
          send({ wiegand, isSendAlive: true });
        }, 8 * 1000);
      },
      onClose: (client) => {
        global.spiderman.systemlog.generateLog(4, `domain worker-wiegand onClose ${client.host}`);

        clearInterval(intervalId);

        w.connected = false;
      },
      onError: (client) => {
        global.spiderman.systemlog.generateLog(4, `domain worker-wiegand onError ${client.host}`);

        w.connected = false;
      },
      // onTimeout: (client) => {
      //   global.spiderman.systemlog.generateLog(4, `domain worker-wiegand onTimeout ${client.host}`);

      //   w.connected = false;
      // },
    });
  }

  function trigger({ action, data }) {
    global.spiderman.systemlog.generateLog(4, `domain worker-wiegand trigger ${action.host} ${data.card_number}`);

    const wiegand = allWiegandConverters.find((w) => w.host === action.host);

    let sendCardNumber = '';

    if (data.person) {
      sendCardNumber = data.person.card_facility_code + data.person.card_number;
    } else {
      sendCardNumber = action.special_card_number ? action.special_card_number : '';
    }

    // console.log('domain worker-wiegand trigger', sendCardNumber);

    if (!sendCardNumber) return;

    send({ wiegand, isSendAlive: false, cardNumber: sendCardNumber });
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
    global.spiderman.systemlog.generateLog(4, `domain worker-wiegand send ${wiegand.host} ${cardNumber}`);

    const now = Date.now();
    if (wiegand.lastSendTimestamp && now - wiegand.lastSendTimestamp < 1000) {
      setTimeout(() => {
        send({ wiegand, isSendAlive, cardNumber });
      }, 1 * 1000);
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

    try {
      const buffer = Buffer.from(command, 'ascii');
      wiegand.client.write(buffer);
      wiegand.lastSendTimestamp = Date.now();
      wiegand.sequence = getNextSequence(wiegand.sequence);
    } catch (ex) {
      global.spiderman.systemlog.generateLog(4, `domain worker-iobox send error ${ex}`);
    }
    // console.log('send', command);
  }

  return {
    init,
    trigger,
  };
};
