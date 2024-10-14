// const fs = require('fs');
const { uuid: uuidv4 } = require('uuidv4');

module.exports = () => {
  const results = {};

  async function verifyFace(data) {
    global.spiderman.systemlog.generateLog(5, `domain tabletverify verifyFace ${JSON.stringify(data)}`);

    if (!data.verify_mode) data.verify_mode = 0;

    const {
      client_id: identity, device_uuid: code, uuid,
    } = data;
    let tablet = global.spiderman.db.tablets.findOne({ identity, code });
    if (!tablet) {
      tablet = global.spiderman.db.tablets.findOne({ identity, uuid });
      if (!tablet) {
        global.spiderman.systemlog.generateLog(2, `verifyFace ${identity} ${code} item not found`);
        throw Error(`verifyFace ${identity} ${code} item not found`);
      }
    }

    const { uuid: sourceId, verify_target_score: targetScore } = tablet;

    // if (!results[sourceId]) {
    const ret = await global.spiderman.request.make({
      url: `http://${global.params.localhost}/system/verifyface`,
      method: 'POST',
      pool: { maxSockets: 10 },
      time: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      json: {
        source_id: sourceId,
        target_score: targetScore,
        verify_mode: data.verify_mode,
        base64_image: data.face_image,
      },
    });

    delete results[sourceId];

    return ret.verify_uuid;
  }

  async function verifyCard(data) {
    global.spiderman.systemlog.generateLog(5, `domain tabletverify verifyCard ${JSON.stringify(data)}`);

    if (!data.verify_mode) data.verify_mode = 2;

    const {
      client_id: identity, device_uuid: code, uuid, card_number: cardNumber,
    } = data;
    let tablet = global.spiderman.db.tablets.findOne({ identity, code });
    if (!tablet) {
      tablet = global.spiderman.db.tablets.findOne({ identity, uuid });
      if (!tablet) {
        global.spiderman.systemlog.generateLog(2, `verifyCard ${identity} ${code} item not found`);
        throw Error(`verifyCard ${identity} ${code} item not found`);
      }
    }

    const { uuid: sourceId } = tablet;

    // if (!results[sourceId]) {
    const ret = await global.spiderman.request.make({
      url: `http://${global.params.localhost}/system/verifycard`,
      method: 'POST',
      pool: { maxSockets: 10 },
      time: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      json: {
        source_id: sourceId,
        source_uuid: sourceId,
        verify_mode: data.verify_mode,
        card_number: cardNumber,
      },
    });

    delete results[sourceId];

    return ret.verify_uuid;
  }

  // function readRegisterPhoto(uuid) {
  //   const dbPhotoFolder = `${global.params.dataPath}/db/dbPhoto/`;
  //   let photo = '';
  //   try {
  //     if (uuid) {
  //       const registerPhotoFile = `${dbPhotoFolder}${uuid}.register`;
  //       photo = fs.readFileSync(registerPhotoFile).toString('utf8');
  //     }
  //   } catch (e) {
  //     console.log('readRegisterPhoto', e);
  //   }
  //   return photo;
  // }

  // function readDisplayPhoto(uuid) {
  //   global.spiderman.systemlog.generateLog(4, `domain tabletverify readDisplayPhoto ${uuid}`);

  //   const dbPhotoFolder = `${global.params.dataPath}/db/dbPhoto/`;
  //   let photo = '';
  //   let displayPhotoFile = '';
  //   try {
  //     if (uuid) {
  //       displayPhotoFile = `${dbPhotoFolder}${uuid}.display`;
  //       photo = fs.readFileSync(displayPhotoFile).toString('utf8');
  //     }
  //   } catch (e) {
  //     global.spiderman.systemlog.writeError(`readDisplayPhoto ${displayPhotoFile} ${e}`);
  //     console.log('readDisplayPhoto', e);
  //   }
  //   return photo;
  // }

  function setResult(data) {
    const { verify_uuid: uuid } = data;

    try {
      results[uuid] = reconstructData(data);
    } catch (ex) {
      global.spiderman.systemlog.generateLog(2, `tabletverify setResult ${ex}`);
    }
  }

  function reconstructData(data) {
    let ret = {};

    ret._id = uuidv4();

    if (data.person) {
      ret.person_info = {
        fullname: data.person.name,
        employeeno: data.person.id,
        email_address: data.person.extra_info.email,
        group_list: [],
        department_list: [],
        cardno: data.person.extra_info.cardno || '',
        expiration_date: data.person.extra_info.expiration_date || '',
        organization: data.person.extra_info.organization || '',
        title: data.person.extra_info.title,
        mobile: data.person.extra_info.phone_number,
        headshot: '',
        relation_to: '',
        relation_to_name: '',
        relationship: '',
        encrypt: false,
      };

      if (data.person.group_list) {
        data.person.group_list.forEach((g) => {
          ret.person_info.group_list.push({ id: uuidv4(), groupname: g });
        });

        ret.groups = data.person.group_list;
      }

      if (data.person.department_list) {
        data.person.department_list.forEach((d) => {
          ret.person_info.department_list.push({ id: uuidv4(), name: d });
        });
      }

      ret.person_id = data.person.uuid;
    } else {
      ret.person = {
        group_list: [],
        department_list: [],
        headshot: '',
        relation_to: '',
        relation_to_name: '',
        relationship: '',
        encrypt: false,
      };

      if (data.nearest_person) {
        ret.person.fullname = data.nearest_person.person_info
          ? data.nearest_person.person_info.name
          : '';
        ret.person.employeeno = data.nearest_person.person_info
          ? data.nearest_person.person_info.id
          : '';
        ret.person.email_address = data.nearest_person.person_info
          ? data.nearest_person.person_info.email
          : '';
        ret.person.cardno = data.nearest_person.person_info
          ? data.nearest_person.person_info.cardno
          : '';
        ret.person.expiration_date = data.nearest_person.person_info
          ? data.nearest_person.person_info.expiration_date
          : 0;
        ret.person.organization = data.nearest_person.person_info
          ? data.nearest_person.person_info.organization
          : '';
        ret.person.title = data.nearest_person.person_info
          ? data.nearest_person.person_info.title
          : '';
        ret.person.mobile = data.nearest_person.person_info
          ? data.nearest_person.person_info.phone_number
          : '';

        if (data.nearest_person.person_info) {
          if (data.nearest_person.person_info.group_list) {
            data.nearest_person.person_info.group_list.forEach((g) => {
              ret.person.group_list.push({ id: uuidv4(), groupname: g });
            });

            ret.groups = data.nearest_person.person_info.group_list;
          }

          if (data.nearest_person.department_list) {
            data.nearest_person.department_list.forEach((d) => {
              ret.person.department_list.push({ id: uuidv4(), name: d });
            });
          }
          ret.person_id = data.nearest_person.person_info.uuid;
        }
      }
    }

    let score = 0.0;
    if (data.verify_score) {
      score = data.verify_score;
    }

    ret.merged = data.merged || false;
    ret.merged_verify_uuid = data.merged_verify_uuid || '';
    ret.non_action = data.non_action || true;
    ret.pos = data.pos || {};

    ret = {
      ...{
        type: data.person ? 1 : 0,
        // ackstatus: 0,
        // create_time: 0,
        // last_modify_time: 0,
        // last_recognized: {
        //   timestamp: 0,
        //   face_id_number: '',
        // },
        // _created_at: '',
        // _updated_at: '',
        score,
        // score: 0.9,
        target_score: data.target_score,
        snapshot: data.face_image,
        // snapshot: 'i1707117871252_9e95279228dd8683.jpg',
        // channel: data.source_id,
        // channel: 'Tablet-01',
        source_id: data.source_id,
        channel: data.channel,
        timestamp: data.timestamp,
        verify_face_id: data.verify_uuid,
        // action_enable: 1,
        clock_mode_function: 0,
        // request_client_param: 'fcs',
      },
      ...ret,
    };

    return ret;
  }

  function getResult(verifyUuid) {
    const result = results[verifyUuid];
    if (!result) {
      global.spiderman.systemlog.generateLog(2, `getResult ${verifyUuid} item not found.`);
      throw Error(`getResult ${verifyUuid} item not found.`);
    }

    return result;
  }

  return {
    verifyFace,
    verifyCard,
    setResult,
    getResult,
  };
};
