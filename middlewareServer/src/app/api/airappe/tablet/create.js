const fieldChecks = [
  {
    fieldName: 'name',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'identity',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'divice_groups',
    fieldType: 'array',
    required: true,
  },
  {
    fieldName: 'description',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'group_list_to_pass',
    fieldType: 'array',
    required: true,
  },
  {
    fieldName: 'verify_target_score',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'anti_spoofing_score',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'face_detection_score',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'april_tag_type',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'face_capture_interval',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'stranger_display_name',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'enable_name_mask',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'show_profile_photo',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'support_wiegand_bits',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'enable_trigger_relay',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'relay_start_power',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'relay_delay',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'relay_end_power',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'enable_id_card',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'enable_two_factor_authentication',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'high_temperature',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'low_temperature',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'enable_high_temperature_sound_alert',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'enable_high_temperature_trigger_relay',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'high_temperature_trigger_relay_start_power',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'high_temperature_trigger_relay_delay',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'high_temperature_trigger_relay_end_power',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'display_verify_result_time',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'target_face_size_width',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'target_face_size_height',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'enable_rtsp_camera',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'rtsp_username',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'rtsp_password',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'show_verify_indication',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'verify_indication_success_text',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'verify_indication_success_message_text',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'verify_indication_fail_text',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'verify_indication_fail_message_text',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'face_overlap_ratio',
    fieldType: 'number',
    required: true,
  },
  {
    fieldName: 'temperature_detection_is_must',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'indicator_message',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'qr_code_id',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'have_to_wear_face_mask',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'enable_clock_mode',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'enable_clock_function_1',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'enable_clock_function_2',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'enable_clock_function_3',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'enable_clock_function_4',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'clock_function_name_1',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'clock_function_name_2',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'clock_function_name_3',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'clock_function_name_4',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'clock_info_data_1',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'clock_info_data_2',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'clock_info_data_3',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'clock_indication_success_text',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'clock_success_message_text',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'clock_indication_fail_text',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'clock_fail_message_text',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'high_temperature_no_pass',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'high_temperature_alert_text',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'low_temperature_alert_text',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'temperature_unit_celsius',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'enable_contact_tracing_qr_code',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'contact_tracing_qr_code',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'health_statement',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'enable_pos_intergration',
    fieldType: 'boolean',
    required: true,
  },
  {
    fieldName: 'pos_brand',
    fieldType: 'string',
    required: true,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `tablet create ${JSON.stringify(data)}`);

  const cameras = global.domain.camera.count();
  const tablets = global.domain.tablet.count();

  try {
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

    let licAmount = 0;
    if (response) {
      const formalLic = response.license.filter((l) => l.permanent === true);

      if (formalLic.length >= 1) {
        for (let j = 0; j < formalLic.length; j += 1) {
          licAmount += (formalLic[j].channel_amount || 0);
        }
      } else {
        const trialLic = response.license.filter(
          (l) => l.permanent === false && l.trial_end_time >= new Date().toISOString(),
        );

        if (trialLic.length >= 1) {
          if (trialLic.length >= 2) {
            trialLic.sort((a, b) => b.activation_date - a.activation_date);
          }

          licAmount = trialLic[0].channel_amount;
        }
      }
    } else {
      global.spiderman.systemlog.writeError('license not found.');
      throw Error('license not found.');
    }

    if ((cameras + tablets) >= licAmount) {
      global.spiderman.systemlog.writeError(`limit of airaFace amount [ ${licAmount} ].`);
      throw Error(`limit of airaFace amount [ ${licAmount} ].`);
    }
  } catch (e) {
    global.spiderman.systemlog.writeError(`fatch license error. ${e}`);
    throw Error(`fatch license error. ${e}`);
  }

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  data.anti_spoofing_score = data.anti_spoofing_score ? data.anti_spoofing_score : 0.0;
  data.face_detection_score = data.face_detection_score ? data.face_detection_score : 0.5;
  data.april_tag_type = data.april_tag_type ? data.april_tag_type : '';

  await global.domain.tablet.create(data);

  global.spiderman.systemlog.generateLog(4, `tablet create ${data.name}`);

  return {
    message: 'ok',
    uuid: data.uuid,
    name: data.name,
  };
};
