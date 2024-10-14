# Write to File

[![Build Status](https://badgen.net/travis/risan/write-to-file)](https://travis-ci.org/risan/write-to-file)
[![Test Covarage](https://badgen.net/codecov/c/github/risan/write-to-file)](https://codecov.io/gh/risan/write-to-file)
[![Greenkeeper](https://badges.greenkeeper.io/risan/write-to-file.svg)](https://greenkeeper.io)
[![Latest Version](https://badgen.net/npm/v/write-to-file)](https://www.npmjs.com/package/write-to-file)

Writes data to file and automatically create its directories if not exists.

## Installation

```bash
$ npm install write-to-file
```

## Usage

```js
const writeToFile = require("write-to-file");

(async () => {
  try {
    await writeToFile("foo/bar/baz.txt", "Hello World!");
  } catch(error) {
    console.error(error.message);
  }
})();
```

If `foo/bar` directory does not exist, it will be created automatically.

## Recipes

### Set the Character Encoding

You can pass the character encoding as the third argument. Default to `utf8`.

```js
const writeToFile = require("write-to-file");

(async () => {
  const buff = Buffer.from("Hello World!");

  try {
    await writeToFile("foo.txt", buff.toString("hex"), "hex");
  } catch(error) {
    console.error(error.message);
  }
})();
```

You can also pass an object:

```js
writeToFile("foo.txt", buff.toString("hex"), {
  encoding: "hex"
});
```

### Appending Data to a File

By default, if the file already exists, it will be overwritten. For appending data to a file, you may pass the `flag` option:

```js
const writeToFile = require("write-to-file");

(async () => {
  try {
    await writeToFile("foo.txt", "bar", {
      flag: "a"
    });
  } catch(error) {
    console.error(error.message);
  }
})();
```

## API

```js
writeToFile(file, data, [options])
```

### Parameters

* `file` (`String`): The file path to write to.
* `data` (`String`|`Buffer`): Data to write.
* `options` (Optional `Object`|`String`): You may pass the encoding as the third argument. You may also pass an object:
    * `encoding` (`String`): The character encoding to use, default to `utf8`.
    * `mode` (`Number`): The file permission to set, default to `0o666`.
    * `flag` (`String`): The [file system](https://nodejs.org/dist/latest-v11.x/docs/api/fs.html#fs_file_system_flags) flag, default to `w`.
    * `createDirMode` (`Number`): The directory permission to set when creating the parent directory that does not exist, default to `0o777`.

### Returns

It returns a `Promise` which when resolved contains a `true` value.

## Related

* [create-dir](https://github.com/risan/create-dir): Module to create directory recursively.

## License

[MIT](https://github.com/risan/write-to-file/blob/master/LICENSE) © [Risan Bagja Pradana](https://bagja.net)
