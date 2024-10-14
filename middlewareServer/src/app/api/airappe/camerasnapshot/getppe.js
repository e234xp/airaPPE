const { uuid: uuidv4 } = require('uuidv4');

const fieldChecks = [
  {
    fieldName: 'ip',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'port',
    fieldType: 'port',
    required: true,
  },
  {
    fieldName: 'account',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'password',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'url',
    fieldType: 'string',
    required: false,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `camerasnapshot get url=[${data.ip} ${data.port} ${data.account} ${data.password} ${data.url}]`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const {
    ip, port, account, password, url,
  } = data;

  const uuid = uuidv4();

  let uri = 'rtsp://';
  if (account && password) {
    uri += `${encodeURI(account).replace(/@/g, '%40')}:${encodeURI(password).replace(/@/g, '%40')}@`;
  }

  uri += `${ip}:${port}`;

  if (url.substr(0) !== '/') uri += '/';

  uri += encodeURI(url).replace(/@/g, '%40');

  console.log('aaaa', uri);

  const base64 = await global.domain.cameraSnapShot.get({ url: uri, uuid });

  if (base64 === '') throw Error('domain camera-snap-shot command failed');

  global.spiderman.systemlog.generateLog(4, `camerasnapshot get url=[${data.url}] ok`);

  return {
    message: 'ok',
    base64,
  };
};
