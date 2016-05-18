var events = require('events')
var mqtt = require('mqtt')
var util = require('util')
var certificates = require('./certificate')
var debug = require('debug')('relayr:RMQTT')

function RMQTT () {
  this.client = undefined
  this.queue = {
    q: [],
    oldq: [],
    done: false,

    push: function (topic) {
      if (this.q.indexOf(topic) === -1) {
        this.q.push(topic)
      }
    },
    revert: function () {
      var self = this
      this.oldq.forEach(function (t) {
        self.push(t)
      })
      this.oldq = []
    },
    forget: function (topic) {
      var remove = function (arr) {
        var i = arr.indexOf(topic)
        arr.splice(i, 1)
      }
      remove(this.q)
      remove(this.oldq)
    },
    each: function (fn) {
      if (!this.q.length) return
      do {
        var topic = this.q.pop()
        fn(topic)
        this.oldq.push(topic)
      } while (this.q.length)
    }
  }

  events.EventEmitter.call(this)
  debug('RMQTT created')
}
util.inherits(RMQTT, events.EventEmitter)

RMQTT.prototype.subscribe = function (topic) {
  debug('subscribing to %s', topic)
  if (!this.client) return

  this.client.subscribe(topic, function (err, granted) {
    if (err) {
      debug(err, 'unable to subscribe to %s', topic)
    }
    debug('subscribed to %s', topic)
  })
}
RMQTT.prototype.unsubscribe = function (topic) {
  debug('unsubscribing from %s', topic)
  var q = this.queue
  this.client.unsubscribe({unsubscriptions: [topic]})
  q.forget(topic)
}

/**
 * Clean up after disconnect
 */
RMQTT.prototype.disconnect = function (callback) {
  if (!this.client) return
  this.client.end()
}

RMQTT.prototype.connect = function (channelInfo) {
  var self = this
  var creds = channelInfo.credentials

  if (!this.client) {
    debug('creating client')
    this.client = mqtt.connect({
      servers: [{'host': 'mqtt.relayr.io', 'port': 8883}],
      username: creds.user,
      password: creds.password,
      clientId: creds.clientId,
      protocol: 'mqtts',
      certPath: certificates.CERT,
      rejectUnauthorized: false
    })
    this.queue.revert()
    this.queue.push(creds.topic)
  } else {
    debug('client already created')
    if (!this.queue.done) {
      this.queue.push(creds.topic)
    } else {
      this.subscribe(creds.topic)
    }
    return
  }

  this.client.on('connect', function () {
    debug('connected', arguments)
    self.emit('connect')

    self.queue.each(function (topic) {
      self.subscribe(topic)
    })

    self.queue.done = true
  })

  this.client.on('error', function (error) {
    debug(error, 'connection error')
  })
  this.client.on('unsubscribe', function (err, packet) {
    if (err) self.emit('error', err)
    debug('unsubscribed from ' + packet.unsubscriptions)
  })

  // Added this feature to handle shaky internet connections
  // Close event is unfortunately called many times, so I needed
  // to introduce a gate to prevent mltiple new clients being created
  // I've pushed something working rather than something beautiful
  this.client.on('close', function (err) {
    if (err) this.emit('error', err)

    debug('connection closed')
    self.emit('close') // this could notionally be put inside the gate too
    self.client = undefined
  })

  this.client.on('message', function (topic, message, packet) {
    try {
      message = JSON.parse(new Buffer(message).toString('ascii'))
      self.emit('data', topic, message)
    } catch (ex) {
      debug(ex, 'connection error')
    }
  })
}

module.exports = RMQTT
