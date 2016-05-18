'use strict'

var Relayr = require('./')
var tap = require('tap')

var appID = '8bfa18f9-9375-4d22-a557-c4af55841663'
var deviceID = '44c66621-4b88-43c4-a7d8-f5ab2f7a9379' // light sensor
var token = 'pn7dZCDSuoziYtm1ReAkvYecM5wxx7pg'

tap.test('should connect to Relayr MQTT', t => {
  var client = new Relayr(appID)

  client.connect(token, deviceID)
  client
    .once('connect', () => {
      t.end()
      client.disconnect()
    })
    .once('error', t.end)
})

tap.test('should throw error with false credentials', t => {
  var client = new Relayr(appID)

  client.connect('foo', deviceID)
  client
    .once('connect', () => {
      t.end(new Error('should not have connected'))
    })
    .once('error', () => {
      t.end()
    })
})
