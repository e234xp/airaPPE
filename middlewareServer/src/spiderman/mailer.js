const nodemailer = require('nodemailer');

module.exports = () => {
  function send({
    host, port, security, email, password, sender, subject,
    to, cc, bcc,
    body, images,
  }) {
    global.spiderman.systemlog.generateLog(4, `spiderman mailer send ${to} ${subject}`);

    const transporter = (() => {
      const config = {
        host,
        port, // 通常是465（SSL）或587（TLS）
        secure: security === 'SSL/TLS',
        requireTLS: security === 'TLS',
        auth: {
          user: email,
          pass: password,
        },
        tls: {
          rejectUnauthorized: false, // don't verify certificates
          ciphers: 'SSLv3',
        },
        debug: false, // show debug output
        logger: false, // log information in console
      };

      global.spiderman.systemlog.generateLog(5, `spiderman mailer send config ${config}`);

      return nodemailer.createTransport(config);
    })();

    const mailOptions = (() => {
      const attachments = images
        .map((image, index) => ({
          filename: `face-${index + 1}.png`,
          content: Buffer.from(image, 'base64'),
        }));

      return {
        headers: {
          'X-Spam-Flag': 'yes',
          'X-Spam-Level': '******',
          'X-GND-Spam-Score': '100',
          'X-GND-Status': 'SPAM',
        },
        from: `${sender} <${email}>`,
        subject,

        to,
        cc,
        bcc,

        text: body,
        attachments,
      };
    })();

    const result = new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          global.spiderman.systemlog.generateLog(2, `spiderman mailer sendMail ${error}`);
          // console.error('郵件發送失敗：', error);
          reject(error);
        } else {
          global.spiderman.systemlog.generateLog(5, `spiderman mailer sendMail ${info.response}`);
          // console.log('郵件已成功發送：', info.response);
          resolve(info.response);
        }
      });
    });

    global.spiderman.systemlog.generateLog(4, `spiderman mailer send ${to} ${subject} ${result}`);

    return result;
  }

  return {
    send,
  };
};
