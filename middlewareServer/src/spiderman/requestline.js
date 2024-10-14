const request = require('request');

module.exports = () => {
  function make({
    url,
    method = 'POST',
    headers = {
      'Content-Type': 'application/json',
      // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    },
    ...others
  }) {
    return new Promise((resolve, reject) => {
      request({
        url,
        method,
        headers,
        ...others,
      }, (error, response, body) => {
        // console.log('error', error);
        // console.log('response', response);
        // console.log('body', body);

        if (error) {
          global.spiderman.systemlog.generateLog(2, `send http error ${url} ${error}`);

          reject(error);
        } else {
          let ret = body;

          let b = '';
          Object.entries(body).forEach(([, value]) => {
            b += value;
          });

          if (b.length >= 1) {
            ret = JSON.parse(b);
            ret.ImageRemaining = 1;
          }

          if (response && response.headers) {
            try {
              if (response.headers['x-ratelimit-imageremaining']) {
                ret.ImageRemaining = response.headers['x-ratelimit-imageremaining'];
              } else if (response.headers['X-RateLimit-ImageRemaining']) {
                ret.ImageRemaining = response.headers['X-RateLimit-ImageRemaining'];
              }
            } catch (e) {
              ret.ImageRemaining = 1;
            }
          }
          global.spiderman.systemlog.generateLog(5, `send http body ${url} ImageRemaining:${ret.ImageRemaining}`);

          resolve(ret);
        }
      });
    });
  }

  return { make };
};
