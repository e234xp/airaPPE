# Create Directory Recursively

[![Build Status](https://badgen.net/travis/risan/create-dir)](https://travis-ci.org/risan/create-dir)
[![Test Covarage](https://badgen.net/codecov/c/github/risan/create-dir)](https://codecov.io/gh/risan/create-dir)
[![Greenkeeper](https://badges.greenkeeper.io/risan/create-dir.svg)](https://greenkeeper.io)
[![Latest Version](https://badgen.net/npm/v/create-dir)](https://www.npmjs.com/package/create-dir)

Create directory recursively.

It works similar to the `mkdir -p`. For Node `>= 10.12.0`, it will use the built-in `mkdir` `recursive` option.

## Installation

```bash
$ npm install create-dir
```

## Usage

```js
const createDir = require("create-dir");

(async () => {
  try {
    await createDir("foo/bar/baz");
  } catch(error) {
    console.error(error.message);
  }
})();
```

## API

```js
createDir(path, [mode])
```

### Parameters

* `path` (`String`): The path directory to create.
* `mode` (optional `Number`): Directory permission, default to `0o777`.

### Returns

It returns a `Promise` which when resolved contains a `true` value.

## Related

* [write-to-file](https://github.com/risan/write-to-file): Module to write data to file and automatically create its directories if not exists.

## License

[MIT](https://github.com/risan/create-dir/blob/master/LICENSE) © [Risan Bagja Pradana](https://bagja.net)
