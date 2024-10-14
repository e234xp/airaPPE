module.exports = () => {
  function create(data) {
    data = filterExistUuids(data);

    // global.domain.crud.insertOne({
    //   collection: 'rules',
    //   data,
    //   uniqueKeys: ['name'],
    // });
  }

  function modify(data) {
    data = filterExistUuids(data);

    const { uuid, ...others } = data;
    // global.domain.crud.modify({
    //   collection: 'rules',
    //   uuid,
    //   data: others,
    //   uniqueKeys: ['name'],
    // });
  }

  return {
    create,
    modify,
  };
};

function filterExistUuids(data) {
  const scheduleUuid = global.domain.crud.filterExistUuids({ collection: 'schedules', uuids: [data.condition.schedule] })[0];
  if (!scheduleUuid) {
    global.spiderman.systemlog.writeError('schedule not exist.');
    throw Error('schedule not exist');
  }

  data.condition.video_device_groups = global.domain.crud.filterExistUuids({ collection: 'videodevicegroups', uuids: data.condition.video_device_groups });
  if (data.condition.video_device_groups.length === 0) {
    global.spiderman.systemlog.writeError('video_device_groups not exist.');
    throw Error('video_device_groups not exist');
  }

  const ioboxUuidList = global.domain.crud.filterExistUuids({ collection: 'ioboxes', uuids: data.actions.ioboxes.map(({ uuid }) => uuid) });
  data.actions.ioboxes = data.actions.ioboxes
    .filter(({ uuid }) => ioboxUuidList.includes(uuid));

  const wiegandUuidList = global.domain.crud.filterExistUuids({ collection: 'wiegandconverters', uuids: data.actions.wiegand_converters.map(({ uuid }) => uuid) });
  data.actions.wiegand_converters = data.actions.wiegand_converters
    .filter(({ uuid }) => wiegandUuidList.includes(uuid));

  data.actions.line_commands = global.domain.crud.filterExistUuids({ collection: 'linecommands', uuids: data.actions.line_commands });

  data.actions.email_commands = global.domain.crud.filterExistUuids({ collection: 'emailcommands', uuids: data.actions.email_commands });

  data.actions.http_commands = global.domain.crud.filterExistUuids({ collection: 'httpcommands', uuids: data.actions.http_commands });

  return data;
}
