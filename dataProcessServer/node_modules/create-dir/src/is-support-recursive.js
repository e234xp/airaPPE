/**
 * Check if the mkdir recursive option is supported.
 *
 * @param {String} version
 * @return {Boolean}
 */
const isSupportRecursive = (version = process.version) => {
  const versions = version.match(/(\d{1,2}).(\d{1,2}).\d{1,2}$/);

  const major = parseInt(versions[1], 10);
  const minor = parseInt(versions[2], 10);

  let supported = false;

  if (major > 10) {
    supported = true;
  } else if (major === 10) {
    supported = minor >= 12;
  }

  return supported;
};

module.exports = isSupportRecursive;
