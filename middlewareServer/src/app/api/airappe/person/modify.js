const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'data',
    fieldType: 'object',
    required: true,
  },
];

const fieldChecksData = [
  {
    fieldName: 'id',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'name',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'card_number',
    fieldType: 'string',
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
    fieldName: 'group_list',
    fieldType: 'array',
    required: false,
  },
  {
    fieldName: 'card_facility_code',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'as_admin',
    fieldType: 'boolean',
    required: false,
  },
  {
    fieldName: 'extra_info',
    fieldType: 'object',
    required: false,
  },

  {
    fieldName: 'plugin_info',
    fieldType: 'object',
    required: false,
  },
];

module.exports = async (rData) => {
  global.spiderman.systemlog.generateLog(4, `person modify ${rData}`);

  const { uuid } = global.spiderman.validate.data({
    data: rData,
    fieldChecks,
  });

  let data = global.spiderman.validate.data({
    data: rData.data,
    fieldChecks: fieldChecksData,
  });

  // 檢查 id 是否重複
  const existed = global.spiderman.db.person.findOne({
    id: data.id, uuid: { $ne: uuid },
  });
  if (existed) {
    global.spiderman.systemlog.writeError('Id existed.');
    throw Error('Id existed.');
  }

  // 至少讓 group_list 有 All Person
  if (!data.group_list.includes('All Person')) {
    data.group_list.push('All Person');
  }

  data = Object.entries(data)
    .filter(([key, value]) => value !== undefined)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

  let faceImage = '';
  let faceFeature = '';
  let upperFaceFeature = '';

  const dbPerson = global.spiderman.db.person.findOne({ uuid });

  if (dbPerson) {
    data = { ...dbPerson, ...data };
  }

  if (!data.register_image) {
    await global.domain.person.modify({ uuid, data });
  } else {
    const personFeature = await global.spiderman.facefeature.engineGenerate(data.register_image);

    if (personFeature) {
      faceImage = personFeature.face_image;
      faceFeature = personFeature.face_feature;
      upperFaceFeature = personFeature.upper_face_feature;
    }

    await global.domain.person.modify({
      uuid, data, faceImage, faceFeature, upperFaceFeature,
    });
  }

  global.spiderman.systemlog.generateLog(4, `person modify ${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    id: data.id,
    name: data.name,
  };
};
