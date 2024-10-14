const fieldChecks = [
  {
    fieldName: 'client_id',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'device_uuid',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'ip_address',
    fieldType: 'nonempty',
    required: true,
  },
];

module.exports = async (data) => {
  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  global.runtimcache.tabletsStatus.filter((t) => t.timestamp <= Date.now() - 35000);

  const sessionId = (() => {
    const account = global.spiderman.db.account.findOne({ username: 'Admin', password: '123456' });
    if (!account) {
      global.spiderman.systemlog.writeError('Unauthorized');
      throw Error('Unauthorized');
    }

    const { username, password, permission } = account;
    return global.spiderman.token.encryptFromAccount({
      u: username,
      p: password,
      t: Date.now(),
      x: permission,
    });
  })();

  // console.log('checkin', data);

  const record = await global.spiderman.db.tablets.findOne({
    identity: data.client_id,
  });

  if (record) {
    if (record.code !== undefined && record.code !== '') {
      if (record.code !== data.device_uuid) {
        global.spiderman.systemlog.writeError('Item not found.');
        throw Error('Device UUID not found.');
      }
    }
  } else {
    global.spiderman.systemlog.writeError('Item not found.');
    throw Error('Identity not found. ');
  }

  global.spiderman.db.tablets.updateOne(
    { identity: data.client_id },
    { code: data.device_uuid, ip_address: data.ip_address },
  );

  const tablet = global.spiderman.db.tablets.findOne({
    identity: data.client_id,
    code: data.device_uuid,
    ip_address: data.ip_address,
  });

  // for airaface 1.0 format validation
  tablet.objectId = tablet.uuid;
  tablet.device_uuid = tablet.code;
  tablet.client_id = tablet.identity;
  tablet.location = tablet.name;

  tablet.createdAt = new Date(tablet.created_time);
  tablet.updatedAt = new Date(tablet.updated_time);

  // xs must have this tag
  tablet.anti_spoofing_score = 0.1;

  const cardNos = (() => {
    const groupNames = global.spiderman.db.groups
      .find({ uuid: { $in: tablet.group_list_to_pass } })
      .map((group) => group.name);

    const personCardNumbers = global.spiderman.db.person
      .find({ group_list: { $some: groupNames } })
      .map(({ card_number: cardNumber }) => (cardNumber));

    const visitorCardNumbers = global.spiderman.db.visitor
      .find({ group_list: { $some: groupNames } })
      .map(({ card_number: cardNumber }) => (cardNumber));

    return [
      ...personCardNumbers,
      ...visitorCardNumbers,
    ];
  })();

  const { sync_timezone: syncTimeZone, sync_time: syncTime } = await (async () => {
    const { time_zone: timeZone, timestamp } = await global.spiderman.request.make({
      url: `http://${global.params.localhost}/system/timeinfo`,
      method: 'POST',
      pool: { maxSockets: 10 },
      time: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      json: data,
    });
    // console.log('timeZone', timeZone);
    return {
      // sync_timezone: timeZone,
      sync_timezone: 'Asia/Taipei',
      sync_time: Math.floor(timestamp / 1000),
    };
  })();

  const idx = global.runtimcache.tabletsStatus.findIndex((t) => t.uuid === tablet.uuid);
  if (idx === -1) {
    global.runtimcache.tabletsStatus.push({
      uuid: tablet.uuid,
      alive: true,
      timestamp: Date.now(),
    });
  } else {
    global.runtimcache.tabletsStatus[idx].alive = true;
    global.runtimcache.tabletsStatus[idx].timestamp = Date.now();
  }

  // console.log('checkin tabletsStatus', global.runtimcache.tabletsStatus);

  const respose = {
    sync_timezone: syncTimeZone,
    sync_time: syncTime,
    sessionId,
    cardNos,
    ...tablet,
  };

  // const respose = {
  //   objectId: 'AZMYl9DH8F',
  //   group_list_to_pass: [],
  //   description: '',
  //   ip_address: '192.168.10.32',
  //   verify_target_score: 0.9,
  //   face_capture_interval: 1000,
  //   stranger_display_name: '歡迎光臨',
  //   enable_name_mask: false,
  //   show_profile_photo: true,
  //   support_wiegand_bits: 34,
  //   enable_trigger_relay: true,
  //   relay_start_power: 1,
  //   relay_delay: 3000,
  //   relay_end_power: 0,
  //   enable_id_card: true,
  //   enable_two_factor_authentication: false,
  //   high_temperature: 37.5,
  //   low_temperature: 34,
  //   enable_high_temperature_sound_alert: true,
  //   enable_high_temperature_trigger_relay: false,
  //   high_temperature_trigger_relay_start_power: 1,
  //   high_temperature_trigger_relay_delay: 3000,
  //   high_temperature_trigger_relay_end_power: 0,
  //   display_verify_result_time: 2000,
  //   target_face_size_width: 200,
  //   target_face_size_height: 200,
  //   enable_rtsp_camera: true,
  //   rtsp_username: 'root',
  //   rtsp_password: 'pass',
  //   show_verify_indication: true,
  //   verify_indication_success_text: '辨識成功',
  //   verify_indication_success_message_text: '請通行',
  //   verify_indication_fail_text: '辨識失敗',
  //   verify_indication_fail_message_text: '請洽服務人員',
  //   face_overlap_ratio: 0.5,
  //   temperature_detection_is_must: true,
  //   indicator_message: '請露出額頭以便測量體溫',
  //   qr_code_id: '',
  //   have_to_wear_face_mask: false,
  //   enable_clock_mode: false,
  //   enable_clock_function_1: true,
  //   enable_clock_function_2: true,
  //   enable_clock_function_3: false,
  //   enable_clock_function_4: false,
  //   clock_function_name_1: '上班',
  //   clock_function_name_2: '下班',
  //   clock_function_name_3: '休息開始',
  //   clock_function_name_4: '休息結束',
  //   clock_info_data_1: '美好的一天',
  //   clock_info_data_2: '你好',
  //   clock_info_data_3: '請選擇打卡功能',
  //   clock_indication_success_text: '辨識成功',
  //   clock_success_message_text: '打卡成功',
  //   clock_indication_fail_text: '辨識失敗',
  //   clock_fail_message_text: '請重新打卡',
  //   high_temperature_no_pass: true,
  //   high_temperature_alert_text: '溫度過高請勿進入',
  //   low_temperature_alert_text: '溫度過低, 請露出額頭測量',
  //   temperature_unit_celsius: true,
  //   enable_contact_tracing_qr_code: false,
  //   contact_tracing_qr_code: '',
  //   health_statement: false,
  //   createdAt: '2023-07-21T01:12:17.547Z',
  //   updatedAt: '2023-12-27T10:09:22.177Z',
  //   sessionId,
  //   device_uuid: 'b3e0194869388b05',
  //   enable_pos_intergration: false,
  //   pos_brand: '',
  //   client_id: 'Tablet-01',
  //   location: 'Tablet-01-name',
  //   sync_timezone: 'Asia/Taipei',
  //   // sync_timezone: syncTimeZone,
  //   sync_time: syncTime,
  //   cardNos: [],
  // };

  // console.log('checkin response', respose);

  return respose;
};
