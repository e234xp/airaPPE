"use strict";

const fs = require("fs");
// const path = require('path');
const writeToFile = require("write-to-file");
const delay = (interval) => {
    return new Promise((resolve) => {
        setTimeout(resolve, interval);
    });
};
const shell = require("shelljs");

class standaloneNonVerifyResult {
    constructor(workingFolder) {
        const self = this;
        self._fileHeader = "nvr";
        self._workingDBFolder = workingFolder + "/nonverifyresult";
        self._workingPhotoDBFolder = workingFolder + "/nonverifyresultphoto";
        self._run = true;
        self.getDiskSpaceUsedPerceent = function (path) {
            return new Promise((r) => {
                let cmd = `df -h ${path} | grep '/dev' | /usr/bin/awk -F " " '{print $5}'`;
                shell.exec(cmd, { silent: true }, function (code, stdOut, stdErr) {
                    if (stdErr) {
                        r(0);
                    } else {
                        r(stdOut.replace(/[%\r\n]/gm, ""));
                    }
                });
            });
        };

        self.deleteFolderRecursive = function (directoryPath) {
            return new Promise((r) => {
                let cmd = `rm -r ${directoryPath}`;
                shell.exec(cmd, { silent: true }, function (code, stdOut, stdErr) {
                    r();
                });
            });
        };
        self.houseKeeping = async function () {
            while (self._run) {
                // var forceToRemove =
                //     (await self.getDiskSpaceUsedPerceent(self._workingDBFolder)) > 89;
                // var currentDate = new Date();
                // var startOfHousingKeepingDate = new Date(
                //     currentDate.getTime() - 7200000
                // );
                // var recycleStartTime = startOfHousingKeepingDate.getTime();

                var currentDate = new Date();
                var toMaintainTime = 86400000 * 3;
                var toMaintainSize = 10000000000;
                let systemSettings = null;
                try {
                    var dbStr = fs.readFileSync(global.dbPath + "/system_settings.cfg").toString('utf8');
                    systemSettings = JSON.parse(dbStr);
                }
                catch (e) { }
                if (systemSettings && systemSettings.db && systemSettings.db.non_verified_maintain_duration) toMaintainTime = systemSettings.db.non_verified_maintain_duration;
                if (systemSettings && systemSettings.db && systemSettings.db.maintain_disk_space_in_gb) toMaintainSize = systemSettings.db.maintain_disk_space_in_gb * 1000000000;

                var startOfHousingKeepingDate = new Date(currentDate.getTime() - toMaintainTime);
                startOfHousingKeepingDate.setUTCHours(0, 0, 0, 0);
                var recycleStartTime = startOfHousingKeepingDate.getTime();

                try {
                    if (!fs.existsSync(self._workingDBFolder)) {
                        fs.mkdirSync(self._workingDBFolder);
                    }
                    if (!fs.existsSync(self._workingPhotoDBFolder)) {
                        fs.mkdirSync(self._workingPhotoDBFolder);
                    }
                    var files = fs.readdirSync(self._workingDBFolder);
                    files.sort(function (a, b) {
                        return fs.statSync(self._workingDBFolder + "/" + a).mtime.getTime() - fs.statSync(self._workingDBFolder + "/" + b).mtime.getTime();
                    });
                    //fs.readdir(self._workingDBFolder, (err, files) => {
                    if (!err && files && files.length > 0) files.forEach(file => {
                        let forceRemove = false;
                        try {
                            const stats = fs.statfsSync(self._workingDBFolder);
                            if (stats.bsize * stats.bavail < toMaintainSize) {
                                forceRemove = true;
                            }
                        }
                        catch (e) { }
                        try {
                            var needToRemove = true;
                            var absFilename = self._workingDBFolder + "/" + file;
                            if (fs.lstatSync(absFilename).isFile()) {
                                if (forceRemove == false) {
                                    var filenameParts = file.split(".");
                                    if (filenameParts.length == 2) {
                                        var filenameStrutParts = filenameParts[0].split("_");
                                        if (filenameStrutParts.length == 3 && filenameStrutParts[0] == self._fileHeader) {
                                            if (Number(filenameStrutParts[1]) > recycleStartTime) {
                                                needToRemove = false;
                                            }
                                        }
                                    }
                                }
                                if (needToRemove) {
                                    const removingFolder = `${self._workingPhotoDBFolder}/${file}_photos`;
                                    self.deleteFolderRecursive(removingFolder);
                                    fs.unlinkSync(absFilename);
                                }
                            }
                        }
                        catch (e) { }
                    });
                    //});

                    // fs.readdir(self._workingPhotoDBFolder, (err, folders) => {
                    //     if (err || folders.length === 0) return;

                    //     folders.forEach((folder) => {
                    //         try {
                    //             const [folderName] = folder.split(".");
                    //             const [, startTimestamp] = folderName.split("_");

                    //             const needToRemove = Number(startTimestamp) <= recycleStartTime;

                    //             if (forceToRemove || needToRemove) {
                    //                 const removingFolder = `${self._workingPhotoDBFolder}/${folder}`;
                    //                 fs.rmdir(removingFolder, { recursive: true }, (err) => {
                    //                     if (err) {
                    //                         console.error('Error deleting folder:', err);
                    //                         return;
                    //                     }
                    //                     console.log('Folder deleted successfully');
                    //                 });
                    //             }
                    //         } catch (e) { }
                    //     });
                    // });
                } catch (e) { }
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
                var currentPhotosFolder = `${self._workingPhotoDBFolder}/${self._fileHeader}_${startTime.getTime()}_${endTime.getTime()}.db_photos`;

                if (!fs.existsSync(currentPhotosFolder)) {
                    fs.mkdirSync(currentPhotosFolder);
                }

                if (data.face_image) {
                    if (data.verify_uuid && data.verify_uuid.length > 0) {
                        var imageFileName = `${currentPhotosFolder}/${data.verify_uuid}.photo`;
                        await writeToFile(imageFileName, data.face_image ? data.face_image : "", { flag: "w" });
                    }
                    delete data["face_image"];
                }

                if (currentDbfileName.length > 0) {
                    await writeToFile(currentDbfileName, "," + JSON.stringify(data), {
                        flag: "a+",
                    });
                }
            }
            catch (e) {
            }
            return new Promise((resolve) => {
                if (cb) cb();
                resolve();
            });
        };
    }

    insertData = async function (timestamp, data, cb) {
        const self = this;
        try {
            await self.insertToFile(timestamp, data);
        } catch (e) { }
        return new Promise((resolve) => {
            if (cb) cb();
            resolve();
        });
    };
}

module.exports = standaloneNonVerifyResult;
