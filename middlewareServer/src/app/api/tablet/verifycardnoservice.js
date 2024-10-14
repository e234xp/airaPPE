const fieldChecks = [
  {
    fieldName: 'client_id',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'device_uuid',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'uuid',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'card_number',
    fieldType: 'nonempty',
    required: false,
  },
  {
    fieldName: 'timestamp',
    fieldType: 'number',
    required: false,
  },
];

module.exports = async (data) => {
  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  data.device_uuid = data.device_uuid ? data.device_uuid : '';
  data.uuid = data.uuid ? data.uuid : '';

  if (data.device_uuid === '' && data.uuid === '') {
    global.spiderman.systemlog.writeError('verifycardnoservice device_uuid and uuid is empty');
    throw Error('device_uuid or uuid cannot be empty.');
  }

  const verifyFaceId = await global.domain.tabletverify.verifyCard(data);

  // console.log('verifycardnoservice', { message: 'ok', verify_face_id: verifyFaceId });

  return {
    message: 'ok',
    verify_face_id: verifyFaceId,
  };
};
