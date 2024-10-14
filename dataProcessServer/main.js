"use strict";
const shell = require("shelljs");
const dgram = require("dgram");

global.fileroot = "/home/aira/product";

process.argv.forEach(function (val, index, array) {
  console.log(index + ": " + val);
  const param = val.split("=");
  if (param[0] == "dev") {
    if (param[1] == "true") {
      _dev_mode = true;
      console.log("_dev_mode as true");
    } else if (param[1] == "false") {
      _dev_mode = false;
      console.log("_dev_mode as false");
    }
  }
  if (param[0] == "localhost") {
    global.localhost = param[1];
  }
  if (param[0] == "fileroot") {
    global.fileroot = param[1];
    console.log("global.fileroot", global.fileroot);
  }
  if (param[0] == "airaface_mode") {
    global.airaface_mode = param[1] === "true";
  }
});

global.swroot = `${global.fileroot}/sw`;
global.swsystemroot = `${global.swroot}/system`;
global.dataroot = `${global.fileroot}/data`;
var dirDataPath = `mkdir ${global.dataroot}`;
shell.exec(dirDataPath, { silent: true }, function (code, stdOut, stdErr) {});

global.fwPath = `${global.fileroot}/fw`;
global.fwFullName = `${global.fwPath}/sw_upgrade_image.airasoft`;

global.dbPath = `${global.dataroot}/db`;
global.dbBackupFileName = `${global.dataroot}/dbbak.dbf`;

global.zoneinfoRootPath = `${global.swsystemroot}/zoneinfo`;

global.sendVerifyResultToMain = (data) => {
  const client = dgram.createSocket("udp4");
  const sendPort = 9001;
  const sendHost = global.localhost || "localhost";

  const jsonString = JSON.stringify(data);
  const bufferData = Buffer.from(jsonString, "utf-8");

  client.send(bufferData, sendPort, sendHost, (err) => {
    if (err) {
      console.error("資料發送失敗：", err);
    }
  });
};

try {
  var standaloneZoneDetectResult = require("./service/standaloneZoneDetectResult");
  global.standaloneZoneDetectResult = new standaloneZoneDetectResult(
    global.dataroot
  );

  var standaloneZoneMonitorResult = require("./service/standaloneZoneMonitorResult");
  global.standaloneZoneMonitorResult = new standaloneZoneMonitorResult(
    global.dataroot
  );

  var standaloneCrossLineResult = require("./service/standaloneCrossLineResult");
  global.standaloneCrossLineResult = new standaloneCrossLineResult(
    global.dataroot
  );


  var dataProcessor = require("./service/dataProcessor");
  global.dataProcessor = new dataProcessor();
} catch (e) {
  console.log("e : ", e.toString());
}
