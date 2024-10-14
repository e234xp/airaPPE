const { uuid: uuidv4 } = require('uuidv4');

const fieldChecks = [
  {
    fieldName: 'id',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'name',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'card_facility_code',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'card_number',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'group_list',
    fieldType: 'array',
    required: false,
  },
  {
    fieldName: 'begin_date',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'expire_date',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'extra_info',
    fieldType: 'object',
    required: false,
  },
  {
    fieldName: 'display_image',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'register_image',
    fieldType: 'string',
    required: false,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `visitor create ${JSON.stringify(data)}`);

  data = {
    ...global.spiderman.validate.data({
      data,
      fieldChecks,
    }),
    as_admin: false,
  };

  // 檢查是否超過 License
  {
    const DEFAULT_MAX_AMOUNT_OF_PERSON = 10000;

    let personLen = 0;
    const people = global.spiderman.db.person.find();
    const visitor = global.spiderman.db.visitor.find();

    personLen += people.length;
    personLen += visitor.length;

    if (personLen >= DEFAULT_MAX_AMOUNT_OF_PERSON) {
      const response = await global.spiderman.request.make({
        url: `http://${global.params.localhost}/system/findlicense`,
        method: 'POST',
        pool: { maxSockets: 10 },
        time: true,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
        json: data,
      });

      let faceDbSize = DEFAULT_MAX_AMOUNT_OF_PERSON;
      if (response && response.license) {
        const DbSize = response.license.filter((l) => l.default_face_db_size !== undefined);

        DbSize.forEach((a) => {
          faceDbSize += a.default_face_db_size;
        });
      }

      if (personLen >= faceDbSize) {
        global.spiderman.systemlog.writeError(`Items in database has exceeded ${faceDbSize} (max).`);
        throw Error(`Items in database has exceeded ${faceDbSize} (max).`);
      }
    }
  }

  // 檢查 id 是否重複
  {
    const existed = global.spiderman.db.person.findOne({
      id: data.id,
    });
    if (existed) {
      global.spiderman.systemlog.writeError('Id existed.');
      throw Error('Id existed.');
    }
  }

  // 至少讓 group_list 有 All Person
  if (!data.group_list.includes('All Visitor')) {
    data.group_list.push('All Visitor');
  }

  let faceImage = '';
  let faceFeature = '';
  let upperFaceFeature = '';

  data.uuid = uuidv4();

  if (!data.register_image) {
    await global.domain.visitor.insert({ data });
  } else {
    const personFeature = await global.spiderman.facefeature.engineGenerate(data.register_image);

    if (personFeature) {
      faceImage = personFeature.face_image;
      faceFeature = personFeature.face_feature;
      upperFaceFeature = personFeature.upper_face_feature;
    }
    await global.domain.visitor.insert({
      data, faceImage, faceFeature, upperFaceFeature,
    });
  }

  global.spiderman.systemlog.generateLog(4, `visitor create ${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    id: data.id,
    name: data.name,
  };
};
