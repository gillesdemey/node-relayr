# node-relayr

Relayr sensor SDK for node.

Works by connecting to the MQTT channel associated with your Relayr connected
device.

## Status
This is still not much more thatn a utiity script, but will grow to expose a
lot more useful functionality.

## installation

```
npm install relayr
```

## connecting

Require the module

```javascript
var Relayr = require('relayr');
```

Get the following from your account at relayr.io

```javascript
var app_id = "YOURAPPID";
var dev_id = "YOURDEVICEID";
var token  = "YOURSENSORTOKEN";
```

Initialise the libary

```javascript
var relayr = new Relayr(app_id);
```

Connect using the keys:

```javascript
relayr.connect(token, dev_id);
```

Listen and do stuff

```javascript
relayr.on('data', function (topic, msg) {
        console.log(topic + ":" + msg);
}
```

Listen to a specific device

```javascript
var deviceId = 'af62797a-73db-492d-8aa9-0c0263612512';
relayr.on(deviceId, function (topic, msg) {
        console.log(topic + ":" + msg);
}
```

Send a Command

```javascript
relayr.command(token, dev_id,
    {
        path:"led",
        command:"led",
        value:true
    },
    function (err,code) {
        console.log(err||code)
    });
```

get Info about the registered user

```javascript
relayr.user(token, function (err, user) {
    console.log(err || user);
}
```

get Info about the users devices

```javascript
relayr.devices(user_id, token, function (err, devices) {
    console.log(err || devices);
}
```

get Info about the an individual device

```javascript
relayr.deviceModel(token, dev_id, function (err, model) {
    console.log(err || model);
}
```

## Credits
Big thanks to ***BinaryMax*** for putting in the ground work for this library.

## License
MIT License
