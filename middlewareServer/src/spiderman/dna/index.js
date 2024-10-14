const fs = require('fs');

const DATA_FOLDER = `${global.params.dataPath}`;
const DB_FOLDER = `${global.params.dataPath}/db`;

if (!fs.existsSync(DATA_FOLDER)) {
  fs.mkdirSync(DATA_FOLDER);
}
if (!fs.existsSync(DB_FOLDER)) {
  fs.mkdirSync(DB_FOLDER);
}

module.exports = {
  db: {
    collections: [
      {
        name: 'account',
        type: 'file',
        cache: { isOpen: true, maxBytes: 10 * 1024 * 1024 },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'analysis',
        type: 'file',
        cache: { isOpen: true, maxBytes: 10 * 1024 * 1024 },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'attendancesettings',
        type: 'file',
        cache: { isOpen: true },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'cameras',
        type: 'file',
        cache: { isOpen: true, maxBytes: 10 * 1024 * 1024 },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'dashboardsettings',
        type: 'file',
        cache: { isOpen: true },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'eventhandle',
        type: 'file',
        cache: { isOpen: true, maxBytes: 20 * 1024 * 1024 },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'groups',
        type: 'file',
        cache: { isOpen: true, maxBytes: 10 * 1024 * 1024 },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'ioboxes',
        type: 'file',
        cache: { isOpen: true, maxBytes: 10 * 1024 * 1024 },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'managersettings',
        type: 'file',
        cache: { isOpen: true },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'outputdevicegroups',
        type: 'file',
        cache: { isOpen: true, maxBytes: 10 * 1024 * 1024 },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'person',
        type: 'file',
        cache: { isOpen: true, maxBytes: 10 * 1024 * 1024 },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'personplugininfo',
        type: 'record',
        cache: { isOpen: true, maxBytes: 200 * 1024 * 1024 },
        workingFolder: DATA_FOLDER,
      },
      {
        name: 'system_settings',
        type: 'file',
        cache: { isOpen: true },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'systemlog',
        type: 'record',
        cache: { isOpen: true, maxBytes: 20 * 1024 * 1024 },
        workingFolder: DATA_FOLDER,
      },
      {
        name: 'tablets',
        type: 'file',
        cache: { isOpen: true, maxBytes: 10 * 1024 * 1024 },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'videodevicegroups',
        type: 'file',
        cache: { isOpen: true, maxBytes: 10 * 1024 * 1024 },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'visitor',
        type: 'file',
        cache: { isOpen: true, maxBytes: 10 * 1024 * 1024 },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'wiegandconverters',
        type: 'file',
        cache: { isOpen: true, maxBytes: 10 * 1024 * 1024 },
        workingFolder: DB_FOLDER,
      },

      {
        name: 'personverifyresult',
        type: 'record',
        cache: { isOpen: true, maxBytes: 200 * 1024 * 1024 },
        workingFolder: DATA_FOLDER,
      },
      {
        name: 'personverifyresultphoto',
        type: 'image',
        workingFolder: DATA_FOLDER,
      },
      {
        name: 'visitorverifyresult',
        type: 'record',
        cache: { isOpen: true, maxBytes: 20 * 1024 * 1024 },
        workingFolder: DATA_FOLDER,
      },
      {
        name: 'visitorverifyresultphoto',
        type: 'image',
        workingFolder: DATA_FOLDER,
      },
      {
        name: 'nonverifyresult',
        type: 'record',
        cache: { isOpen: true, maxBytes: 20 * 1024 * 1024 },
        workingFolder: DATA_FOLDER,
      },
      {
        name: 'nonverifyresultphoto',
        type: 'image',
        workingFolder: DATA_FOLDER,
      },
      {
        name: 'manualverifyresult',
        type: 'record',
        cache: { isOpen: true, maxBytes: 20 * 1024 * 1024 },
        workingFolder: DATA_FOLDER,
      },
      {
        name: 'dbPhoto',
        type: 'image',
        workingFolder: DB_FOLDER,
      },
      // Not using @current version
      {
        name: 'rules',
        type: 'file',
        cache: { isOpen: true },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'schedules',
        type: 'file',
        cache: { isOpen: true },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'linecommands',
        type: 'file',
        cache: { isOpen: true },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'emailcommands',
        type: 'file',
        cache: { isOpen: true },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'httpcommands',
        type: 'file',
        cache: { isOpen: true },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'settings',
        type: 'file',
        cache: { isOpen: true },
        workingFolder: DB_FOLDER,
      },
      {
        name: 'eventsettings',
        type: 'file',
        cache: { isOpen: false },
        workingFolder: DB_FOLDER,
      },
    ],
  },
};
