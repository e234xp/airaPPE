let lineImageRemaining = 1;
module.exports = () => {
  async function notify({ accesstoken, message, image }) {
    global.spiderman.systemlog.generateLog(4, `spiderman line notify ${message.substring(0, 50)}`);

    const formData = (() => {
      const retMessage = { message };

      if (lineImageRemaining > 0 && image && image.length > 0) {
        retMessage.imageFile = {
          value: Buffer.from(image, 'base64'),
          options: {
            filename: 'test.jpeg',
            contentType: 'image/jpeg',
          },
        };
      }

      return retMessage;
    })();

    const result = await global.spiderman.requestline.make({
      url: 'https://notify-api.line.me/api/notify',
      method: 'POST',
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${accesstoken}`,
        'Content-Type': 'multipart/form-data',
      },
      formData,
    });

    // const result = {
    //   message: 'ok',
    //   ImageRemaining: 20,
    // };

    if (result.status === 200) {
      lineImageRemaining = result.ImageRemaining;
    }

    return result;
  }

  return {
    notify,
  };
};
