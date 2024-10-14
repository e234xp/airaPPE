const shell = require('shelljs');

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `restartservice ${JSON.stringify(data)}`);

  await new Promise((resolve) => {
    try {
      shell.exec('pidof dataService', { silent: true }, (code1, stdOut1, stdErr1) => {
        console.log('dataService', code1, stdOut1, stdErr1);
        const cmd = `kill -9 ${stdOut1}`;
        shell.exec(cmd, { silent: true }, (code2, stdOut2, stdErr2) => {
          console.log(code2, stdOut2, stdErr2);
          resolve();
        });
      });
    } catch (e) { resolve(); }
  });

  await new Promise((resolve) => {
    try {
      shell.exec('pidof sysServer', { silent: true }, (code1, stdOut1, stdErr1) => {
        console.log('sysServer', code1, stdOut1, stdErr1);
        const cmd = `kill -9 ${stdOut1}`;
        shell.exec(cmd, { silent: true }, (code2, stdOut2, stdErr2) => {
          console.log(code2, stdOut2, stdErr2);
          resolve();
        });
      });
    } catch (e) { resolve(); }
  });

  await new Promise((resolve) => {
    try {
      shell.exec('pidof mediaConnector', { silent: true }, (code1, stdOut1, stdErr1) => {
        console.log('mediaConnector', code1, stdOut1, stdErr1);
        const cmd = `kill -9 ${stdOut1}`;
        shell.exec(cmd, { silent: true }, (code2, stdOut2, stdErr2) => {
          console.log(code2, stdOut2, stdErr2);
          resolve();
        });
      });
    } catch (e) { resolve(); }
  });

  await new Promise((resolve) => {
    try {
      shell.exec('pidof node', { silent: true }, (code1, stdOut1, stdErr1) => {
        console.log('node', code1, stdOut1, stdErr1);
        const cmd = `kill -9 ${stdOut1}`;
        shell.exec(cmd, { silent: true }, (code2, stdOut2, stdErr2) => {
          console.log(code2, stdOut2, stdErr2);
          resolve();
        });
      });
    } catch (e) { resolve(); }
  });

  setTimeout(() => {
    try {
      shell.exec('pidof mainService', { silent: true }, (code1, stdOut1, stdErr1) => {
        console.log('mainService', code1, stdOut1, stdErr1);
        const cmd = `kill -9 ${stdOut1}`;
        shell.exec(cmd, { silent: true }, (code2, stdOut2, stdErr2) => {
          console.log(code2, stdOut2, stdErr2);
        });
      });
    } catch (e) { console.log(e); }
  }, 3000);

  const ret = {
    message: 'ok',
  };

  global.spiderman.systemlog.generateLog(4, `restartservice ${JSON.stringify(ret)}`);

  return ret;
};
