module.exports = () => ({ data, queryObject }) => {
  const filtered = data
    .filter((item) => _isMatchConditions({ item, queryObject }));

  const indexes = filtered.map((item) => data.indexOf(item));

  return { data: filtered, indexes };
};

function _isMatchConditions({ item, queryObject }) {
  return Object.entries(queryObject).every(([key, value]) => {
    let ret = item[key] === value;
    if ((key === '$or') || (key === '$and')) {
      ret = _handleSpecialOperators(key, value, item);
    } else if (typeof value === 'object' && value !== null) {
      ret = Object.entries(value).every(
        ([op, opValue]) => _handleSpecialOperators(op, opValue, item[key]),

        // ([op, opValue]) => (key === 'keyword'
        //   ? _handleSpecialOperators(op, opValue, item)
        //   : _handleSpecialOperators(op, opValue, item[key])),
      );
    }

    return ret;
  });
}

function _handleSpecialOperators(key, value, item) {
  if (key === '$in') {
    if (Array.isArray(value) && value.includes(item)) {
      return true;
    }
    return false;
  }

  if (key === '$lt') {
    if (typeof item === 'number' && item < value) {
      return true;
    }
    return false;
  }

  if (key === '$lte') {
    if (typeof item === 'number' && item <= value) {
      return true;
    }
    return false;
  }

  if (key === '$gt') {
    if (typeof item === 'number' && item > value) {
      return true;
    }
    return false;
  }

  if (key === '$gte') {
    if (typeof item === 'number' && item >= value) {
      return true;
    }
    return false;
  }

  if (key === '$ne') {
    return item !== value;
  }

  if (key === '$some') {
    if (Array.isArray(item) && Array.isArray(value)) {
      return value.some((val) => item.includes(val));
    }
    return false;
  }

  if (key === '$or') {
    let ret = false;

    value.forEach((obj) => {
      // for (const field in obj) {
      //   ret = ret || (item[field].match(new RegExp(obj[field].$regex, 'gi')));
      // }

      Object.entries(obj).forEach(([f, v]) => {
        ret = ret || (item[f].match(new RegExp(v.$regex, 'gi')));
      });
    });

    return ret;
  }

  if (key === '$and') {
    let ret = false;

    value.forEach((obj) => {
      // for (const field in obj) {
      //   ret = ret && (item[field].match(new RegExp(obj[field].$regex, 'gi')));
      // }

      Object.entries(obj).forEach(([f, v]) => {
        ret = ret && (item[f].match(new RegExp(v.$regex, 'gi')));
      });
    });

    return ret;
  }

  // if (key === '$regex') {
  //   return item.id.match(new RegExp(value, 'gi')) || item.name.match(new RegExp(value, 'gi'));
  // }

  return false;
}
