module.exports = () => {
  const eventLastTrigger = [];

  function init() {
    global.spiderman.systemlog.generateLog(4, 'domain worker-result init port 9000');

    const receivePort = 9001;

    const server = global.spiderman.udp.create();

    server.on('listening', () => {
      const address = server.address();
      global.spiderman.systemlog.generateLog(4, `domain worker-result listening ${address.address}:${address.port}`);
    });

    server.on('message', (message, rinfo) => {
      try {
        // console.log('==============================================================');
        // console.log(`message from enginee ${rinfo.address} ${rinfo.port}`);
        global.spiderman.systemlog.generateLog(5, `domain worker-result message ${rinfo.address}`);

        message = message.toString('utf8');

        let data = {};
        try {
          data = JSON.parse(message);
        } catch (ex) {
          global.spiderman.systemlog.generateLog(2, `domain worker-result message ${ex}`);
        }

        console.log('worker-mediaConnector', data);

        const device = global.spiderman.db.cameras.findOne({ uuid: data.source_uuid });
        if (device) data.source = device;

        triggerByResult(data);
      } catch (e) {
        global.spiderman.systemlog.generateLog(2, `domain worker-result triggerByResult ${e}`);
      }
    });

    server.bind(receivePort);
  }

  function triggerByResult(data) {
    global.spiderman.systemlog.generateLog(5, `domain worker-result triggerByResult source_id=${data.source_id} verify_uuid=${data.verify_uuid}`);

    const rules = generateRules(data);

    if (rules.length === 0) return;

    triggerActions({ actions: rules, data });
  }

  function triggerActions({ actions, data }) {
    actions.forEach((action) => {
      global.spiderman.systemlog.generateLog(5, `domain worker-result triggerActions action_type=${action.action_type} verify_uuid=${data.verify_uuid}`);

      switch (action.action_type) {
        case 'line':
          try {
            triggerLineCommands({ action, data });
          } catch (ex) {
            global.spiderman.systemlog.generateLog(2, `domain worker-result triggerActions action_type=${action.action_type} verify_uuid=${data.verify_uuid} ${ex.toString()}`);
          }
          break;
        case 'http':
          try {
            triggerHttpCommands({ action, data });
          } catch (ex) {
            global.spiderman.systemlog.generateLog(2, `domain worker-result triggerActions action_type=${action.action_type} verify_uuid=${data.verify_uuid} ${ex.toString()}`);
          }
          break;
        case 'mail':
          try {
            triggerEmailCommands({ action, data });
          } catch (ex) {
            global.spiderman.systemlog.generateLog(2, `domain worker-result triggerActions action_type=${action.action_type} verify_uuid=${data.verify_uuid} ${ex.toString()}`);
          }
          break;
        case 'wiegand':
          try {
            triggerWiegandConverters({ action, data });
          } catch (ex) {
            global.spiderman.systemlog.generateLog(2, `domain worker-result triggerActions action_type=${action.action_type} verify_uuid=${data.verify_uuid} ${ex.toString()}`);
          }
          break;
        case 'iobox':
          try {
            triggerIoboxes({ action, data });
          } catch (ex) {
            global.spiderman.systemlog.generateLog(2, `domain worker-result triggerActions action_type=${action.action_type} verify_uuid=${data.verify_uuid} ${ex.toString()}`);
          }
          break;
        default:

          break;
      }
    });
  }

  function generateRules(data) {
    const result = (() => {
      const eventhandle = global.spiderman.db.eventhandle.find();

      for (let i = 0; i < eventhandle.length; i += 1) {
        const elt = eventLastTrigger.find((s) => s.uuid === eventhandle[i].uuid);
        eventhandle[i] = { ...eventhandle[i], ...(elt || {}) };
      }

      console.log('aaa', eventhandle);

      const filterRules = global.spiderman._.flow([
        filterByEnabledRule, filterByDuration, filterByAlgorithm, filterBySchedule,
      ]);

      return filterRules({ eventhandle, data });
    })();

    return result.eventhandle;
  }

  function filterByEnabledRule({ eventhandle, data }) {
    if (eventhandle.length === 0) return { eventhandle, data };

    const cnt = eventhandle.filter((rule) => rule.enable === true).length;

    global.spiderman.systemlog.generateLog(4, `domain worker-result generateRules enable ${cnt}`);

    return {
      eventhandle: eventhandle.filter((rule) => rule.enable === true),
      data,
    };
  }

  function filterByDuration({ eventhandle, data }) {
    if (eventhandle.length === 0) return { eventhandle, data };
  }

  function filterByAlgorithm({ eventhandle, data }) {
    if (eventhandle.length === 0) return { eventhandle, data };
  }

  // function filterByDeviceGroups({ eventhandle, data }) {
  //   if (eventhandle.length === 0) return { eventhandle, data };

  //   // const device = camera || tablet;
  //   data.divice_groups = data.divice_groups || [];

  //   // global.spiderman.systemlog.generateLog(
  //   //   4,
  //   //   `domain worker-result filterByDeviceGroups divice_groups=${data.divice_groups}`,
  //   // );

  //   const retE = eventhandle.filter((rule) => {
  //     rule.divice_groups = rule.divice_groups || [];
  //     // console.log('filterByDeviceGroups', rule.divice_groups, data.divice_groups);
  //     const groups = data.divice_groups
  //       .some((group) => rule.divice_groups
  //         .includes(group));

  //     return groups;
  //   });

  //   global.spiderman.systemlog.generateLog(5, `domain worker-result filterByDeviceGroups actions=${retE.length}`);

  //   return {
  //     eventhandle: retE,
  //     data,
  //   };
  // }

  // function filterByPersonGroups({ eventhandle, data }) {
  //   if (eventhandle.length === 0) return { eventhandle, data };

  //   let passager = {};
  //   // console.log('filterByPersonGroups data', data);
  //   if (data.person) {
  //     passager = data.person;
  //   } else if (data.nearest_person) {
  //     passager = data.nearest_person.person_info;
  //   }

  //   passager.group_list = passager.group_list || [];

  //   // global.spiderman.systemlog.generateLog(
  //   //   4,
  //   //   `domain worker-result filterByPersonGroups group_list=${passager.group_list}`,
  //   // );

  //   const retE = eventhandle.filter((rule) => passager.group_list
  //     .some((group) => rule.group_list
  //       .includes(group)));

  //   global.spiderman.systemlog.generateLog(5, `domain worker-result filterByPersonGroups actions=${retE.length}`);

  //   return {
  //     eventhandle: retE,
  //     data,
  //   };
  // }

  function filterBySchedule({ eventhandle, data }) {
    if (eventhandle.length === 0) return { eventhandle, data };

    const { dayOfWeek, hour } = (() => {
      const now = global.spiderman.dayjs();
      const day = now.day(); // 0 (Sunday) to 6 (Saturday)

      return {
        date: now.format('YYYY-MM-DD'),
        timestamp: now - 0,
        // time: decimalTime,
        dayOfWeek: day,
        hour: now.hour(),
      };
    })();

    eventhandle = eventhandle.filter((handle) => {
      const { specify_time: specifyTime, weekly_schedule: weeklySchedule } = handle;

      let ret = false;
      if (specifyTime) {
        for (let i = 0; i < specifyTime.list.length; i += 1) {
          const specify = specifyTime.list[i];
          if ((data.timestamp - specify.start_time) * (data.timestamp - specify.end_time) < 0) {
            ret = true;
            break;
          }
        }
      }

      if (!ret && weeklySchedule) {
        for (let i = 0; i < weeklySchedule.list.length; i += 1) {
          const week = weeklySchedule.list[i];
          if (week.day_of_week === dayOfWeek) {
            if (week.hours_list.indexOf(hour) >= 0) {
              ret = true;
              break;
            }
          }
        }
      }

      return ret;
    });

    return {
      eventhandle,
      data,
    };
  }

  function triggerIoboxes({ action, data }) {
    global.domain.workerIobox.trigger({ action, data });
  }

  function triggerWiegandConverters({ action, data }) {
    global.domain.workerWiegand.trigger({ action, data });
  }

  function triggerLineCommands({ action, data }) {
    global.domain.triggerLineCommand.trigger({ action, data });
  }

  function triggerEmailCommands({ action, data }) {
    global.domain.triggerEmailCommand.trigger({ action, data });
  }

  function triggerHttpCommands({ action, data }) {
    global.domain.triggerHttpCommand.trigger({ action, data });
  }

  return {
    init,
    triggerByResult,
  };
};
