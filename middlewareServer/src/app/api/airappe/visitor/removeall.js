module.exports = () => {
  global.spiderman.systemlog.generateLog(4, 'visitor removeAll');

  global.domain.visitor.removeAll();

  return {
    message: 'ok',
  };
};
