"use strict";

const { setTimeout } = require('core-js');
const e = require('express');
const fs = require('fs');

const httpRequest = require('request');
const delay = (interval) => {
    return new Promise((resolve) => {
        setTimeout(resolve, interval);
    });
};

class edgeDeviceService {
    constructor(host, port, tokenKey, dataSaveDir, enable = true) {
        const self = this;
        self.enableTenant = enable;
        self.dataSaveDir = dataSaveDir;
        self.edgeDeviceTenantDataPath = self.dataSaveDir + "/edge_device_tenant.dat";
        self.edgeDeviceVerifyResultSyncStatusDataPath = self.dataSaveDir + "/edge_device_verify_result_sync_status.dat";
        self.edgeDeviceNonVerifyResultSyncStatusDataPath = self.dataSaveDir + "/edge_device_non_verify_result_sync_status.dat";

        self.host = host;
        self.port = port;
        self.tokenKey = tokenKey;
        self.run = false;
        self.running = false;

        self.personDatabaseGenerating = false;
        self.interruptPersonDatabaseGenerating = false;

        self.checkinTaskRunning = false;
        self.reportStatusTaskRunning = false;
        self.databaseMaintainTaskRunning = false;
        self.verifyResultSyncTaskRunning = false;
        self.nonVerifyResultSyncTaskRunning = false;

        self.personListLastModifyDate = 0;
        self.personDbLastModifyDate = 0;
        self.countdownToSyncPersonDb = 0;
        self.needToSyncPersonDatabase = false;
        self.needToRefreshPersonDatabase = false;

        self.deviceType = "";
        self.deviceUuid = "";
        self.deviceFwVersion = "";
        self.deviceIpAddress = "";
        self.deviceLicense = "";
        self.deviceMacAddress = "";

        self.callbackForRequireCurrentPersonList = null;
        self.callbackForCleanupPersonDatabase = null;
        self.callbackForRequireDeviceInfo = null;
        self.callbackForPersonDataHaveToChange = null;
        self.callbackForRequireVerifyResult = null;
        self.callbackForReportedToTenant = null;

        self.abordVerifyResultSyncLoop = true;
        self.abordNonVerifyResultSyncLoop = true;

        self.reportVerifyResultEnable = true;
        self.reportNonVerifyResultEnable = false;
        self.reportVerifyResultInterval = 60000;
        self.reportNonVerifyResultInterval = 60000;

        self.batchReportRecordCount = 100;

        self.decryptToekn = (key, token) => {
            const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
            const applySaltToChar = (code) => textToChars(key).reduce((a, b) => a ^ b, code);
            return token
                .match(/.{1,2}/g)
                .map((hex) => parseInt(hex, 16))
                .map(applySaltToChar)
                .map((charCode) => String.fromCharCode(charCode))
                .join("");
        };

        self.generateToken = (key) => {
            const tokenInfo = JSON.stringify({ timestamp: Date.now() });
            const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
            const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
            const applySaltToChar = (code) => textToChars(key).reduce((a, b) => a ^ b, code);
            return tokenInfo
                .split("")
                .map(textToChars)
                .map(applySaltToChar)
                .map(byteHex)
                .join("");
        };

        self.defaultRequestOptions = {
            method: "POST",
            timeout: 60000,
            pool: { maxSockets: 10 },
            rejectUnauthorized: false,
            requestCert: true,
            time: true,
        };

        self.fetchDeviceInfo = async function () {
            // console.log("edgeDeviceService fetchDeviceInfo 1");

            //if (self.deviceUuid.length === 0) {
            var deviceInfo = self.callbackForRequireDeviceInfo ? await self.callbackForRequireDeviceInfo() : null;
            if (deviceInfo) {
                self.deviceUuid = deviceInfo.uuid ? deviceInfo.uuid : "";
                self.deviceType = deviceInfo.device_type ? deviceInfo.device_type : "unknown";
                self.deviceFwVersion = deviceInfo.fw_version ? deviceInfo.fw_version : "unknown";
                self.deviceIpAddress = deviceInfo.ip ? deviceInfo.ip : "unknown";
                self.deviceLicense = deviceInfo.license ? deviceInfo.license : "unknown";
                self.deviceMacAddress = "[" + (deviceInfo.wifi_mac ? (deviceInfo.wifi_mac + ",") : "") + deviceInfo.eth_mac + "]";
            }
            //}
            return new Promise((resolve) => {
                // console.log("edgeDeviceService fetchDeviceInfo 2");

                resolve();
            });
        }
        self.checkin = async function () {
            console.log("edgeDeviceService checkin start");

            await self.fetchDeviceInfo();
            return new Promise((resolve) => {
                if (self.deviceUuid && self.deviceUuid.length > 0 && self.deviceIpAddress != 'unknown') {
                    var requestOptions = Object.assign({}, self.defaultRequestOptions);
                    requestOptions["url"] = `https://${self.host}:${self.port}/edgedevice/checkin`;
                    requestOptions["headers"] = {
                        "Content-Type": "application/json",
                        "token": self.generateToken(self.tokenKey)
                    };
                    requestOptions["json"] = {
                        edge_device_type: self.deviceType,
                        edge_device_uuid: self.deviceUuid,
                        edge_device_ip: self.deviceIpAddress,
                        edge_device_fw_version: self.deviceFwVersion
                    };
                    // console.log("checkin", requestOptions["json"]);
                    httpRequest(requestOptions, function (error, response, body) {
                        // console.log("checkin ret ", body);
                        if (error) {
                            console.log("error : ", requestOptions, error, body);
                            resolve(null);
                        }
                        else {
                            console.log("edgeDeviceService checkin end 2");
                            resolve(body);
                        }
                    });
                }
                else {
                    // console.log("edgeDeviceService checkin end 3");
                    resolve(null);
                }
            });
        };

        self.reportStatus = async function (assginedTenant) {
            console.log("edgeDeviceService reportStatus start");

            await self.fetchDeviceInfo();
            return new Promise((resolve) => {
                if (self.deviceUuid && self.deviceUuid.length > 0 && self.deviceIpAddress != 'unknown') {
                    var requestOptions = Object.assign({}, self.defaultRequestOptions);
                    requestOptions["url"] = `https://${self.host}:${self.port}/edgedevice/reportstatus`;
                    requestOptions["headers"] = {
                        "Content-Type": "application/json",
                        "token": self.generateToken(self.tokenKey)
                    };
                    requestOptions["json"] = {
                        tenant_uuid: assginedTenant.tenant_uuid,
                        edge_device_type: self.deviceType,
                        edge_device_uuid: self.deviceUuid,
                        edge_device_ip: self.deviceIpAddress,
                        edge_device_fw_version: self.deviceFwVersion
                    };
                    // console.log("reportStatus", requestOptions["json"]);
                    httpRequest(requestOptions, function (error, response, body) {
                        // console.log("reportStatus ret ", body);
                        if (error) {
                            console.log("error : ", requestOptions, error, body);
                            resolve(null);
                        }
                        else {
                            // console.log("edgeDeviceService reportStatus end 2");
                            resolve(body);
                        }
                    });
                }
                else {
                    // console.log("edgeDeviceService reportStatus end 3");

                    resolve(null);
                }
            });
        };

        self.getDifferencePersonList = async function (assginedTenant, existingPersonList) {
            console.log("edgeDeviceService getDifferencePersonList start");

            await self.fetchDeviceInfo();
            return new Promise((resolve) => {
                if (self.deviceUuid && self.deviceUuid.length > 0 && self.deviceIpAddress != 'unknown') {
                    var requestOptions = Object.assign({}, self.defaultRequestOptions);
                    requestOptions["url"] = `https://${self.host}:${self.port}/edgedevice/personlist`;
                    requestOptions["headers"] = {
                        "Content-Type": "application/json",
                        "token": self.generateToken(self.tokenKey)
                    };
                    requestOptions["json"] = {
                        tenant_uuid: assginedTenant.tenant_uuid,
                        edge_device_uuid: self.deviceUuid
                    };
                    if (existingPersonList) requestOptions.json["existing_person_list"] = existingPersonList;

                    console.log("getDifferencePersonList", requestOptions["json"]);
                    httpRequest(requestOptions, function (error, response, body) {
                        // console.log("getDifferencePersonList ret", body);
                        if (error) {
                            console.log("error : ", requestOptions, error, body);
                            resolve(null);
                        }
                        else {
                            console.log("edgeDeviceService getDifferencePersonList end 2");
                            resolve(body);
                        }
                    });
                }
                else {
                    console.log("edgeDeviceService getDifferencePersonList end 3");
                    resolve(null);
                }
            });
        }

        self.reportVerifyResultListToTenant = async function (assginedTenant, verifyResultList) {
            console.log("edgeDeviceService reportVerifyResultListToTenant start");

            await self.fetchDeviceInfo();
            return new Promise((resolve) => {
                var resultList = [];
                verifyResultList.forEach(r => {
                    resultList.push({
                        edge_device_uuid: self.deviceUuid,
                        verify_uuid: r.verify_uuid,
                        person_uuid: r.person_uuid,
                        target_score: r.target_score,
                        verify_score: r.verify_score,
                        timestamp: r.timestamp,
                        high_temperature: r.high_temperature,
                        temperature: r.temperature,
                        card_number: r.card_number,
                        verify_mode: r.verify_mode, //  0 pass-mode, 1 clock-in, 2 clock-out, 3, 4
                        channel_uuid: r.channel_uuid ? r.channel_uuid : "",
                        channel_name: r.channel_name ? r.channel_name : "",
                        captured_image: r.captured_image
                    })
                });

                if (self.deviceUuid && self.deviceUuid.length > 0 && self.deviceIpAddress != 'unknown') {
                    var requestOptions = Object.assign({}, self.defaultRequestOptions);
                    requestOptions["url"] = `https://${self.host}:${self.port}/edgedevice/reportverifyresult`;

                    console.log("reportVerifyResultListToTenant", requestOptions["url"]);

                    requestOptions["headers"] = {
                        "Content-Type": "application/json",
                        "token": self.generateToken(self.tokenKey)
                    };
                    requestOptions["json"] = {
                        tenant_uuid: assginedTenant.tenant_uuid,
                        verify_result_list: resultList
                    };

                    console.log("reportVerifyResultListToTenant", resultList.length);

                    httpRequest(requestOptions, function (error, response, body) {
                        if (error) {
                            console.log("error : ", requestOptions, error, body);
                            resolve(null);
                        }
                        else {
                            console.log("edgeDeviceService reportVerifyResultListToTenant end 2");
                            resolve(body);
                        }
                    });
                }
                else {
                    console.log("edgeDeviceService reportVerifyResultListToTenant end 3");
                    resolve(null);
                }
            });
        }

        self.reportNonVerifyResultListToTenant = async function (assginedTenant, nonVerifyResultList) {
            console.log("edgeDeviceService reportNonVerifyResultListToTenant start");

            await self.fetchDeviceInfo();
            return new Promise((resolve) => {
                var resultList = [];
                nonVerifyResultList.forEach(r => {
                    resultList.push({
                        edge_device_uuid: self.deviceUuid,
                        verify_uuid: r.verify_uuid,
                        target_score: r.target_score,
                        verify_score: r.verify_score,
                        timestamp: r.timestamp,
                        high_temperature: r.high_temperature,
                        temperature: r.temperature,
                        card_number: r.card_number,
                        channel_uuid: r.channel_uuid ? r.channel_uuid : "",
                        channel_name: r.channel_name ? r.channel_name : "",
                        captured_image: r.captured_image
                    })
                });

                if (self.deviceUuid && self.deviceUuid.length > 0 && self.deviceIpAddress != 'unknown') {
                    var requestOptions = Object.assign({}, self.defaultRequestOptions);
                    requestOptions["url"] = `https://${self.host}:${self.port}/edgedevice/reportnonverifyresult`;

                    console.log("reportNonVerifyResultListToTenant", requestOptions["url"]);

                    requestOptions["headers"] = {
                        "Content-Type": "application/json",
                        "token": self.generateToken(self.tokenKey)
                    };
                    requestOptions["json"] = {
                        tenant_uuid: assginedTenant.tenant_uuid,
                        non_verify_result_list: resultList
                    };
                    console.log("reportNonVerifyResultListToTenant", resultList.length);
                    httpRequest(requestOptions, function (error, response, body) {
                        if (error) {
                            console.log("error : ", requestOptions, error, body);
                            resolve(null);
                        }
                        else {
                            console.log("edgeDeviceService reportNonVerifyResultListToTenant end 2");
                            resolve(body);
                        }
                    });
                }
                else {
                    console.log("edgeDeviceService reportNonVerifyResultListToTenant end 3");
                    resolve(null);
                }
            });
        }

        self.getPersonData = async function (assginedTenant, personUuid) {
            console.log("edgeDeviceService getPersonData start");

            await self.fetchDeviceInfo();
            return new Promise((resolve) => {
                if (self.deviceUuid && self.deviceUuid.length > 0 && self.deviceIpAddress != 'unknown') {
                    var requestOptions = Object.assign({}, self.defaultRequestOptions);
                    requestOptions["url"] = `https://${self.host}:${self.port}/edgedevice/persondata`;
                    requestOptions["headers"] = {
                        "Content-Type": "application/json",
                        "token": self.generateToken(self.tokenKey)
                    };
                    requestOptions["json"] = {
                        tenant_uuid: assginedTenant.tenant_uuid,
                        person_uuid: personUuid
                    };
                    console.log("getPersonData", requestOptions["json"]);
                    httpRequest(requestOptions, function (error, response, body) {
                        if (error) {
                            console.log("error : ", requestOptions, error, body);
                            resolve(null);
                        }
                        else {
                            console.log("getPersonData end 2");
                            resolve(body);
                        }
                    });
                }
                else {
                    console.log("edgeDeviceService getPersonData end 3");
                    resolve(null);
                }
            });
        }

        const _CHECKIN_INTERVAL = 60000;
        self.checkinTask = async function () {
            console.log("edgeDeviceService checkinTask start");

            self.checkinTaskRunning = true;
            while (self.run) {
                if (self.enableTenant) {
                    let checkinFeedback = await self.checkin();
                    if (checkinFeedback && checkinFeedback.message === "ok") {
                        if (checkinFeedback.assigned_tenant) {
                            var tenant = Object.assign({}, checkinFeedback.assigned_tenant);
                            var tenantChanged = await self.setTenant(tenant);
                            if (tenantChanged) {
                                self.needToRefreshPersonDatabase = true;
                            }
                        }
                        else {
                            await self.delTenant();
                            self.needToRefreshPersonDatabase = true;
                        }
                    }
                }
                let cnt = _CHECKIN_INTERVAL;
                while (self.run && cnt > 0) {
                    cnt -= 1000;
                    await delay(1000);
                }
            }
            self.checkinTaskRunning = false;

            console.log("edgeDeviceService checkinTask end");
        };

        let _REPORT_INTERVAL = 30000;
        const _COUNTDOWN_SETTING_DEFAULT = 10;
        self.reportStatusTask = async function () {
            console.log("edgeDeviceService reportStatusTask start");

            self.reportStatusTaskRunning = true;
            self.countdownToSyncPersonDb = 0;
            let countdownCounterSettings = _COUNTDOWN_SETTING_DEFAULT; // default 5 mins
            while (self.run) {
                let personListLastModifyDate = self.personListLastModifyDate;
                let personDbLastModifyDate = self.personDbLastModifyDate;

                if (self.enableTenant) {
                    var tenant = self.getTenant();
                    if (!tenant.read_error && tenant.tenant_uuid) {
                        let reportStatusFeedback = await self.reportStatus(tenant);

                        var reportOk = (reportStatusFeedback && reportStatusFeedback.message === "ok");

                        if (self.callbackForReportedToTenant) {
                            self.callbackForReportedToTenant(reportOk, Date.now());
                        }

                        if (reportOk) {
                            if (reportStatusFeedback.person_list_last_modify_date &&
                                (
                                    (reportStatusFeedback.person_db_last_modify_date != personDbLastModifyDate) ||
                                    (reportStatusFeedback.person_list_last_modify_date != personListLastModifyDate)
                                )
                            ) {
                                self.personListLastModifyDate = reportStatusFeedback.person_list_last_modify_date;
                                self.personDbLastModifyDate = reportStatusFeedback.person_db_last_modify_date;

                                if (reportStatusFeedback.configure && self.countdownToSyncPersonDb <= 0) {
                                    if (reportStatusFeedback.configure.report_interval) {
                                        if (reportStatusFeedback.configure.report_interval < 30000)
                                            _REPORT_INTERVAL = reportStatusFeedback.configure.report_interval;
                                        else
                                            _REPORT_INTERVAL = 30000;
                                    }

                                    var personSyncInterval = (reportStatusFeedback.configure.report_interval != null) ? reportStatusFeedback.configure.report_interval : _REPORT_INTERVAL * _COUNTDOWN_SETTING_DEFAULT;
                                    countdownCounterSettings = Math.min(Math.max(Math.floor(personSyncInterval / _REPORT_INTERVAL), 1), 10);

                                    self.countdownToSyncPersonDb = countdownCounterSettings;
                                }

                                if (personListLastModifyDate == 0) self.countdownToSyncPersonDb = 1;
                                else if (self.countdownToSyncPersonDb <= 0) self.countdownToSyncPersonDb = countdownCounterSettings; // 5 mins

                            }

                            if (reportStatusFeedback.configure) {
                                self.reportVerifyResultEnable = (reportStatusFeedback.configure.report_verify_result_enable != null) ? reportStatusFeedback.configure.report_verify_result_enable : true;
                                self.reportNonVerifyResultEnable = (reportStatusFeedback.configure.report_non_verify_result_enable != null) ? reportStatusFeedback.configure.report_non_verify_result_enable : false;
                                self.reportVerifyResultInterval = (reportStatusFeedback.configure.report_verify_result_interval != null) ? reportStatusFeedback.configure.report_non_verify_result_interval : 60000;
                                self.reportNonVerifyResultInterval = (reportStatusFeedback.configure.report_non_verify_result_interval != null) ? reportStatusFeedback.configure.report_non_verify_result_interval : 60000;
                            }
                        }

                        console.log("edgeDeviceService reportStatusTask 5", self.countdownToSyncPersonDb);

                        if (self.countdownToSyncPersonDb > 0) {
                            self.countdownToSyncPersonDb--;

                            if (self.countdownToSyncPersonDb <= 0) {
                                self.needToSyncPersonDatabase = true;
                                console.log("edgeDeviceService reportStatusTask 6", self.needToSyncPersonDatabase);
                            }
                        }
                    }
                    else self.countdownToSyncPersonDb = 0;
                }

                let cnt = _REPORT_INTERVAL;
                while (self.run && cnt > 0) {
                    cnt -= 1000;
                    await delay(1000);
                }
            }
            self.reportStatusTaskRunning = false;

            console.log("edgeDeviceService reportStatusTask end");
        };

        self.databaseMaintainTask = async function () {
            console.log("edgeDeviceService databaseMaintainTask start");

            // console.log("syncPersonDatabase", "databaseMaintainTask", self.run, self.enableTenant, self.needToRefreshPersonDatabase, self.needToSyncPersonDatabase  ) ;
            self.databaseMaintainTaskRunning = true;
            while (self.run) {
                if (self.enableTenant) {
                    if (self.needToRefreshPersonDatabase) {
                        self.needToRefreshPersonDatabase = false;
                        await self.interruptPersonGenerateDatabase();
                        await self.cleanupPersonDatabase();
                        self.syncPersonDatabase(self.getTenant());
                    }
                    else if (self.needToSyncPersonDatabase) {
                        self.needToSyncPersonDatabase = false;
                        await self.interruptPersonGenerateDatabase();
                        self.syncPersonDatabase(self.getTenant());
                    }
                }
                while (self.run && !self.needToSyncPersonDatabase && !self.needToRefreshPersonDatabase) {
                    await delay(1000);
                }
            }
            await self.interruptPersonGenerateDatabase();
            self.databaseMaintainTaskRunning = false;

            console.log("edgeDeviceService databaseMaintainTask end");
        }

        self.reportVerifyResultTask = async function () {
            console.log("edgeDeviceService reportVerifyResultTask start");

            self.verifyResultSyncTaskRunning = true;
            while (self.run) {
                if (self.enableTenant) {
                    if (self.reportVerifyResultEnable && self.callbackForRequireVerifyResult) {

                        var lastVerifyResultTime = await self.getLastVerifyResultSyncStatus();
                        if (!lastVerifyResultTime.read_error) {
                            var startTime = (lastVerifyResultTime.last_sync_data_time ? lastVerifyResultTime.last_sync_data_time : 0) + 1;
                            var endTime = Date.now();
                            var verifyResultList = await self.callbackForRequireVerifyResult(startTime, endTime, self.batchReportRecordCount);
                            if (verifyResultList && verifyResultList.length > 0) {

                                //console.log("verifyResultList : ", verifyResultList.length );

                                let resultListToSend = [];
                                verifyResultList.forEach(result => {
                                    resultListToSend.push({
                                        verify_uuid: result.verify_uuid,
                                        person_uuid: result.person_uuid,
                                        target_score: result.target_score,
                                        verify_score: result.verify_score,
                                        timestamp: result.timestamp,
                                        high_temperature: result.high_temperature,
                                        temperature: result.temperature,
                                        verify_mode: result.verify_mode, //  0 pass-mode, 1 clock-in, 2 clock-out, 3, 4
                                        channel_uuid: result.channel_uuid ? result.channel_uuid : "",
                                        channel_name: result.channel_name ? result.channel_name : "",
                                        captured_image: result.captured_image
                                    })
                                })

                                resultListToSend.sort((a, b) => { return a.timestamp - b.timestamp; });
                                self.abordVerifyResultSyncLoop = false;
                                let success = false;
                                // do {
                                var targetTenant = self.getTenant();
                                if (!targetTenant.read_error) {
                                    var reportRes = await self.reportVerifyResultListToTenant(targetTenant, resultListToSend);
                                    success = (reportRes && reportRes.message === "ok");
                                }
                                if (success) {
                                    console.log("edgeDeviceService reportVerifyResultTask 2");

                                    var lastRecTime = resultListToSend[resultListToSend.length - 1].timestamp;
                                    // console.log("reportVerifyResultListToTenant success", lastRecTime )
                                    await self.setLastSyncedVerifyResultTime(lastRecTime);

                                    self.batchReportRecordCount = Math.floor(self.batchReportRecordCount + 100);
                                    self.batchReportRecordCount = Math.max(self.batchReportRecordCount, 1);
                                    self.batchReportRecordCount = Math.min(self.batchReportRecordCount, 100);
                                }
                                else {
                                    console.log("edgeDeviceService reportVerifyResultTask 3");

                                    self.batchReportRecordCount = Math.floor(self.batchReportRecordCount / 2);
                                    self.batchReportRecordCount = Math.max(self.batchReportRecordCount, 1);
                                    self.batchReportRecordCount = Math.min(self.batchReportRecordCount, 100);

                                    var cntDelay = 1;
                                    while (self.run && cntDelay-- > 0 && !self.abordVerifyResultSyncLoop) {
                                        await delay(1000);
                                    }
                                }
                                //} while (!success);
                                //}
                                console.log("edgeDeviceService reportVerifyResultTask 4");

                                // if (success) {
                                // go next without another minute.
                                await delay(1000); // avoid burst loop
                                continue;
                                // }
                            }
                        }
                    }
                }

                console.log("edgeDeviceService reportVerifyResultTask 5");

                let intervalCnt = self.reportVerifyResultInterval > 1000 ? self.reportVerifyResultInterval : 1000;
                while (self.run && intervalCnt > 0) {
                    intervalCnt -= 1000;
                    await delay(1000);
                }

                console.log("edgeDeviceService reportVerifyResultTask 6");
            }
            self.verifyResultSyncTaskRunning = false;

            console.log("edgeDeviceService reportVerifyResultTask end");
        }

        self.reportNonVerifyResultTask = async function () {
            console.log("edgeDeviceService reportNonVerifyResultTask start");

            self.nonVerifyResultSyncTaskRunning = true;
            while (self.run) {
                if (self.enableTenant) {
                    if (self.reportNonVerifyResultEnable && self.callbackForRequireNonVerifyResult) {
                        var lastNonVerifyResultTime = await self.getLastNonVerifyResultSyncStatus();
                        if (!lastNonVerifyResultTime.read_error) {
                            var startTime = (lastNonVerifyResultTime.last_sync_data_time ? lastNonVerifyResultTime.last_sync_data_time : 0) + 1;
                            var endTime = Date.now();//startTime + 86400000 - 1;
                            var nonVerifyResultList = await self.callbackForRequireNonVerifyResult(startTime, endTime, self.batchReportRecordCount);
                            if (nonVerifyResultList && nonVerifyResultList.length > 0) {
                                let resultListToSend = [];
                                nonVerifyResultList.forEach(result => {
                                    //console.log( "reportNonVerifyResultTask : ", result.verify_uuid );
                                    resultListToSend.push({
                                        verify_uuid: result.verify_uuid,
                                        target_score: result.target_score,
                                        verify_score: result.verify_score,
                                        timestamp: result.timestamp,
                                        high_temperature: result.high_temperature,
                                        temperature: result.temperature,
                                        card_number: result.card_number,
                                        channel_uuid: result.channel_uuid ? result.channel_uuid : "",
                                        channel_name: result.channel_name ? result.channel_name : "",
                                        captured_image: result.captured_image
                                    })
                                })

                                resultListToSend.sort((a, b) => { return a.timestamp - b.timestamp; });
                                self.abordNonVerifyResultSyncLoop = false;
                                let success = false;
                                // do {
                                var targetTenant = self.getTenant();
                                if (!targetTenant.read_error) {
                                    var reportRes = await self.reportNonVerifyResultListToTenant(targetTenant, resultListToSend);
                                    success = (reportRes && reportRes.message === "ok");
                                }

                                if (success) {
                                    console.log("edgeDeviceService reportNonVerifyResultTask 2");

                                    self.batchReportRecordCount = Math.floor(self.batchReportRecordCount + 100);
                                    self.batchReportRecordCount = Math.max(self.batchReportRecordCount, 1);
                                    self.batchReportRecordCount = Math.min(self.batchReportRecordCount, 100);

                                    var lastRecTime = resultListToSend[resultListToSend.length - 1].timestamp;
                                    await self.setLastSyncedNonVerifyResultTime(lastRecTime);
                                }
                                else {
                                    console.log("edgeDeviceService reportNonVerifyResultTask 3", resendCount);

                                    self.batchReportRecordCount = Math.floor(self.batchReportRecordCount / 2);
                                    self.batchReportRecordCount = Math.max(self.batchReportRecordCount, 1);
                                    self.batchReportRecordCount = Math.min(self.batchReportRecordCount, 100);
                                }

                                var cntDelay = 1;
                                    while (self.run && cntDelay-- > 0 && !self.abordNonVerifyResultSyncLoop) {
                                        await delay(1000);
                                    }
                                // } while (!success);
                                //}

                                console.log("edgeDeviceService reportNonVerifyResultTask 4");

                                // if (success) {
                                await delay(1000); // avoid burst loop
                                continue;
                                // }
                            }
                        }
                    }
                }

                console.log("edgeDeviceService reportNonVerifyResultTask 5");

                let intervalCnt = self.reportNonVerifyResultInterval > 1000 ? self.reportNonVerifyResultInterval : 1000;
                //console.log("self.reportNonVerifyResultInterval : ", self.reportNonVerifyResultInterval);
                while (self.run && intervalCnt > 0) {
                    intervalCnt -= 1000;
                    await delay(1000);
                }

                console.log("edgeDeviceService reportNonVerifyResultTask 6");
            }
            self.nonVerifyResultSyncTaskRunning = false;

            console.log("edgeDeviceService reportNonVerifyResultTask end");
        }

        self.getLastVerifyResultSyncStatus = async function () {
            console.log("edgeDeviceService getLastVerifyResultSyncStatus start");

            return new Promise((resolve) => {
                fs.stat(self.edgeDeviceVerifyResultSyncStatusDataPath, function (err, stat) {
                    var statusData = {};
                    if (err == null) {
                        try {
                            statusData = JSON.parse(fs.readFileSync(self.edgeDeviceVerifyResultSyncStatusDataPath));
                        }
                        catch (e) {
                            console.log("edgeDeviceService getLastVerifyResultSyncStatus end 2", e);
                        }
                    } else if (err.code === 'ENOENT') {
                        statusData = {
                            last_sync_data_time: 0
                        };
                    } else {
                        statusData["read_error"] = "error";
                    }
                    console.log("edgeDeviceService getLastVerifyResultSyncStatus end 3");

                    resolve(statusData)
                });
            });
        };

        self.getLastNonVerifyResultSyncStatus = async function () {
            console.log("edgeDeviceService getLastNonVerifyResultSyncStatus start ");

            return new Promise((resolve) => {
                fs.stat(self.edgeDeviceNonVerifyResultSyncStatusDataPath, function (err, stat) {
                    var statusData = {};
                    if (err == null) {
                        try {
                            statusData = JSON.parse(fs.readFileSync(self.edgeDeviceNonVerifyResultSyncStatusDataPath));
                        }
                        catch (e) {
                            console.log("edgeDeviceService getLastNonVerifyResultSyncStatus end 2", e);
                        }
                    } else if (err.code === 'ENOENT') {
                        statusData = {
                            last_sync_data_time: 0
                        };
                    } else {
                        statusData["read_error"] = "error";
                    }

                    console.log("edgeDeviceService getLastNonVerifyResultSyncStatus end 3");
                    resolve(statusData)
                });
            });
        };

        self.setLastSyncedVerifyResultTime = async function (lastSyncedDataTime) {
            console.log("edgeDeviceService setLastSyncedVerifyResultTime start");

            try {
                if (!lastSyncedDataTime) self.abordVerifyResultSyncLoop = true;
                var dataToWrite = {
                    last_sync_data_time: lastSyncedDataTime ? lastSyncedDataTime : Date.now()
                };
                fs.writeFileSync(self.edgeDeviceVerifyResultSyncStatusDataPath, JSON.stringify(dataToWrite));
            } catch (e) {
                console.log("edgeDeviceService setLastSyncedVerifyResultTime end 2", e);
            } finally { }
            console.log("edgeDeviceService setLastSyncedVerifyResultTime end 3");

            return new Promise((resolve) => { resolve(); });
        };

        self.setLastSyncedNonVerifyResultTime = async function (lastSyncedDataTime) {
            console.log("edgeDeviceService setLastSyncedNonVerifyResultTime start");

            try {
                if (!lastSyncedDataTime) self.abordNonVerifyResultSyncLoop = true;
                var dataToWrite = {
                    last_sync_data_time: lastSyncedDataTime ? lastSyncedDataTime : Date.now()
                };
                fs.writeFileSync(self.edgeDeviceNonVerifyResultSyncStatusDataPath, JSON.stringify(dataToWrite));
            } catch (e) {
                console.log("edgeDeviceService setLastSyncedNonVerifyResultTime end 2", e);
            } finally { }
            console.log("edgeDeviceService setLastSyncedNonVerifyResultTime end 3");

            return new Promise((resolve) => { resolve(); });
        };

        self.getTenant = function () {
            var originTenant = { read_error: "error" };
            try {
                originTenant = JSON.parse(fs.readFileSync(self.edgeDeviceTenantDataPath));
            } catch (e) { } finally { }
            return originTenant;
        };

        self.setTenant = async function (tenant) {
            var newTenant = "";
            var originTenant = "";
            var tenantChanged = false;
            try {
                originTenant = JSON.stringify(self.getTenant());
                newTenant = JSON.stringify(tenant);
            } catch (e) { } finally { }
            // avoid too many data writting io hurt ssd
            if (originTenant !== newTenant) {
                try {
                    fs.writeFileSync(self.edgeDeviceTenantDataPath, newTenant);
                    tenantChanged = true;
                    await self.setLastSyncedVerifyResultTime(null);
                    await self.setLastSyncedNonVerifyResultTime(null);
                } catch (e) { } finally { }
            }
            return new Promise((resolve) => { resolve(tenantChanged); });
        };

        self.delTenant = async function () {
            try {
                fs.unlinkSync(self.edgeDeviceTenantDataPath);
                fs.unlinkSync(self.edgeDeviceVerifyResultSyncStatusDataPath);
                fs.unlinkSync(self.edgeDeviceNonVerifyResultSyncStatusDataPath);
            } catch (e) { } finally { }
            return new Promise((resolve) => { resolve(); });
        };

        self.interruptPersonGenerateDatabase = async function () {
            self.interruptPersonDatabaseGenerating = true;
            while (self.run && self.personDatabaseGenerating) await delay(1000);
            return new Promise((resolve) => {
                resolve();
            });
        }

        self.syncPersonDatabase = async function (targetTenant) {
            console.log("edgeDeviceService syncPersonDatabase start");

            self.personDatabaseGenerating = true;
            self.interruptPersonDatabaseGenerating = false;

            if (targetTenant && targetTenant.tenant_uuid) {
                let dbExistPersonList = null;
                try {
                  if (self.callbackForRequireCurrentPersonList) {
                      dbExistPersonList = [];

                      var personList = await self.callbackForRequireCurrentPersonList();
                      if (personList) {
                          personList.forEach(person => {
                              dbExistPersonList.push({
                                  person_uuid: person.person_uuid,
                                  last_modify_date: person.last_modify_date
                              });
                          });
                      }
                  }
                } catch (e1) {console.log("edgeDeviceService syncPersonDatabase", e1)}

                var personUuidListOnServer = null;
                try {
                  personUuidListOnServer = await self.getDifferencePersonList(targetTenant, dbExistPersonList);
                } catch (e2) {console.log("edgeDeviceService syncPersonDatabase", e2)}

                // console.log("edgeDeviceService personUuidListOnServer", personUuidListOnServer);
                while (self.run && !self.interruptPersonDatabaseGenerating &&
                    personUuidListOnServer != null &&
                    personUuidListOnServer.person_update_list &&
                    personUuidListOnServer.person_update_list.length > 0) {

                    var personToUpdate = personUuidListOnServer.person_update_list.shift();
                    var lastRec = (personUuidListOnServer.person_update_list.length === 0);
                    if (self.callbackForPersonDataHaveToChange) {
                        var personData = null;
                        var pass = true;
                        switch (personToUpdate.action) {
                            case "add": {
                                var ret = await self.getPersonData(targetTenant, personToUpdate.person_uuid, lastRec);
                                pass = (ret != null && ret.data);
                                if (pass) personData = ret.data;
                            } break;
                            case "update": {
                                var ret = await self.getPersonData(targetTenant, personToUpdate.person_uuid, lastRec);
                                pass = (ret != null && ret.data);
                                if (pass) personData = ret.data;
                            } break;
                            case "delete": {
                            } break;
                        }
                        if (pass) await self.callbackForPersonDataHaveToChange(personToUpdate.action, personToUpdate.person_uuid, personData, lastRec);
                        else {
                            self.personListLastModifyDate = 0;
                            self.personDbLastModifyDate = 0;
                        }
                    }
                }
            }
            self.personDatabaseGenerating = false;
            return new Promise((resolve) => {
                console.log("edgeDeviceService syncPersonDatabase end");
                resolve();
            });
        }
        self.cleanupPersonDatabase = async function () {
            if (self.callbackForCleanupPersonDatabase) await self.callbackForCleanupPersonDatabase();
            return new Promise((resolve) => {
                resolve();
            });
        }
    };
    OnReportedToTenant = function (onReportedToTenant) {
        const self = this;
        self.callbackForReportedToTenant = onReportedToTenant;
    }

    OnRequireDeviceInfo = function (onRequireDeviceInfo) {
        const self = this;
        self.callbackForRequireDeviceInfo = onRequireDeviceInfo;
    }

    OnRequireCurrentPersonList = function (onRequireCurrentPersonList) {
        const self = this;
        self.callbackForRequireCurrentPersonList = onRequireCurrentPersonList;
    }

    OnCleanupPersonDatabase = function (onCleanupPersonDatabase) {
        const self = this;
        self.callbackForCleanupPersonDatabase = onCleanupPersonDatabase;
    }

    OnPersonDataHaveToChange = function (onPersonDataHaveToChange) {
        const self = this;
        self.callbackForPersonDataHaveToChange = onPersonDataHaveToChange;
    }

    OnRequireVerifyResult = function (onRequireVerifyResult) {
        const self = this;
        self.callbackForRequireVerifyResult = onRequireVerifyResult;
    }

    OnRequireNonVerifyResult = function (onRequireNonVerifyResult) {
        const self = this;
        self.callbackForRequireNonVerifyResult = onRequireNonVerifyResult;
    }

    changeTenantHost = async function (host, port, tokenKey) {
        const self = this;
        self.host = host;
        self.port = port;
        self.tokenKey = tokenKey;
    }

    setEnableTenant = async function (enable = true) {
        const self = this;
        self.enableTenant = enable;
    }

    start = async function () {
        console.log("edgeDeviceService start");

        const self = this;
        if (self.run) {
            return;
        }
        self.run = true;

        // console.log("edgeDeviceService start checkinTask") ;
        self.checkinTask();
        // console.log("edgeDeviceService start reportStatusTask") ;
        self.reportStatusTask();
        // console.log("edgeDeviceService start databaseMaintainTask") ;
        self.databaseMaintainTask();
        // console.log("edgeDeviceService start reportVerifyResultTask") ;
        self.reportVerifyResultTask();
        // console.log("edgeDeviceService start reportNonVerifyResultTask") ;
        self.reportNonVerifyResultTask();
        // console.log("edgeDeviceService start finish") ;

        self.running = true;
        while (
            self.run
            || self.checkinTaskRunning
            || self.reportStatusTaskRunning
            || self.databaseMaintainTaskRunning
            || self.verifyResultSyncTaskRunning
            || self.nonVerifyResultSyncTaskRunning
        ) {

            await delay(10000);
        }
        self.running = false;
    };

    stop = async function (timeout) {
        const self = this;
        self.run = false;
        let timeoutToCount = (timeout && timeout > 0) ? timeout : 0;
        let cnt = 0;

        while (self.running && (timeoutToCount === 0 ? true : (cnt < timeoutToCount))) {
            await delay(1000);
            if (timeoutToCount != 0) cnt += 1000;
        }
        console.log("edgeDevice Service stopped");
    };
}

module.exports = edgeDeviceService;
