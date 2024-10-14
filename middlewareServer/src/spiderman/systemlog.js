const dgram = require('dgram');

const client = dgram.createSocket('udp4');

module.exports = () => {
  //
  function writeTrace(logString) {
    const datetime = global.spiderman.dayjs(Date.now()).format('YYYY/MM/DD HH:mm:ss.SSS');
    setTimeout(() => {
      write({ logType: 'trace', datetime, logString });
    }, 50);
  }

  //
  function writeDebug(logString) {
    const datetime = global.spiderman.dayjs(Date.now()).format('YYYY/MM/DD HH:mm:ss.SSS');
    setTimeout(() => {
      write({ logType: 'debug', datetime, logString });
    }, 50);
  }

  //
  function writeInfo(logString) {
    const datetime = global.spiderman.dayjs(Date.now()).format('YYYY/MM/DD HH:mm:ss.SSS');
    setTimeout(() => {
      write({
        logType: 'info', datetime, logString,
      });
    }, 50);
  }

  //
  function writeWarn(logString) {
    const datetime = global.spiderman.dayjs(Date.now()).format('YYYY/MM/DD HH:mm:ss.SSS');
    setTimeout(() => {
      write({ logType: 'warn', datetime, logString });
    }, 50);
  }

  //
  function writeError(logString) {
    const datetime = global.spiderman.dayjs(Date.now()).format('YYYY/MM/DD HH:mm:ss.SSS');
    setTimeout(() => {
      write({ logType: 'error', datetime, logString });
    }, 50);
  }

  //
  function writeFaial(logString) {
    const datetime = global.spiderman.dayjs(Date.now()).format('YYYY/MM/DD HH:mm:ss.SSS');
    setTimeout(() => {
      write({ logType: 'faial', datetime, logString });
    }, 50);
  }

  function generateLog(logLevel, logString) {
    const { pid } = process;

    global.spiderman.systemlog.writeLog({
      logLevel, pid, logString,
    });
  }

  function writeLog({
    logLevel, pid, logString,
  }) {
    const datetime = global.spiderman.dayjs(Date.now()).format('YYYY/MM/DD HH:mm:ss.SSS');
    setTimeout(() => {
      writeEx({
        logLevel, pid, datetime, logString,
      });
    }, 50);
  }

  return {
    writeTrace,
    writeDebug,
    writeInfo,
    writeWarn,
    writeError,
    writeFaial,

    generateLog,
    writeLog,
  };
};

function writeEx({
  logLevel, pid, datetime, logString,
}) {
  logString = logString.substring(0, 250);

  if ((new Date() - 0) >= global.params.logreset) {
    global.params.loglevel = 4;
  }

  if (global.params.loglevel >= logLevel) {
    // const logType = ['', 'faial', 'error', 'warn', 'info', 'debug', 'trace'][logLevel];
    const logType = ['', 'error', 'error', 'warning', 'info', 'debug', 'debug'][logLevel];

    // return global.spiderman.request.make({
    //   url: `http://${global.params.localhost}/system/writelog`,
    //   method: 'POST',
    //   pool: { maxSockets: 10 },
    //   time: true,
    //   timeout: 3000,
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   json: {
    //     log_type: logType,
    //     log_string: logString,
    //     // log_string: {
    //     //   pid, datetime, logString,
    //     // },
    //   },
    // });

    const data = {
      log_type: logType,
      log_string: logString,
    };

    // console.log('systemlog', data);

    client.send(Buffer.from(JSON.stringify(data)), 8589, 'localhost');
  }

  return new Promise((resolve) => { resolve(null); });
}

function write({ logType, datetime, logString }) {
  logString = logString.substring(0, 250);

  // console.log(`log ${logType}: ${datetime}: ${logString}`);

  const data = {
    log_type: logType,
    log_string: logString,
  };

  client.send(Buffer.from(JSON.stringify(data)), 8589, 'localhost');

  // return global.spiderman.request.make({
  //   url: `http://${global.params.localhost}/system/writelog`,
  //   method: 'POST',
  //   pool: { maxSockets: 10 },
  //   time: true,
  //   timeout: 3000,
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   json: {
  //     log_type: logType,
  //     log_string: logString,
  //   },
  // });
}
