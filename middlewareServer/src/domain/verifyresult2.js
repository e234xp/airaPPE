const fs = require('fs');

module.exports = () => {
  async function queryResults({
    collection, startTime, endTime, slice_shift: sliceShift, slice_length: sliceLength, query,
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

    const resultPath = `${global.params.dataPath}/${collection}/`;

    const resultList = await new Promise((resolve) => {
      let timedRecords = [];

      fs.readdir(resultPath, async (err, files) => {
        if (!err) {
          const sortedFiles = files.sort();

          sortedFiles.forEach(async (file) => {
            // pvr_1710374400000_1710460799999.db
            // vvr_1710979200000_1711065599999.db
            // mvr_1715126400000_1715212799999.db

            const mainOfStr = file.split('.');
            if (mainOfStr.length === 2 && mainOfStr[1] === 'db') {
              const partsOfStr = mainOfStr[0].split('_');
              if (partsOfStr.length === 3) {
                if (
                  (startTime >= partsOfStr[1] && startTime <= partsOfStr[2])
                  || (endTime >= partsOfStr[1] && endTime <= partsOfStr[2])
                  || (startTime >= partsOfStr[1] && endTime <= partsOfStr[2])
                ) {
                  // partial file
                  try {
                    let dbData = JSON.parse(`[{}${fs.readFileSync(resultPath + file).toString('utf8')}]`);

                    let dataSet = dbData.filter(
                      (item) => item.timestamp < endTime + 1 && item.timestamp > startTime - 1,
                    );

                    if (dataSet.length > 0) {
                      // {
                      //   source_id: 'ae305064-c569-4ecd-af13-8eb7dd379e11',
                      //   verify_uuid: 'e0ac121c-e926-4dad-8e1e-b2e9b4bdd44c',
                      //   target_score: 0.85,
                      //   timestamp: 1710313144754,
                      //   high_temperature: false,
                      //   temperature: 0,
                      //   verify_mode: 0,
                      //   verify_mode_string: 'NONE',
                      //   verify_score: 0.8547855615615845,
                      //   uuid: '3d5e1549-01e3-409c-a84f-077bd2675c6e',
                      //   id: 'A-010',
                      //   name: 'Cindy',
                      //   card_facility_code: '',
                      //   card_number: '',
                      //   group_list: '["employee","All Person"]'
                      // }

                      dataSet.sort((a, b) => a.timestamp - b.timestamp);
                      this.keys = {};
                      let uniFirst = dataSet.filter((a) => {
                        const key = `${a.id}|${a.verify_mode}`;
                        if (!this.keys[key]) {
                          this.keys[key] = true;
                          return true;
                        }
                        return false;
                      });
                      uniFirst = uniFirst.map((i) => ({
                        ...i,
                        face_image_id: {
                          f: `${mainOfStr[0]}`,
                          uuid: i.verify_uuid,
                        },
                      }));

                      timedRecords = timedRecords.concat(uniFirst);

                      dataSet.sort((a, b) => b.timestamp - a.timestamp);
                      this.keys = {};
                      let uniLast = dataSet.filter((a) => {
                        const key = `${a.id}|${a.verify_mode}`;
                        if (!this.keys[key]) {
                          this.keys[key] = true;
                          return true;
                        }
                        return false;
                      });

                      uniLast = uniLast.map((i) => ({
                        ...i,
                        face_image_id: {
                          f: `${mainOfStr[0]}`,
                          uuid: i.verify_uuid,
                        },
                      }));

                      timedRecords = timedRecords.concat(uniLast);
                    }

                    dataSet = null;
                    dbData = null;
                  } catch (ex) { console.log('queryResults', ex); }
                } else if (
                  (startTime <= partsOfStr[1] && endTime >= partsOfStr[2])
                ) {
                  // full file
                  let dbData = JSON.parse(`[{}${fs.readFileSync(resultPath + file).toString('utf8')}]`);

                  let dataSet = [];
                  if (dbData.length >= 1) {
                    dataSet = dbData.slice(1);
                  }

                  if (dataSet.length > 0) {
                    dataSet.sort((a, b) => a.timestamp - b.timestamp);
                    this.keys = {};
                    let uniFirst = dataSet.filter((a) => {
                      const key = `${a.id}|${a.verify_mode}`;
                      if (!this.keys[key]) {
                        this.keys[key] = true;
                        return true;
                      }
                      return false;
                    });

                    uniFirst = uniFirst.map((i) => ({
                      ...i,
                      face_image_id: {
                        f: `${mainOfStr[0]}`,
                        uuid: i.verify_uuid,
                      },
                    }));

                    timedRecords = timedRecords.concat(uniFirst);

                    dataSet.sort((a, b) => b.timestamp - a.timestamp);
                    this.keys = {};
                    let uniLast = dataSet.filter((a) => {
                      const key = `${a.id}|${a.verify_mode}`;
                      if (!this.keys[key]) {
                        this.keys[key] = true;
                        return true;
                      }
                      return false;
                    });

                    uniLast = uniLast.map((i) => ({
                      ...i,
                      face_image_id: {
                        f: `${mainOfStr[0]}`,
                        uuid: i.verify_uuid,
                      },
                    }));

                    timedRecords = timedRecords.concat(uniLast);
                  }

                  dataSet = null;
                  dbData = null;
                }
              }
            }
          });
        }

        resolve(timedRecords);
      });
    });

    return resultList;
  }

  return {
    queryResults,
  };
};
