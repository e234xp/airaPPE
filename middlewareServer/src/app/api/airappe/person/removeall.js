module.exports = () => {
  global.spiderman.systemlog.generateLog(4, 'person removeAll');

  global.domain.person.removeAll();

  return {
    message: 'ok',
  };
};
