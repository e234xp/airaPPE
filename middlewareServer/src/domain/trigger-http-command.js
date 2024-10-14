const fs = require('fs');

module.exports = () => {
  function readRegisterPhoto(uuid) {
    const dbPhotoFolder = `${global.params.dataPath}/db/dbPhoto/`;
    let photo = '';
    let registerPhotoFile = '';
    try {
      if (uuid) {
        registerPhotoFile = `${dbPhotoFolder}${uuid}.register`;
        photo = fs.readFileSync(registerPhotoFile).toString('utf8');
      }
    } catch (e) {
      global.spiderman.systemlog.generateLog(2, `readRegisterPhoto ${registerPhotoFile} ${e}`);
    }
    return photo;
  }

  function readDisplayPhoto(uuid) {
    const dbPhotoFolder = `${global.params.dataPath}/db/dbPhoto/`;
    let photo = '';
    let displayPhotoFile = '';
    try {
      if (uuid) {
        displayPhotoFile = `${dbPhotoFolder}${uuid}.display`;
        photo = fs.readFileSync(displayPhotoFile).toString('utf8');
      }
    } catch (e) {
      global.spiderman.systemlog.generateLog(2, `readDisplayPhoto ${displayPhotoFile} ${e}`);
    }
    return photo;
  }

  async function trigger({ action, data }) {
    global.spiderman.systemlog.generateLog(5, `domain trigger-http-command trigger ${action.host} ${action.port} ${action.url}`);

    const {
      https, method,
      user: username, pass: password,
      host, port,
      url: path,
      custom_data: fields,
      note,
    } = action;

    const { uri, body } = generateBody({
      path, fields, note, data,
    });

    const url = `${https ? 'https://' : 'http://'}${host}${port ? `:${port}` : ''}${method === 'GET' ? `${uri}` : ''}`;

    global.spiderman.systemlog.generateLog(5, `domain trigger-http-command trigger url ${url}`);
    global.spiderman.systemlog.generateLog(5, `domain trigger-http-command trigger body ${body}`);

    const requestConfig = {
      url,
      method,
      ...username && password
        ? {
          auth: {
            user: username,
            pass: password,
          },
        }
        : {},
      ...method === 'POST'
        ? {
          json: body,
        } : {
          qs: body,
        },
      timeout: 30000,
    };

    const result = await global.spiderman.request.make(requestConfig);
    // const result = {
    //   message: 'ok',
    // };

    global.spiderman.systemlog.generateLog(5, `domain trigger-http-command trigger ${JSON.stringify(result)}`);
  }

  function generateBody({
    path, fields, note, data,
  }) {
    let dataToParse = '';

    if (note.length > 0) {
      if (note[0] !== '&') note = `&${note}`;
      dataToParse = note;
    }

    const urlArray = path.split('?');
    const urlToQuery = urlArray.shift();

    urlArray.forEach((u) => {
      if (u.length > 0) {
        if (u.length > 0 && u[0] !== '&') u = `&${u}`;
        dataToParse = u + dataToParse;
      }
    });

    if (fields.length > 0) {
      fields = fields.replace(new RegExp(escapeRegExp('\n'), 'g'), '');
      fields = fields.replace(new RegExp(escapeRegExp('"'), 'g'), '');
      fields = fields.replace(new RegExp(escapeRegExp(','), 'g'), '&');
      fields = fields.replace(new RegExp(escapeRegExp(':'), 'g'), '=');

      if (fields[0] !== '&') fields = `&${fields}`;

      dataToParse += fields;
    }

    // let format = fields;
    const body = {};

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    function getPersonInfo(field) {
      let ret = '';

      if (data.person) {
        if (data.person[field]) { ret = data.person[field]; }
      } else if (data.nearest_person) {
        if (data.nearest_person.person_info) {
          if (data.nearest_person.person_info[field]) {
            ret = data.nearest_person.person_info[field];
          } else if (data.nearest_person.person_info.extra_info) {
            if (data.nearest_person.person_info.extra_info[field]) {
              ret = data.nearest_person.person_info.extra_info[field];
            }
          }
        }
      }

      return ret;
    }

    const dataArray = dataToParse.split('&');
    dataArray.forEach((d) => {
      const dArr = d.split('=');
      if (dArr.length === 2) {
        let key = dArr[0];
        let value = dArr[1];

        switch (value) {
          case '##VerifiedDatetime##':
            value = global.spiderman.dayjs(data.timestamp).format('YYYY/MM/DD HH:mm:ss');
            break;
          case '##VerifiedTimeStamp##':
            value = data.timestamp;
            break;
          case '##SourceDevice##': {
            const { name } = global.domain.device.findByUuid(data.source_id);
            value = name;
            break;
          }
          case '##SourceDeviceId##':
            value = data.source_id;
            break;
          case '##IsStranger##':
            value = data.is_stranger ? 'True' : 'False';
            break;
          case '##PersonId##':
            value = getPersonInfo('id');
            break;
          case '##PersonName##':
            value = getPersonInfo('name');
            break;
          case '##CardNumber##':
            value = getPersonInfo('card_number');
            break;
          case '##Group##':
            value = getPersonInfo('group_list');
            break;
          case '##JobTitle##':
            value = getPersonInfo('title');
            break;
          case '##Department##':
            value = getPersonInfo('department');
            break;
          case '##EmailAddress##':
            value = getPersonInfo('email');
            break;
          case '##PhoneNumber##':
            value = getPersonInfo('phone_number');
            break;
          case '##ExtensionNumber##':
            value = getPersonInfo('extension_number');
            break;
          case '##Remarks##':
            value = getPersonInfo('remarks');
            break;
          case '##Temperature##':
            value = data.foreHead_temperature ? '' : data.foreHead_temperature;
            break;
          case '##IsHighTemperature##':
            value = data.foreHead_temperature ? 'True' : 'False';
            break;
          case '##RegisterPhoto##':
            key = 'face_image';
            value = readRegisterPhoto(data.person?.uuid ?? null);
            break;
          case '##DisplayPhoto##':
            key = 'face_image';
            value = readDisplayPhoto(data.person?.uuid ?? null);
            break;
          case '##CapturedPhoto##':
            key = 'face_image';
            value = data.face_image;
            break;
          default:
        }

        body[key] = value;
      }
    });

    return { uri: urlToQuery, body };
  }

  return {
    trigger,
  };
};
