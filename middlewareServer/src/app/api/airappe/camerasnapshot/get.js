const fieldChecks = [
  {
    fieldName: 'url',
    fieldType: 'nonempty',
    required: true,
  },
  {
    fieldName: 'uuid',
    fieldType: 'nonempty',
    required: true,
  },

];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `camerasnapshot get url=[${data.url}]`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const { uuid } = data;
  let { url } = data;

  url = (`${url}`).trim();

  const base64 = await global.domain.cameraSnapShot.get({ url, uuid });

  if (base64 === '') throw Error('domain camera-snap-shot command failed');

  global.spiderman.systemlog.generateLog(4, `camerasnapshot get url=[${data.url}] ok`);

  return {
    message: 'ok',
    base64,
  };
};
