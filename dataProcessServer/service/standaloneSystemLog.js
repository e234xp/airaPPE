"use strict";

const fs = require("fs");
// const path = require('path');
const writeToFile = require("write-to-file");
const delay = (interval) => { return new Promise((resolve) => { setTimeout(resolve, interval); }); };

class standaloneSystemLog {
    constructor(workingFolder) {
        const self = this;
        self._fileHeader = "log";
        self._workingDBFolder = workingFolder + "/systemlog";
        self._run = true;
        self.houseKeeping = async function () {
            while (self._run) {
                var currentDate = new Date();
                var startOfHousingKeepingDate = new Date(currentDate.getTime() - 86400000 * 31);
                startOfHousingKeepingDate.setUTCHours(0, 0, 0, 0);
                var recycleStartTime = startOfHousingKeepingDate.getTime();
                try {
                    if (!fs.existsSync(self._workingDBFolder)) {
                        fs.mkdirSync(self._workingDBFolder);
                    }
                    fs.readdir(self._workingDBFolder, (err, files) => {
                        if (!err && files && files.length > 0) files.forEach(file => {
                            var needToRemove = true;
                            try {
                                // log_1659974400000_1660060799999.db 
                                var absFilename = self._workingDBFolder + "/" + file;
                                if (fs.lstatSync(absFilename).isFile()) {
                                    var filenameParts = file.split(".");
                                    if (filenameParts.length == 2) {
                                        var filenameStrutParts = filenameParts[0].split("_");
                                        if (filenameStrutParts.length == 3 && filenameStrutParts[0] == self._fileHeader) {
                                            if (Number(filenameStrutParts[1]) > recycleStartTime) {
                                                needToRemove = false;
                                            }
                                        }
                                    }
                                } else needToRemove = false;
                                if (needToRemove) {
                                    fs.unlinkSync(absFilename);
                                }
                            }
                            catch (e) { }
                        });
                    });
                }
                catch (e) { }
                await delay(10000);
            }
        };
        self.houseKeeping();

        self.insertToFile = async function (timestamp, data, cb) {
            try {
                var startTime = new Date(timestamp);
                startTime.setUTCHours(0, 0, 0, 0);
                var endTime = new Date(timestamp);
                endTime.setUTCHours(23, 59, 59, 999);
                var currentDbfileName = `${self._workingDBFolder}/${self._fileHeader}_${startTime.getTime()}_${endTime.getTime()}.db`;

                if (currentDbfileName.length > 0) {
                    await writeToFile(currentDbfileName, "," + JSON.stringify(data), {
                        flag: "a+",
                    });
                }
            }
            catch (e) {
                //console.log( e )
            }
            return new Promise((resolve) => {
                if (cb) cb();
                resolve();
            });
        };
    };

    insertData = async function (timestamp, data, cb) {
        const self = this;
        try {
            await self.insertToFile(timestamp, data);
        }
        catch (e) { }
        return new Promise((resolve) => {
            if (cb) cb();
            resolve();
        });
    };
}

module.exports = standaloneSystemLog;
