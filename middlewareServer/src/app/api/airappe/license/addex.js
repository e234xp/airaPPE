const fieldChecks = [
  {
    fieldName: 'license_server_address',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'license_server_port',
    fieldType: 'number',
    required: false,
  },
  {
    fieldName: 'license_key',
    fieldType: 'string',
    required: true,
  },
];

module.exports = async (data) => {
  global.spiderman.systemlog.generateLog(4, `license add ${JSON.stringify(data)}`);

  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  data.license_server_address = 'license.aira.com.tw';
  data.license_server_port = 5168;

  const response = await global.spiderman.request.make({
    url: `http://${global.params.localhost}/system/addlicense`,
    method: 'POST',
    pool: { maxSockets: 10 },
    time: true,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    json: data,
  });

  global.spiderman.systemlog.generateLog(4, `license add ${JSON.stringify(response.body)}`);

  return response;
};
