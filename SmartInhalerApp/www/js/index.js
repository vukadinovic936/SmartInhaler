//(c) Dastanbek Samatov

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*global mainPage, deviceList, refreshButton;
global detailPage, resultDiv, messageInput, sendButton, disconnectButton;
global ble;
jshint browser: true , devel: true;*/
'use strict';
// ASCII only
var start = 0;

var arr_data = [{time: start, value: 0}];
var arr = [{time: start, value: 0}];

//checks if string contains numbers
function hasNumber(str) {
  return /\d/.test(str);
}
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}
// This should be modified by the device's credentials
var pixljs = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
};

var choice = true;
var regex = /[+-]?\d+(\.\d+)?/g;


var start = 0;
var app = {
    initialize: function() {
        this.bindEvents();
        selectPage.hidden = false;
        mainPage.hidden = true;
        detailPage.hidden = true;
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        sendButton.addEventListener('click', this.sendData, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
        deviceList.addEventListener('touchstart', this.connect, false);
        inPascal.addEventListener('click', this.getInPa, false);
        inLiters.addEventListener('click', this.getInL, false);
         // assume not scrolling
    },
    onDeviceReady: function() {
        console.log("the device is ready")
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        deviceList.innerHTML = '';
        console.log("refreshing it"); // empties the list
        ble.scan([pixljs.serviceUUID], 5, app.onDiscoverDevice, app.onError);
        
        // if Android can't find your device try scanning for all devices
        // ble.scan([], 5, app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device) {
        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                device.id;
        console.log("discovered it");
        listItem.dataset.deviceId = device.id;
        listItem.innerHTML = html;
        deviceList.appendChild(listItem);
        console.log(
            JSON.stringify(device.name),
            JSON.stringify(device.id)
        );
    },


    connect: function(e) {
        console.log("connecting");
        var deviceId = e.target.dataset.deviceId, 
            onConnect = function(peripheral) {
                app.determineWriteType(peripheral);
                document.getElementById("info").innerHTML = "Pixl.js is Connected!";
                // subscribe for incoming data
                ble.startNotification(deviceId, pixljs.serviceUUID, pixljs.rxCharacteristic, app.onData, app.onError);
                sendButton.dataset.deviceId = deviceId;
                disconnectButton.dataset.deviceId = deviceId;
                resultDiv.innerHTML = "";
                app.showDetailPage();
            };

        ble.connect(deviceId, onConnect, app.onError);
    },
    determineWriteType: function(peripheral) {

        var characteristic = peripheral.characteristics.filter(function(element) {
            if (element.characteristic.toLowerCase() === pixljs.txCharacteristic) {
                return element;
            }
        })[0];

        if (characteristic.properties.indexOf('WriteWithoutResponse') > -1) {
            app.writeWithoutResponse = true;
        } else {
            app.writeWithoutResponse = false;
        }

    },
    getInL: function(){
        console.log("getting in L");
        choice = false;
        selectPage.hidden = true;
        mainPage.hidden = false;
        inPascal.hidden = true;
        inLiters.hidden = true;
    },
    getInPa: function(){
        console.log("getting in Pa");
        choice = true;
        selectPage.hidden = true;
        mainPage.hidden = false;
        inPascal.hidden = true;
        inLiters.hidden = true;
    },
    onData: function(data) { // data received from Espruino
        var str = bytesToString(data);
        console.log(str);
        var p = str.indexOf("Pa");
        var l = str.indexOf("l/s");
        //sometimes when there's a connection error, pixl.js sends error message,
        //this will identify it and if there's a number in the string, it converts it into
        //float, otherwise it sends the error message
            if (p==-1 && l==-1){
                resultDiv.innerHTML = resultDiv.innerHTML + str + "<br/>";
                resultDiv.scrollTop = resultDiv.scrollHeight;
            }
            else if (str.indexOf("Pa")>-1 && choice){
                var floats = str.match(regex).map(function(v) { return parseFloat(v);});
                resultDiv.innerHTML = resultDiv.innerHTML + str.substring(0, p+2) + "<br/>";
                resultDiv.scrollTop = resultDiv.scrollHeight;

                if(arr_data.length<6){
                    app.setGraph(arr_data, floats[0]);
                }
                //if the array has more than 10 results, it deletes the first result in the array
                //and just update the chart
                else{
                arr_data.shift();
                app.setGraph(arr_data, floats[0]);
                }
            }
            else if(str.indexOf("l/s")>-1 && !choice){
                if (str.indexOf('.')==-1){
                    str = str.slice(0, 1)+"."+str.slice(1);
                }
                resultDiv.innerHTML = resultDiv.innerHTML+str+"<br/>";
                resultDiv.scrollTop = resultDiv.scrollHeight;
                if (!hasNumber(str)){
                    resultDiv.innerHTML = resultDiv.innerHTML+str+"<br/>";
                }
                else{
                    var floats = str.match(regex).map(function(v) { return parseFloat(v);});
                    if(arr.length<6){
                        app.setGraph(arr, floats[0]);
                    }
                    //if the array has more than 10 results, it deletes the first result in the array
                    //and just update the chart
                    else{
                        arr.shift();
                        app.setGraph(arr, floats[0]);
                    }
                }
            }
            //there's an array that stores last 20 results from the sensor
    },
    setGraph : function(list, new_value){
        // prepare chart data
            // prepare jqxChart settings
            // create the chart
        var settings = {
        title: "Pressure",
            description: " ",
                enableAnimations: false,
                animationDuration: 500,
                showLegend: true,
                padding: { left: 0, top: 5, right: 5, bottom: 5 },
                titlePadding: { left: 0, top: 0, right: 0, bottom: 10 },
                source: list,
                xAxis:
                {
                dataField: 'time',
                baseUnit: 'second',
                unitInterval: 1,
                gridLines: { step: 2 },
                valuesOnTicks: true,
                },
                colorScheme: 'scheme03',
                seriesGroups:
                    [
                        {
                            type: 'spline',
                            columnsGapPercent: 10,
                            alignEndPointsWithIntervals: true,
                            valueAxis:
                            {   //min value is set according to the most displayed results
                                minValue: -50,
                                maxValue: 120,
                            },
                            series: [
                                { dataField: 'value', displayText: 'value', opacity: 1, lineWidth: 1, symbolType: 'circle', fillColorSymbolSelected: 'white', symbolSize: 1 }
                            ]
                        }
                    ]
            };
            $('#graphContainer').jqxChart(settings);
            var refreshTimeout = 500;
            var timerFunction = function () {
                if(list.length>7){
                    list.shift();
                }
                list.push({ time: list[list.length - 1].time + 0.5, 
                value: new_value });
                $("#graphContainer").jqxChart('update');
            };
            var ttimer = setInterval(timerFunction, refreshTimeout);
    },
    // send the signal to console that app is reveiving data
    sendData : function(event){
        console.log("received it");
    },
    //disconnect the device
    disconnect: function(event) {
        var deviceId = event.target.dataset.deviceId;
        start = 0;
        arr_data = [{time:start, value:0}];
        arr = [{time:start, value:0}];
        ble.disconnect(deviceId, app.showMainPage, app.onError);
    },
    //shows the main page
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    onError: function(reason) {
        alert("ERROR: " + JSON.stringify(reason)); // show the reason of the error
    }
};
app.initialize();