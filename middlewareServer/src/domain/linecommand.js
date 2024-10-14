module.exports = () => {
  function remove(data) {
    global.spiderman.systemlog.generateLog(4, `domain linecommand remove ${JSON.stringify(data)}`);

    // 如果在 collection 的 filed 當中有傳入的 uuids，就把他們去除
    // global.domain.crud.handleRelatedUuids({
    //   collection: 'rules',
    //   field: 'actions.line_commands',
    //   uuids: data.uuid,
    // });

    global.domain.crud.remove({
      collection: 'linecommands',
      uuid: data.uuid,
    });
  }

  return {
    remove,
  };
};
