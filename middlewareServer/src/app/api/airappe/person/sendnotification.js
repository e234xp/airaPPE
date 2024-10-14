const fieldChecks = [
  {
    fieldName: 'sender',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'subject',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'to',
    fieldType: 'array',
    required: true,
  },
  {
    fieldName: 'cc',
    fieldType: 'array',
    required: false,
  },
  {
    fieldName: 'bcc',
    fieldType: 'array',
    required: false,
  },
  {
    fieldName: 'body',
    fieldType: 'string',
    required: true,
  },
  {
    fieldName: 'attach',
    fieldType: 'string',
    required: true,
  },
];

module.exports = (data) => {
  global.spiderman.systemlog.generateLog(4, `person sendnotification ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const settings = global.spiderman.db.system_settings.find();

  if (!settings) {
    global.spiderman.systemlog.writeError('smtp setting not existed.');
    throw Error('smtp setting not existed.');
  } else if (!settings.smtp) {
    global.spiderman.systemlog.writeError('smtp setting not existed.');
    throw Error('smtp setting not existed.');
  } else {
    const sendConfig = {
      host: settings.smtp.host,
      port: settings.smtp.port,
      security: settings.smtp.secure,
      email: settings.smtp.user,
      password: settings.smtp.pass,

      sender: data.sender || settings.smtp.from,
      subject: data.subject,

      to: data.to,
      cc: data.cc,
      bcc: data.bcc,

      body: data.body,
    };

    if (data.attach) {
      sendConfig.images = [data.attach];
    }

    global.spiderman.mailer.send(sendConfig);

    return {
      message: 'ok',
    };
  }
};
