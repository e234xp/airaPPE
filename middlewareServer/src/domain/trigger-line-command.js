const fs = require('fs');

module.exports = () => {
  const triggered = {};
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
    global.spiderman.systemlog.generateLog(5, `domain trigger-line-command trigger ${action.name}`);

    const triggeredKey = generateTriggeredKey({ data });
    if (triggered[triggeredKey]) return;

    const {
      token: accesstoken, data_list: fields, language, note,
    } = action;

    // console.log('language', language);

    let transform = {};
    try {
      transform = require(`./lang/${language}.json`);
    } catch (e) {
      transform = require('./lang/en.json');
    }

    const message = generateMessage({
      fields, note, transform, data,
    });

    const image = (() => {
      let ret = '';
      if (fields.display_image === 'captured') {
        ret = `${data.face_image}`;
      } else if (fields.display_image === 'display') {
        ret = readDisplayPhoto(data.person?.uuid ?? null);
      } else if (fields.display_image === 'register') {
        ret = readRegisterPhoto(data.person?.uuid ?? null);
      }
      return ret;
    })();

    const result = await global.spiderman.line.notify({ accesstoken, message, image });
    global.spiderman.systemlog.generateLog(5, `domain trigger-line-command result ${result}`);

    handleTriggeredKey(triggeredKey);
  }

  function generateTriggeredKey({ data }) {
    return `${data.source_id}-${data.verify_uuid}-${data.person?.uuid ?? 'stranger'}`;
  }

  function handleTriggeredKey(triggeredKey) {
    const COOL_DOWN_TIME = 60 * 1000;
    triggered[triggeredKey] = true;

    setTimeout(() => {
      delete triggered[triggeredKey];
    }, COOL_DOWN_TIME);
  }

  function generateMessage({
    fields, note, transform, data,
  }) {
    let message = '';
    let deviceinfo = { name: '' };

    Object.keys(fields).forEach((key1) => {
      switch (key1) {
        case 'foreHead_temperature':
          message += (`${transform.Temperature || 'Temperature'}: ${data[key1] || ''}\n`);
          break;
        case 'verified_timestamp':
          message += (`${transform.Timestamp || 'Timestamp'}: ${data.timestamp || ''}\n`);
          break;
        case 'verified_datetime':
          message += (`${transform.Datetime || 'Datetime'}: ${global.spiderman.dayjs(data.timestamp).format('YYYY/MM/DD HH:mm:ss') || ''}\n`);
          break;
        case 'source_id':
        case 'source_device_id':
          message += (`${transform.SourceDeviceId || 'SourceDeviceId'}: ${data.source_id || ''}\n`);
          break;
        case 'source_device':
          deviceinfo = global.domain.device.findByUuid(data.source_id);
          message += (`${transform.SourceDevice || 'SourceDevice'}: ${deviceinfo.name || ''}\n`);
          break;
        case 'person':
          Object.keys(fields[key1]).forEach((key2) => {
            switch (key2) {
              case 'card_number':
                message += (`${transform.CardNumber || 'Card Number'}: ${data[key1][key2] || ''}\n`);
                break;
              case 'department':
                message += (`${transform.Department || 'Department'}: ${data[key1][key2] || ''}\n`);
                break;
              case 'email':
                message += (`${transform.EmailAddress || 'Email Address'}: ${data[key1][key2] || ''}\n`);
                break;
              case 'extension_number':
                message += (`${transform.ExtensionNumber || 'Extension Number'}: ${data[key1][key2] || ''}\n`);
                break;
              case 'group_list':
                message += (`${transform.PersonGroup || 'Groups'}: ${data[key1][key2] || ''}\n`);
                break;
              case 'id':
                message += (`${transform.PersonId || 'Id'}: ${data[key1][key2] || ''}\n`);
                break;
              case 'name':
                message += (`${transform.PersonName || 'Fullname'}: ${data[key1][key2] || ''}\n`);
                break;
              case 'phone_number':
                message += (`${transform.PhoneNumber || 'Phone Number'}: ${data.person[key2] || ''}\n`);
                break;
              case 'remarks':
                message += (`${transform.Remarks || 'Remark'}: ${data[key1][key2] || ''}\n`);
                break;
              case 'title':
                message += (`${transform.JobTitle || 'Title'}: ${data[key1][key2] || ''}\n`);
                break;
              default:

                break;
            }
          });
          break;
        default:

          break;
      }
    });

    if (note) {
      message += `\n${note}`;
    }

    // console.log('trigger-line-command message', message);

    return message;
  }

  return {
    trigger,
  };
};
