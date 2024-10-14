const fs = require("fs");
const path = require("path");
const util = require("util");
const createDir = require("create-dir");

const writeFile = util.promisify(fs.writeFile);

const DEFAULT_OPTIONS = {
  encoding: "utf8",
  mode: 0o666,
  flag: "w",
  createDirMode: 0o777
};

const parseOptions = options => {
  let userOptions = options;

  if (typeof options === "string") {
    userOptions = { encoding: options };
  }

  const {
    encoding = DEFAULT_OPTIONS.encoding,
    mode = DEFAULT_OPTIONS.mode,
    flag = DEFAULT_OPTIONS.flag,
    createDirMode = DEFAULT_OPTIONS.createDirMode
  } = userOptions;

  return {
    writeOptions: { encoding, mode, flag },
    createDirMode
  };
};

const isDirNotExists = error => error.code === "ENOENT";

/**
 * Writes data to a file.
 *
 * @param {String} file
 * @param {String|Buffer} data
 * @param {Object|String} options
 * @return {Promise}
 */
const writeToFile = async (file, data, options = DEFAULT_OPTIONS) => {
  const { writeOptions, createDirMode } = parseOptions(options);

  try {
    await writeFile(file, data, writeOptions);
  } catch (error) {
    if (isDirNotExists(error)) {
      await createDir(path.dirname(file), createDirMode);

      await writeToFile(file, data, { ...writeOptions, createDirMode });
    } else {
      throw error;
    }
  }

  return true;
};

module.exports = writeToFile;
