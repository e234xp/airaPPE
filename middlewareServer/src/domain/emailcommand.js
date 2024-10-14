module.exports = () => {
  function create(data) {
    data = filterExistUuids(data);

    global.domain.crud.insertOne({
      collection: 'emailcommands',
      data,
      uniqueKeys: ['name'],
    });
  }

  function modify(data) {
    data = filterExistUuids(data);

    const { uuid, ...others } = data;
    global.domain.crud.modify({
      collection: 'emailcommands',
      uuid,
      data: others,
      uniqueKeys: ['name'],
    });
  }

  function remove(data) {
    // 如果在 collection 的 filed 當中有傳入的 uuids，就把他們去除
    // global.domain.crud.handleRelatedUuids({
    //   collection: 'rules',
    //   field: 'actions.email_commands',
    //   uuids: data.uuid,
    // });

    global.domain.crud.remove({
      collection: 'emailcommands',
      uuid: data.uuid,
    });
  }

  return {
    create,
    modify,
    remove,
  };
};

function filterExistUuids(data) {
  data.to = global.domain.crud.filterExistUuids({ collection: 'groups', uuids: data.to });

  data.cc = global.domain.crud.filterExistUuids({ collection: 'groups', uuids: data.cc });

  data.bcc = global.domain.crud.filterExistUuids({ collection: 'groups', uuids: data.bcc });

  return data;
}
