const fieldChecks = [
  {
    fieldName: 'uuid',
    fieldType: 'string',
    required: false,
  },
  {
    fieldName: 'keyword',
    fieldType: 'string',
    required: false,
  },
];

module.exports = async (data, token) => {
  global.spiderman.systemlog.generateLog(4, `account find ${JSON.stringify(data)}`);

  // paramters checker
  data = global.spiderman.validate.data({
    data,
    fieldChecks,
  });

  const { totalLength, result } = await global.domain.account.find({ data, token });

  const ret = {
    message: 'ok',
    total_length: totalLength,
    account_list: result,
  };

  global.spiderman.systemlog.generateLog(4, `account find total_length=[${totalLength}]`);
  return ret;
};
