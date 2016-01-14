var async = require('async')
var events = require('events')
var util = require('util')
var api = require('./apiHelper')
var certificates = require('./certificate')
var RMQTT = require('./rMQTT')
var debug = require('debug')('relayr:core')

function Relayr (app_id) {
  events.EventEmitter.call(this)

  var mqtt = new RMQTT()
  var self = this

  mqtt.on('data', function (topic, msg) {
    self.emit('data', topic, msg)
  })

  mqtt.on('connect', function () {
    self.emit('connect')
  })

  mqtt.on('close', function () {
    self.emit('close')
  })

  this.mqtt = mqtt
  this.channels = {}

  debug('Relayr created')
}
util.inherits(Relayr, events.EventEmitter)

Relayr.prototype.user = api.user
Relayr.prototype.devices = api.devices
Relayr.prototype.device = api.device
Relayr.prototype.command = api.command

Relayr.prototype.connections = api.channels

/**
 * Unsubscribe from all channels and disconnect from the MQTT server
 */
Relayr.prototype.disconnect = function (token, callback) {
  var self = this

  var devices = Object.keys(this.channels)
  async.each(devices, function (device, callback) {
    self.unsubscribe(token, device, callback)
  }, function done (err) {
    if (err) return callback(err)
    self.mqtt.disconnect(callback)
  })
}

Relayr.prototype.deviceModel = function (token, dev_id, callback) {
  this.device(token, dev_id, function (err, dev) {
    debug('ERROR', err, dev)
    if (err) {
      callback(err)
    } else {
      api.deviceModel(token, dev.model.id, callback)
    }
  })
}

Relayr.prototype.unsubscribe = function (token, dev_id, callback) {
  api.deleteChannel(token, this.channels[dev_id].channelId, function (err) {
    if (err) {
      debug('unable to delete channel for %s', token, err)
    } else {
      debug('channel deleted')
    }
    callback(err)
  })
}

Relayr.prototype.connect = function (token, dev_id) {
  var mqtt = this.mqtt
  var channels = this.channels
  debug('connecting...')

  certificates.check(function () {
    debug('creating channel for %s:%s', token, dev_id)
    api.createChannel(token, dev_id, function (err, data) {
      if (err) {
        debug('unable to create channel for %s', token, err)
      } else {
        debug('created channel for %s', token)
        mqtt.connect(data)
        channels[dev_id] = data
      }
    })
  })
}

module.exports = Relayr
