"use strict";
const shell = require("shelljs");
const fs = require("fs");
var udp = require('dgram');

const delay = (interval) => {
    return new Promise((resolve) => {
        setTimeout(resolve, interval);
    });
};

function decimalAdjust(type, value, exp) {
    type = String(type);
    if (!["round", "floor", "ceil"].includes(type)) {
        throw new TypeError(
            "The type of decimal adjustment must be one of 'round', 'floor', or 'ceil'.",
        );
    }
    exp = Number(exp);
    value = Number(value);
    if (exp % 1 !== 0 || Number.isNaN(value)) {
        return NaN;
    } else if (exp === 0) {
        return Math[type](value);
    }
    const [magnitude, exponent = 0] = value.toString().split("e");
    const adjustedValue = Math[type](`${magnitude}e${exponent - exp}`);
    // Shift back
    const [newMagnitude, newExponent = 0] = adjustedValue.toString().split("e");
    return Number(`${newMagnitude}e${+newExponent + exp}`);
}

class dataProcessor {
    constructor(verifyInterval = 2000, maxQueSize = 200) {
        const self = this;
        self.verifyInterval = verifyInterval ? verifyInterval : 2000;
        self.maxQueSize = maxQueSize ? maxQueSize : 200;
        self.toProcessQue = [];
        self.verifiedQue = [];

        self.udpServer = udp.createSocket('udp4');

        self.udpServer.on('error', function (error) {
            console.log('Error: ' + error);
            self.udpServer.close();
        });
        self.udpServer.on('listening', function () {
            var address = self.udpServer.address();
            var port = address.port;
            var family = address.family;
            var ipaddr = address.address;
            self.udpServer.setRecvBufferSize(100000000); // 100mb
            console.log('Server is listening at port' + port);
            console.log('Server ip :' + ipaddr);
            console.log('Server is IP4/IP6 : ' + family);
        });
        self.faceRecvCnt = 0;
        self.udpServer.on('message', async function (msg, info) {
            // msg = msg.toString('utf8');
            // msg = msg.substr(1);

            // console.log("self.toProcessQue.length :", self.toProcessQue.length);
            if (self.toProcessQue.length < self.maxQueSize) {
                self.toProcessQue.push(msg);
                // try {
                //     console.log("message ", JSON.parse(msg).verify_uuid);
                // }
                // catch(ex) {
                //     console.log("message catch", ex);
                // }
            }
            else console.log("drop data ");

        });

        self.udpServer.on('close', function () {
            console.log('Socket is closed !');
        });

        self.udpServer.bind(5552);

        // self.verifyRecycleLoop = async function () {
        //     while (true) {
        //         var tocleanTime = Date.now() - self.verifyInterval;
        //         var remain = self.verifiedQue.filter(v => {
        //             return tocleanTime < v.timestamp;
        //         });
        //         self.verifiedQue = remain;
        //         await delay(1000);
        //     }
        // };

        self.serviceLoop = async function () {
            while (true) {
                while (self.toProcessQue.length > 0) {
                    var msg = self.toProcessQue.shift();
                    var image = null;
                    var data = null;
                    try {
                        msg = msg.toString('utf8');
                        msg = msg.substr(4);
console.log("555", msg);
                        data = JSON.parse(msg.toString());
                        console.log("serviceLoop", data.timestamp, data.source_uuid, data.algorithm);

                        switch(data.algorithm) {
                            case "zone_detect":
                                // {
                                //     "timestamp":1728635393442,
                                //     "source_uuid":"334cfe82-3475-4cb2-ba2b-27d77d53b5a1",
                                //     "algorithm_uuid":"222",
                                //     "algorithm":"zone_detect",
                                //     "data_objects":[
                                //         {
                                //             "object_uuid":"426ccf0b-70af-4074-9941-04b40df154a3",
                                //             "pos":{"x1":0.413692,"y1":0.425158,"x2":0.580743,"y2":0.998148}
                                //         }
                                //     ]
                                // }
                                console.log("serviceLoop", data.data_objects);
                                break;
                            case "zone_monitor":
                                // {
                                //     "timestamp":1728637373879,
                                //     "source_uuid":"334cfe82-3475-4cb2-ba2b-27d77d53b5a1",
                                //     "algorithm_uuid":"123",
                                //     "algorithm":"zone_monitor",
                                //     "dwell":true,
                                //     "dwell_objects":[
                                //         {
                                //             "dwell_time":4,
                                //             "object_rect":{"x":228,"y":289,"w":146,"h":246}
                                //         }
                                //     ],
                                //     "depart":false
                                // }
                                console.log("serviceLoop", data.dwell, data.depart);
                                break;
                        }
                    }
                    catch (e) {
                        console.log( e );
                    }
                    //console.log( data.timestamp )

                    if (data) {
                        var dataToInsert = data ;

                        switch(data.algorithm) {
                            case "zone_detect":
                                global.standaloneZoneDetectResult.insertData(data.timestamp, dataToInsert);
                                break;
                            case "zone_monitor":
                                global.standaloneZoneMonitorResult.insertData(data.timestamp, dataToInsert);
                                break;
                            case "cross_line":
                                global.standaloneCrossLineResult.insertData(data.timestamp, dataToInsert);
                                break;
                        }

                        var dataToSend = data ;

                        global.sendVerifyResultToMain(dataToSend);
                    }
                    await delay(0);
                }
                await delay(100);
            }
        };
        // self.verifyRecycleLoop();
        self.serviceLoop();
    };
}

module.exports = dataProcessor;
