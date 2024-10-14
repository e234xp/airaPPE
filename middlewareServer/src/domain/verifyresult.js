module.exports = () => {
  function queryResults({
    collection, startTime, endTime, query,
  }) {
    global.spiderman.systemlog.generateLog(4, `domain verifyresult queryResults ${collection} ${startTime} ${endTime} ${query}`);

    const collections = [
      'personverifyresult',
      'visitorverifyresult',
      'nonverifyresult',
      'manualverifyresult',
    ];
    if (!collection || !collections.includes(collection)) {
      global.spiderman.systemlog.generateLog(2, `verifyresult queryResults ${collection} ${startTime} ${endTime} ${query} Unknown collection`);
      throw Error('Unknown collection');
    }

    const resultList = global.spiderman.db[collection]
      .find({
        startTime,
        endTime,
        query,
      });

    return resultList;
  }

  function fetchPhoto({ uuid, f }) {
    global.spiderman.systemlog.generateLog(4, `domain verifyresult fetchPhoto ${uuid} ${f}`);

    const collection = (() => {
      const [type] = f.split('_');
      const typeToCollection = {
        pvr: 'personverifyresultphoto',
        vvr: 'visitorverifyresultphoto',
        nvr: 'nonverifyresultphoto',
      };

      return typeToCollection[type];
    })();

    if (!collection) {
      global.spiderman.systemlog.generateLog(2, 'verifyresult queryResults System: unknown photo type');
      throw Error('System: unknown photo type');
    }

    return global.spiderman.db[collection].findOne(`${f}.db_photos/${uuid}.photo`);
  }

  async function addcommands({
    records, commands,
  }) {
    // console.log('000', records, commands);
    global.spiderman.systemlog.generateLog(4, `domain verifyresult addcommands ${commands}`);

    for (let i = 0; i < records.length; i += 1) {
      const rec = records[i];

      const verifyUuid = rec.verify_uuid;
      const startTime = +rec.timestamp - 1;
      const endTime = +rec.timestamp + 1;
      const vidList = [verifyUuid];

      // console.log('111', verifyUuid, startTime, endTime);

      let resultList = queryResults(
        {
          collection: 'personverifyresult',
          startTime,
          endTime,
          query: {
            ...vidList ? { verify_uuid: { $in: vidList } } : {},
          },
        },
      );
      // console.log('222', resultList.length);

      if (resultList.length >= 1) {
        global.spiderman.db.personverifyresult
          .updateCommands(startTime, endTime, verifyUuid, commands);
      } else {
        resultList = queryResults(
          {
            collection: 'visitorverifyresult',
            startTime: +rec.timestamp - 1,
            endTime: +rec.timestamp + 1,
            query: {
              ...vidList ? { verify_uuid: { $in: vidList } } : {},
            },
          },
        );
        // console.log('333', resultList.length);

        if (resultList.length >= 1) {
          global.spiderman.db.visitorverifyresult
            .updateCommands(startTime, endTime, verifyUuid, commands);
        } else {
          resultList = queryResults(
            {
              collection: 'nonverifyresult',
              startTime: +rec.timestamp - 1,
              endTime: +rec.timestamp + 1,
              query: {
                ...vidList ? { verify_uuid: { $in: vidList } } : {},
              },
            },
          );
          // console.log('444', resultList.length);

          if (resultList.length >= 1) {
            global.spiderman.db.nonverifyresult
              .updateCommands(startTime, endTime, verifyUuid, commands);
          }
        }
      }
    }
  }

  return {
    queryResults,
    fetchPhoto,
    addcommands,
  };
};
