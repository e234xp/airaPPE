const fs = require('fs');
const jsonfile = require('jsonfile');
const _ = require('lodash');
const writeToFile = require('write-to-file');

module.exports = ({
  workingFolder,
  name,
  cache: { isOpen: isOpenCache = false, maxBytes: maxBytesCache = 0 },
}) => {
  const FOLIDER_PATH = `${workingFolder}/${name}`;
  if (!fs.existsSync(FOLIDER_PATH)) {
    fs.mkdirSync(FOLIDER_PATH);
  }
  //    cache 格式: file:time
  const cacheData = new Map();
  const cacheSizes = new Map();
  let cacheDataSize = 0;

  function setCache({ id, item }) {
    if (!isOpenCache) {
      return;
    }

    const cache = getCache(id);
    if (cache) {
      deleteCache(cache.key);
    }

    // 檢查 size 是否過大
    const size = global.spiderman.calculate.size(item);
    const isSetMax = maxBytesCache > 0;
    if (isSetMax && size > maxBytesCache) {
      return;
    }

    const now = Date.now();
    const key = `${id}:${now}`;
    cacheData.set(key, item);
    cacheSizes.set(key, size);
    cacheDataSize = sumMapValues(cacheSizes);

    // 讓 Cache 不要超過大小
    if (isSetMax) {
      while (cacheDataSize > maxBytesCache) {
        const oldestKey = getOldestCacheKey();
        if (!oldestKey) break;

        deleteCache(oldestKey);
        cacheDataSize = sumMapValues(cacheSizes);
      }
    }
  }

  function getCache(id) {
    if (!isOpenCache) {
      return null;
    }

    const entry = Array.from(cacheData.entries())
      .find(([key]) => key.startsWith(id));
    if (!entry) return null;
    const [key, value] = entry;

    return { key, value };
  }

  function deleteCache(key) {
    cacheData.delete(key);
    cacheSizes.delete(key);
  }

  function sumMapValues(map) {
    let sum = 0;
    map.forEach((value) => {
      sum += value;
    });
    return sum;
  }

  function getOldestCacheKey() {
    let oldestKey = null;
    let oldestTimestamp = Infinity;

    cacheSizes.forEach((value, key) => {
      const timestamp = Number(key.split(':')[1]);
      if (timestamp < oldestTimestamp) {
        oldestTimestamp = timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  function find({
    startTime, endTime, query = {},
  }) {
    const dir = fs.readdirSync(FOLIDER_PATH);

    const filterdFiles = dir.filter((file) => {
      const [fileName, type] = file.split('.');
      if (type !== 'db') return false;

      const [, fileStartTime, fileEndTime] = fileName.split('_');
      const v = (startTime <= fileStartTime && endTime >= fileEndTime)
        || (startTime >= fileStartTime && startTime <= fileEndTime)
        || (endTime >= fileStartTime && endTime <= fileEndTime);

      return v;
    });

    const allRecordsInFiles = filterdFiles.flatMap((file) => {
      const filePath = `${FOLIDER_PATH}/${file}`;
      const [fileName] = file.split('.');

      const item = (() => {
        let fileString = fs.readFileSync(filePath).toString('utf8');

        if (fileString[0] === ',') {
          fileString = fileString.substring(1);
        }

        if (fileString[0] !== '[') {
          fileString = `[${fileString}]`;
        }

        // systemlog will have bug with no comma
        fileString = fileString.replace(/}{/g, '},{');

        const fileArray = (() => {
          try {
            const result = JSON.parse(fileString);

            return result;
          } catch (e) {
            global.spiderman.systemlog.writeError(`error:${e}: ${filePath}`);

            return [];
          }
        })();

        return fileArray.map((i) => ({
          ...i,
          face_image_id: {
            f: `${fileName}`,
            uuid: i.verify_uuid,
          },
        }));
      })();

      const isCurrentFile = (() => {
        const now = Date.now();
        const [, fileStartTime, fileEndTime] = fileName.split('_');

        return now >= fileStartTime && now <= fileEndTime;
      })();
      if (!isCurrentFile) {
        setCache({ id: fileName, item });
      }

      return item;
    });

    const recordsInTimeRanges = allRecordsInFiles
      .filter(({ timestamp }) => startTime <= timestamp && endTime >= timestamp);

    const queriedRecords = Object.keys(query).length > 0
      ? global.spiderman.query({
        data: recordsInTimeRanges,
        queryObject: query,
      }).data
      : recordsInTimeRanges;

    return queriedRecords;
  }

  // 更新資料
  async function updateCommands(startTime, endTime, verifyUuid, commands) {
    const dir = fs.readdirSync(FOLIDER_PATH);

    const filterdFiles = dir.filter((file) => {
      const [fileName, type] = file.split('.');
      if (type !== 'db') return false;

      const [, fileStartTime, fileEndTime] = fileName.split('_');
      const v = (startTime <= fileStartTime && endTime >= fileEndTime)
        || (startTime >= fileStartTime && startTime <= fileEndTime)
        || (endTime >= fileStartTime && endTime <= fileEndTime);

      return v;
    });

    const allRecordsInFiles = filterdFiles.flatMap((file) => {
      const filePath = `${FOLIDER_PATH}/${file}`;

      // console.log('bbb', filePath);

      const [fileName] = file.split('.');

      const item = (() => {
        let fileString = fs.readFileSync(filePath).toString('utf8');
        if (fileString[0] === ',') {
          fileString = fileString.substring(1);
        }

        const fileArray = (() => {
          try {
            const result = JSON
              .parse(`[${fileString}]`);

            return result;
          } catch (e) {
            // console.log('ccc', filePath, e);
            global.spiderman.systemlog.writeError(`error:${e}: ${filePath}`);

            return [];
          }
        })();

        return fileArray.map((i) => ({
          ...i,
          face_image_id: {
            f: `${fileName}`,
            uuid: i.verify_uuid,
          },
        }));
      })();

      return item;
    });

    // console.log('ddd', allRecordsInFiles.length);
    const array = [];
    const record = {};

    for (let i = 0; i < allRecordsInFiles.length; i += 1) {
      if (allRecordsInFiles[i].verify_uuid === verifyUuid) {
        allRecordsInFiles[i].commands = commands;
      }
      array.push(allRecordsInFiles[i]);
    }

    let str = JSON.stringify(array);
    str = str.substring(1, str.length - 1);

    await writeToFile(`${FOLIDER_PATH}/${filterdFiles[0]}`, `,${str}`);
    return record;
  }

  function insertOne(data, cb) {
    try {
      const { timestamp } = data;

      const startTime = new Date(timestamp);
      startTime.setUTCHours(0, 0, 0, 0);
      const endTime = new Date(timestamp);
      endTime.setUTCHours(23, 59, 59, 999);
      const currentDbfileName = `${FOLIDER_PATH}/chg_${startTime.getTime()}_${endTime.getTime()}.db`;

      let readData = [];
      if (fs.existsSync(currentDbfileName)) {
        const file = jsonfile.readFileSync(currentDbfileName);
        readData = _.cloneDeep(file);
      }

      readData.push(data);

      jsonfile.writeFileSync(currentDbfileName, readData, { spaces: 2 });
    } catch (e) {
      console.log(e);
    }

    if (cb) cb();

    return true;
  }

  function queryResults({
    startTime, endTime, query,
  }) {
    const resultList = this.find({
      startTime,
      endTime,
      query,
    });

    resultList.map((i) => (
      delete i.face_image_id
    ));

    return resultList;
  }

  return {
    find,
    updateCommands,
    insertOne,
    queryResults,
  };
};
