"use strict";

import { AppGlobals } from 'workspace/globals'
import { Config } from 'core/config.gen';

const fs = require('fs');
import * as mongo from 'mongodb';

const httpRequest = require('request');
const edgeDeviceService = require("./edgeDeviceService");
import mongoConnection from '../mongoConnection';

export class edgeDeviceServiceHandler {

    _edgeDeviceService = null;
    _clientDeviceMap = new Map();

    constructor() {
        const self = this;
        self._edgeDeviceService = null;
        self._clientDeviceMap = new Map();
    }

    async getSystemInfo(rootPath) {
        // uuid
        let product_uuid = "";
        if (fs.existsSync(rootPath + "/edge_device_product_uuid.dat")) {
            try {
                product_uuid = await fs.readFileSync(rootPath + "/edge_device_product_uuid.dat", { encoding: 'utf-8' });
                product_uuid = product_uuid.replace('\r', '');
                product_uuid = product_uuid.replace('\n', '');
            }
            catch (ex) {
                console.log("getSystemInfo read edge_device_product_uuid.dat", ex);
            }
        } else {
            product_uuid = await fs.readFileSync('/sys/class/dmi/id/product_uuid', { encoding: 'utf-8' });

            product_uuid = product_uuid.replace('\r', '');
            product_uuid = product_uuid.replace('\n', '');

            await fs.writeFileSync(rootPath + "/edge_device_product_uuid.dat", product_uuid, { encoding: 'utf-8' });
        }

        // mac
        let macaddress = [];
        let ipaddress = [];
        var network = require('network');
        await new Promise(function (resolve, reject) {
            network.get_interfaces_list(
                function (err, objs) {
                    if (objs) {
                        for (let i = 0; i < objs.length; i++) {
                            try {
                                macaddress.push(objs[i].mac_address.toLowerCase());
                                ipaddress.push(objs[i].ip_address.toLowerCase());
                            }
                            catch (ex) {
                                console.log("edgeDeviceServiceHandler getSystemInfo", ex);
                            }
                        }
                    }
                    resolve(null);
                }
            )
        })

        // license
        let license = [];
        let face_db_size = 0;

        let _licenseFileName = AppGlobals.license_file_name;

        let items = [];
        try {
            items = JSON.parse(fs.readFileSync(_licenseFileName).toString());
        } catch (ex) { console.log(ex); } finally { }

        AppGlobals.licenses = [];

        if (items) {
            if (!Array.isArray(items))
                items = [items];

            for (let i = 0; i < items.length; i++) {
                const data = items[i];

                if (data) {
                    // licenseVersion => 1 => airaFace, 2 => airaFace Lite, 3 => airaFace Pro
                    if ((data["license_version"] == 1) || (data["license_version"] == 2) || (data["license_version"] == 3)) {
                        if (macaddress.indexOf(data["mac"].toLowerCase()) >= 0) {
                            AppGlobals.licenses.push(data);
                            license.push((data["license_key"] || data["license"]));
                            face_db_size += +data["face_db_size"];
                        }
                    }
                }
            }
        }

        var systemInfo = {
            "uuid": product_uuid,
            "device_type": "airaFace",
            "fw_version": "1.01.011",
            "ip": ipaddress.join(','),
            "license": license.join(','),
            "face_db_size": face_db_size,
            "wifi_mac": "",
            "eth_mac": macaddress.join(',')
        }

        return systemInfo;
    }

    async removeAllNow() {
        let client = mongoConnection.getClientConnection();

        await client.db("frsDB").collection("person_database").deleteMany({})
        await client.db("freDB").collection("face_database").deleteMany({})

        await client.db("freDB").collection("facedatabase_info").findOneAndUpdate({},
            {
                "face_database_last_updates": (new Date).getTime(),
                "_created_at": new Date(new Date().toUTCString()),
                "_updated_at": new Date().toISOString()
            }
        );
    }

    async getCurrentPersonList() {
        console.log("edgeDeviceServiceHandler getCurrentPersonList");

        let client = mongoConnection.getClientConnection();

        let record_database = [];
        let total = await client.db("frsDB").collection("person_database").find({}).count();
        let page = Math.floor(total / 1000);
        if (page * 1000 != total) page++;

        let pageResult = [];
        for (let i = 0; i < page; i++) {
            pageResult = await client.db("frsDB").collection("person_database").find({})
                .skip(i * 1000)
                .limit(1000)
                .toArray();
            record_database = [...record_database, ...pageResult];
        }

        record_database = record_database || [];

        console.log("edgeDeviceServiceHandler getCurrentPersonList", record_database.length);

        return record_database;
    }

    async getPersonData(personId) {
        console.log("edgeDeviceServiceHandler getPersonData", personId);

        let client = mongoConnection.getClientConnection();
        let person = await client.db("frsDB").collection("person_database").findOne({ "person_info.person_uuid": personId }, { _id: 1 });

        if (person)
            console.log("edgeDeviceServiceHandler getPersonData", personId, person.person_info.fullname);
        else
            console.log("edgeDeviceServiceHandler getPersonData");

        return person || {};
    }

    async getPersonVerifyResult(startTime, endTime, amount) {
        console.log("edgeDeviceServiceHandler getPersonVerifyResult", startTime, endTime, amount);

        const self = this;

        let client = mongoConnection.getClientConnection();

        if (client) {
            let tablets = await client.db("airaFace").collection("Tablet").find({}).toArray();
            tablets.forEach(tbl => {
                self._clientDeviceMap.set(tbl.identity, tbl.name);
            });
        }

        const fsp = require('fs').promises;
        if (fs.existsSync("../fcsExecuter/fcs.config")) {
            let records = await fsp.readFile("../fcsExecuter/fcs.config");

            let cameras = [];
            try {
                cameras = JSON.parse(records);
            } catch (ex) { console.log(ex); } finally { }

            cameras.forEach(cam => {
                self._clientDeviceMap.set(cam.sourceid, cam.location);
            });
        }

        let records = await client.db("airaFace").collection("RecognizedUser").find({ "timestamp": { "$gte": startTime, "$lt": endTime } })
            .sort({ timestamp: 1 })
            .limit(amount)
            .toArray();

        records.forEach(rec => {
            rec.channel_uuid = rec.channel;
            rec.channel_name = self._clientDeviceMap.get(rec.channel);
        });

        console.log("edgeDeviceServiceHandler getPersonVerifyResult", startTime, endTime, records.length);

        return records || [];
    }

    async getPersonNonVerifyResult(startTime, endTime, amount) {
        console.log("edgeDeviceServiceHandler getPersonNonVerifyResult", startTime, endTime, amount);

        const self = this;

        let client = mongoConnection.getClientConnection();

        if (client) {
            let tablets = await client.db("airaFace").collection("Tablet").find({}).toArray();
            tablets.forEach(tbl => {
                self._clientDeviceMap.set(tbl.identity, tbl.name);
            });
        }

        const fsp = require('fs').promises;
        if (fs.existsSync("../fcsExecuter/fcs.config")) {
            let records = await fsp.readFile("../fcsExecuter/fcs.config");

            let cameras = [];
            try {
                cameras = JSON.parse(records);
            } catch (ex) { console.log(ex); } finally { }

            cameras.forEach(cam => {
                self._clientDeviceMap.set(cam.sourceid, cam.location);
            });
        }

        let records = await client.db("airaFace").collection("UnRecognizedUser").find({ "timestamp": { "$gte": startTime, "$lt": endTime } })
            .sort({ timestamp: 1 })
            .limit(amount)
            .toArray();

        records.forEach(rec => {
            rec.channel_uuid = rec.channel;
            rec.channel_name = self._clientDeviceMap.get(rec.channel);
        });

        console.log("edgeDeviceServiceHandler getPersonNonVerifyResult", records.length);
        return records || [];
    }

    async getVerifySnapshot(fileName) {
        let client = mongoConnection.getClientConnection();
        let record = await client.db("frsDB").collection("verify_face").findOne({ "name": fileName });
        let snap = "";
        if (record) {
            snap = new Buffer(record.imagedata.read(0, record.imagedata.length())).toString('base64');
        }
        else {
            console.log("getVerifySnapshot", fileName);
        }

        return snap || "";
    }

    async checkDepartment(deptNames) {
        let client = mongoConnection.getClientConnection();

        let depts = deptNames.split(',');

        var ret = [];

        for (let i = 0; i < depts.length; i++) {
            const dName = depts[i];

            let departments = await client.db("airaFace").collection("Department").find({ name: dName }).toArray();

            if (departments.length <= 0) {
                var data = {
                    _id: new mongo.ObjectID().toHexString(),
                    code: '',
                    name: dName,
                    description: ''
                };
                await client.db("airaFace").collection("Department").insertOne(data);

                ret.push({ id: data._id, name: data.name });
            }
            else {
                ret.push({ id: departments[0]._id, name: departments[0].name });
            }
        }

        return ret;
    }

    async checkAssignGroup(groups) {
        let client = mongoConnection.getClientConnection();

        // let groups = assigngroups.split(',') ;

        var ret = [];

        for (let i = 0; i < groups.length; i++) {
            const gName = groups[i];

            let personGroups = await client.db("frsDB").collection("person_group_database").find({ name: gName }).toArray();

            if (personGroups.length <= 0) {
                var data = {
                    _id: new mongo.ObjectID(),
                    name: gName,
                    group_info: { actions: [] },
                    assgined_by_manager: true,
                    create_time: Date.valueOf(),
                    last_modify_time: Date.valueOf()
                };
                await client.db("frsDB").collection("person_group_database").insertOne(data);

                ret.push({ id: data._id.toHexString(), groupname: data.name });
            }
            else {
                ret.push({ id: personGroups[0]._id, groupname: personGroups[0].name });
            }
        }

        return ret;
    }

    async init(rootPath, settings) {
        const self = this;

        self._edgeDeviceService = new edgeDeviceService(settings.manager_host, settings.manager_port, settings.manager_token_key, rootPath, settings.manager_enable);
        if (settings.manager_enable) {
            self._edgeDeviceService.OnRequireDeviceInfo(async function () {
                return new Promise((resolve) => {
                    resolve(
                        self.getSystemInfo(rootPath)
                    );
                })
            });
            self._edgeDeviceService.OnReportedToTenant(async function (success, ts) {

            });

            self._edgeDeviceService.OnCleanupPersonDatabase(async function () {
                // global.airaFaceLitePersonDb.removeAllNow();
                self.removeAllNow();
            });

            self._edgeDeviceService.OnRequireCurrentPersonList(async function () {
                let currentPersonList = [];
                try {
                    var personList = await self.getCurrentPersonList();
                    if (personList) personList.forEach(person => {
                        currentPersonList.push({
                            // person_uuid: person._id,
                            person_uuid: person.person_info.person_uuid,
                            last_modify_date: person.person_info.manager_last_modify_date
                        });
                    });
                } catch (e1) { console.log("OnRequireCurrentPersonList", e1); };

                return new Promise((resolve) => {
                    resolve(currentPersonList);
                });
            });

            self._edgeDeviceService.OnRequireVerifyResult(async function (startTime, endTime, amount) {
                let resultListToSend = null;

                console.log("OnRequireVerifyResult", startTime, endTime, amount);
                // OnRequireVerifyResult 1659505785066 1659515386624 100

                const listFromDb = await self.getPersonVerifyResult(startTime, endTime, amount);

                if (listFromDb) {
                    resultListToSend = [];
                    for (let i = 0; i < listFromDb.length; i++) {
                        let rec = listFromDb[i];

                        var verifyModeConverted = 0;
                        switch (rec.verify_mode) {
                            case 1: verifyModeConverted = 0; break;
                            case 2: verifyModeConverted = 0; break;
                            case 3: verifyModeConverted = 1; break;
                            case 4: verifyModeConverted = 2; break;
                            default: verifyModeConverted = 0; break;
                        };

                        let snap = await self.getVerifySnapshot(rec.snapshot);

                        let data = {
                            verify_uuid: rec._id,
                            target_score: rec.target_score,
                            verify_score: rec.score,
                            timestamp: rec.timestamp,
                            high_temperature: rec.high_temperature || 0,
                            temperature: rec.temperature || 0,
                            verify_mode: verifyModeConverted, //  0 pass-mode, 1 clock-in, 2 clock-out, 3, 4
                            person_uuid: rec.person_info.person_uuid,
                            channel_uuid: rec.channel_uuid,
                            channel_name: rec.channel_name,
                            captured_image: snap
                        };

                        resultListToSend.push(data);
                    }
                    console.log("OnRequireVerifyResult", resultListToSend.length);
                }

                return new Promise((resolve) => {
                    resolve(resultListToSend);
                });
            });

            self._edgeDeviceService.OnRequireNonVerifyResult(async function (startTime, endTime, amount) {
                let resultListToSend = null;

                console.log("OnRequireNonVerifyResult", startTime, endTime, amount);
                // OnRequireNonVerifyResult 1659505785066 1659515386624 100

                const listFromDb = await self.getPersonNonVerifyResult(startTime, endTime, amount);

                if (listFromDb) {
                    resultListToSend = [];
                    for (let i = 0; i < listFromDb.length; i++) {
                        let rec = listFromDb[i];

                        let snap = await self.getVerifySnapshot(rec.snapshot);

                        let score = 0.0;
                        if (rec.highest_score)
                            score = rec.highest_score.score || 0.0;

                        let data = {
                            verify_uuid: rec._id,
                            target_score: rec.target_score,
                            verify_score: score,
                            timestamp: rec.timestamp,
                            high_temperature: rec.high_temperature || 0,
                            temperature: rec.temperature || 0,
                            card_number: rec.card_number || "",
                            channel_uuid: rec.channel_uuid,
                            channel_name: rec.channel_name,
                            captured_image: snap
                        };

                        resultListToSend.push(data);
                    }

                    console.log("OnRequireNonVerifyResult", resultListToSend.length);
                    // console.log("OnRequireNonVerifyResult", resultListToSend);
                }
                return new Promise((resolve) => {
                    resolve(resultListToSend);
                });
            });

            self._edgeDeviceService.OnPersonDataHaveToChange(async function (action, personUuid, personData, lastRecord) {
                var dataToWrite = {};

                if (personData) {
                    let dept = [];
                    if (personData.extra_info) {
                        if (personData.extra_info.department) {
                            dept = await self.checkDepartment(personData.extra_info.department);
                        }
                    }

                    let assignGroup = [];
                    if (personData.group_list) {
                        assignGroup = await self.checkAssignGroup(personData.group_list);
                    }

                    if (personData.assigned_group_list) {
                        assignGroup = await self.checkAssignGroup(personData.assigned_group_list);
                    }

                    dataToWrite = {
                        person_info: {
                            fullname: personData.name,
                            employeeno: personData.id,
                            email_address: personData.extra_info ? personData.extra_info.email ? personData.extra_info.email : "" : "",
                            group_list: assignGroup,
                            department_list: dept,
                            cardno: personData.card_facility_code + personData.card_number,
                            expiration_date: personData.expire_date == 0 ? "" : new Date(personData.expire_date).toISOString().split('T')[0],
                            organization: personData.extra_info ? personData.extra_info.organization ? personData.extra_info.organization[0] : "" : "",
                            title: personData.extra_info ? personData.extra_info.title ? personData.extra_info.title : "" : "",
                            mobile: personData.extra_info ? personData.extra_info.phone_number ? personData.extra_info.phone_number : "" : "",
                            relation_to_name: "",
                            relationship: "",
                            headshot: personData.display_image ? personData.display_image : "",
                            manager_last_modify_date: personData.last_modify_date
                        }
                    };
                }

                switch (action) {
                    case "add": {
                        // dataToWrite["person_id"] = personUuid ;
                        // dataToWrite["_id"] = personUuid;

                        dataToWrite["person_info"]["person_uuid"] = personUuid;

                        if (personData.register_image) {
                            dataToWrite["image"] = personData.register_image;
                        }

                        await new Promise((resolve) => {
                            var httpsParam = Object.assign({}, {
                                method: "POST",
                                timeout: 5000,
                                pool: { maxSockets: 10 },
                                rejectUnauthorized: false,
                                requestCert: true,
                                time: true,
                            });
                            httpsParam["url"] = `http://127.0.0.1:${Config.core.port}/persons`;
                            httpsParam["headers"] = {
                                "Content-Type": "application/json",
                                "sessionId": "83522758"
                            };
                            httpsParam["json"] = dataToWrite;
                            httpRequest(httpsParam, function (error, response, body) {
                                if (error) {
                                    console.log("OnPersonDataHaveToChange add persons", error);
                                    resolve(null);
                                }
                                else {
                                    console.log("OnPersonDataHaveToChange add persons", body);

                                    if (body.message === "ok" && body) resolve(body);
                                    else resolve(null);
                                }
                            });
                        });
                    } break;
                    case "update": {
                        // {
                        //     id: 'A-0001',
                        //     name: 'John',
                        //     card_facility_code: '',
                        //     card_number: '84325746',
                        //     begin_date: 1607702400000,
                        //     expire_date: 0,
                        //     group_list: [ 'Classify-1', 'Classify-2' ],
                        //     assigned_group_list: [ 'Group-1', 'Group-2', 'All Person' ],
                        //     display_image: '',
                        //     register_image: '/9j/4A, ...'
                        //     extra_info: {
                        //       title: 'Job Title',
                        //       department: 'Department-2',
                        //       organization: [ 'Organization-1', 'Organization-2' ],
                        //       email: 'john@abc.com.tw',
                        //       phone_number: '0912345678',
                        //       extension_number: '2585',
                        //       remarks: ''
                        //     },
                        //     person_uuid: '9beaf55b-4f91-4015-81b6-ecc3c94639d7',
                        //     create_date: 1657619201100,
                        //     last_modify_date: 1657961419777,
                        //     as_admin: false,
                        //     face_feature: '7kbMvEnrHL0U...'
                        //   }


                        let exitPerson = await self.getPersonData(personUuid);

                        dataToWrite["objectId"] = "";
                        dataToWrite["person_id"] = exitPerson["_id"];

                        dataToWrite["person_info"]["person_uuid"] = personUuid;

                        if (personData.register_image) {
                            dataToWrite["face_id_numbers"] = exitPerson["face_id_numbers"];
                            dataToWrite["image"] = personData.register_image;
                        }

                        await new Promise((resolve) => {
                            var httpsParam = Object.assign({}, {
                                method: "PUT",
                                timeout: 5000,
                                pool: { maxSockets: 10 },
                                rejectUnauthorized: false,
                                requestCert: true,
                                time: true,
                            });
                            httpsParam["url"] = `http://127.0.0.1:${Config.core.port}/persons`;
                            httpsParam["headers"] = {
                                "Content-Type": "application/json",
                                "sessionId": "83522758"
                            };
                            httpsParam["json"] = dataToWrite;
                            httpRequest(httpsParam, function (error, response, body) {
                                if (error) {
                                    console.log("OnPersonDataHaveToChange put persons", error);
                                    resolve(null);
                                }
                                else {
                                    // console.log("OnPersonDataHaveToChange update persons", body);

                                    if (body.message === "ok" && body) resolve(body);
                                    else resolve(null);
                                }
                            });
                        });
                    } break;
                    case "delete": {
                        let exitPerson = await self.getPersonData(personUuid);

                        dataToWrite["objectId"] = "";
                        dataToWrite["person_id"] = exitPerson["_id"];

                        await new Promise((resolve) => {
                            var httpsParam = Object.assign({}, {
                                method: "DELETE",
                                timeout: 5000,
                                pool: { maxSockets: 10 },
                                rejectUnauthorized: false,
                                requestCert: true,
                                time: true,
                            });
                            httpsParam["url"] = `http://127.0.0.1:${Config.core.port}/persons`;
                            httpsParam["headers"] = {
                                "Content-Type": "application/json",
                                "sessionId": "83522758"
                            };
                            httpsParam["json"] = dataToWrite;
                            httpRequest(httpsParam, function (error, response, body) {
                                if (error) {
                                    console.log("OnPersonDataHaveToChange delete persons", error);
                                    resolve(null);
                                }
                                else {
                                    // console.log("OnPersonDataHaveToChange delete persons", body);

                                    if (body.message === "ok" && body) resolve(body);
                                    else resolve(null);
                                }
                            });
                        });
                    } break;
                }

                if (lastRecord) {
                    // global.airaFaceLitePersonDb.flush();
                }
            });

            self._edgeDeviceService.start();
        }
    }

    async run(rootPath) {
        const self = this;
        console.log("====================================================");
        console.log("edgeDeviceServiceHandler run", Config.manager.enable);

        if (Config.manager.enable) {
            var settings = {
                manager_host: Config.manager.host,
                manager_port: Config.manager.port,
                manager_token_key: Config.manager.token_key,
                manager_enable: Config.manager.enable
            }

            self.init(rootPath, settings);
        }
        else {
            // console.log("edgeDeviceServiceHandler run 22222");

            self.getSystemInfo(rootPath);
        }
    };
}

// module.exports = edgeDeviceServiceHandler;
