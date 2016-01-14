var fs = require('fs')
var http = require('http')
var debug = require('debug')('relayr:cert')

var CERT = __dirname + '/relayr.crt'

function check (callback) {
  fs.exists(CERT, function (exists) {
    if (exists) return callback()

    debug('token missing')

    var file = fs.createWriteStream(CERT)
    http.get('http://mqtt.relayr.io/relayr.crt', function (response) {
      response.pipe(file)
      debug('retreiving token')
      response.on('end', function () {
        debug('token retrieved')
        callback()
      })
    })
  })
}

module.exports = {
  CERT: CERT,
  check: check
}
