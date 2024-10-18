process.env.UV_THREADPOOL_SIZE = 128;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 引入 .env
require('dotenv').config();

// const parse = require('url');

const express = require('express');
const http = require('http');
const https = require('https');

const argObject = (() => {
  const result = {};

  process.argv.forEach((a, index) => {
    const isValid = index > 1;
    if (!isValid) return;

    const [key, value] = a.split('=');

    result[key] = value;
  });

  return result;
})();

global.params = generateParams(argObject);
function generateParams({
  fileroot = '/home/aira/product',
  httpEnable = true,
  httpport = 8086,
  httpsEnable = true,
  httpsport = 8446,
  systemservice = '127.0.0.1:8588',
  loglevel = 2,
  logreset = 0,
  prefix = 'airappe',
}) {
  if (process.env.NODE_ENV !== 'production') {
    systemservice = '192.168.10.122:8588';
    loglevel = 5;
  } else {
    loglevel = 4;
  }

  // 1. 'FATAL',
  // 2. 'ERROR',
  // 3. 'WARN',
  // 4. 'INFO',
  // 5. 'DEBUG',
  // 6. 'TRACE'

  if ([1, 2, 3, 4, 5, 6].indexOf(loglevel) <= -1) {
    loglevel = 2;
  }

  const dataPath = `${fileroot}/data`;
  const swPath = `${fileroot}/sw`;
  const fwPath = `${fileroot}/fw`;
  const importPath = `${fileroot}/import`;
  const devPath = `${fileroot}/middlewareServer-main/src`;

  return {
    fileroot,
    systemservice,
    dataPath,
    swPath,
    fwPath,
    devPath,
    importPath,
    httpEnable,
    httpport,
    httpsEnable,
    httpsport,
    loglevel,
    logreset,
    prefix,
  };
}

const spiderman = require('./spiderman/index');
const domain = require('./domain/index');
const runtimcache = require('./runtimcache/index');

global.spiderman = spiderman.init();

global.spiderman.systemlog.generateLog(4, `
  fileroot=${global.params.fileroot},
  systemservice=${global.params.systemservice},
  dataPath=${global.params.dataPath},
  swPath=${global.params.swPath},
  httpport=${global.params.httpport},
  httpsport=${global.params.httpsport},
  loglevel=${global.params.loglevel}`);

process.on('uncaughtException', (err) => {
  global.spiderman.systemlog.generateLog(2, `
    err=[${err.message}]
    err=[${err}]`);

  console.log('system UCE : ', err);
});

const expressApp = express()
  .use(express.json({ limit: '50mb' }))
  .use(express.text({ limit: '50mb' }))
  .use(global.spiderman.express.useFileUpload())
  .use(global.spiderman.express.useCors())
  .use(`/${global.params.prefix}`, require('./interface/api')(`/${global.params.prefix}`))
  // .use('/airaface', require('./interface/api')('/tablet'))
  .use('/system', require('./interface/api')('/system'))
  .use(express.static(`${global.params.swPath}/wwwdist`));

expressApp.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=300; includeSubDomains; preload');
  next();
});

// expressApp.get('*', (req, res, next) => {
//   // console.log('111', process.env.NODE_ENV, !req.secure);

//   if (process.env.NODE_ENV !== 'development' && !req.secure) {
//     // console.log('222', req.headers.host);

//     let hp = `${req.headers.host}:`;
//     hp = hp.split(':');

//     // console.log('333', `https://${hp[0]}:${global.params.httpsport}${req.url}`);

//     res.redirect(`https://${hp[0]}:${global.params.httpsport}${req.url}`);
//   } else {
//     next();
//   }
// });

global.spiderman.server = (() => {
  let httpServer = null;
  if (global.params.httpEnable) {
    httpServer = global.spiderman.express
      .createAndListenServer(http, global.params.httpport, expressApp, false);
  }

  let httpsServer = null;
  if (global.params.httpsEnable) {
    httpsServer = global.spiderman.express
      .createAndListenServer(https, global.params.httpsport, expressApp, true);
  }

  // const wsVerifyresults = global.spiderman.socket.create(
  //   { server: null, path: `/${global.params.prefix}/verifyresults`, noServer: true },
  // );

  // const wsRecognized = global.spiderman.socket.create(
  //   { server: null, path: '/fcsrecognizedresult', noServer: true },
  // );

  // const wsNonrecognized = global.spiderman.socket.create(
  //   { server: null, path: '/fcsnonrecognizedresult', noServer: true },
  // );

  // if (global.params.httpEnable) {
  //   httpServer.on('upgrade', (request, socket, head) => {
  //     const pathname = request.url;

  //     if (pathname === `/${global.params.prefix}/verifyresults`) {
  //       wsVerifyresults.handleUpgrade(request, socket, head, (ws) => {
  //         wsVerifyresults.emit('connection', ws, request);
  //       });
  //     } else if (pathname === '/fcsrecognizedresult') {
  //       wsRecognized.handleUpgrade(request, socket, head, (ws) => {
  //         wsRecognized.emit('connection', ws, request);
  //       });
  //     } else if (pathname === '/fcsnonrecognizedresult') {
  //       wsNonrecognized.handleUpgrade(request, socket, head, (ws) => {
  //         wsNonrecognized.emit('connection', ws, request);
  //       });
  //     } else {
  //       socket.destroy();
  //     }
  //   });
  // }

  // if (global.params.httpsEnable) {
  //   httpsServer.on('upgrade', (request, socket, head) => {
  //     const pathname = request.url;

  //     if (pathname === `/${global.params.prefix}/verifyresults`) {
  //         wsVerifyresults.handleUpgrade(request, socket, head, (ws) => {
  //         wsVerifyresults.emit('connection', ws, request);
  //       });
  //     } else if (pathname === '/fcsrecognizedresult') {
  //       wsRecognized.handleUpgrade(request, socket, head, (ws) => {
  //         wsRecognized.emit('connection', ws, request);
  //       });
  //     } else if (pathname === '/fcsnonrecognizedresult') {
  //       wsNonrecognized.handleUpgrade(request, socket, head, (ws) => {
  //         wsNonrecognized.emit('connection', ws, request);
  //       });
  //     } else {
  //       socket.destroy();
  //     }
  //   });
  // }

  return {
    http: httpServer,
    https: httpsServer,
    // wsVerifyresults,
    // wsRecognized,
    // wsNonrecognized,
  };
}
)();

global.domain = domain.init();
global.domain.initdb.init();
global.runtimcache = runtimcache.init();
require('./interface/init')();
