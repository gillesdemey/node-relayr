/*
 * run with bunyan to et sensible logging:
 * node examples/getUser.js | bunyan -o short
 */
var Relayr = require("../");
var relayr = new Relayr();

var token = "BwwORoJcI9iKDN9NEHs1hXYOeCV3cEoS";


relayr.user(token, function (err, user) {
    console.log(err);

    
    relayr.devices(user.id, token, function (err, devices) {

        console.log(devices.length);
        devices.forEach(function (device) {
            if (device.model.id === "6fbb27dd-ac8f-4d1f-bd82-8d37405d8cfb") {
                console.log(device);
                relayr.connect(token, device.id);
            }
        });
        
    } );
});

relayr.on('connect', function () {
    console.log('connect');
})
relayr.on('data', function (topic, msg) {
    console.log("TOPIC:"+topic);
    console.log(msg);
});

