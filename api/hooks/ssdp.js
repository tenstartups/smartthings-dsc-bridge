const SSDP = require('node-ssdp').Server
const LISTEN_INTERFACE = process.env.LISTEN_INTERFACE || 'eth0'
const SERVER_SETTINGS = require('js-yaml')
                        .safeLoad(require('fs')
                        .readFileSync(process.env.SETTINGS_FILE, 'utf8'))
                        .server || {}
const SSDP_SETTINGS = require('js-yaml')
                      .safeLoad(require('fs')
                      .readFileSync(process.env.SETTINGS_FILE, 'utf8'))
                      .ssdp || {}
const USN = `${SSDP_SETTINGS.usn_prefix || 'urn:schemas-upnp-org:service:DSCAlarmManager'}:${SERVER_SETTINGS.instance_number || 1}`
const UDN = SSDP_SETTINGS.udn || 'uuid:735c24c1-2cbe-46ef-97b3-92bca45ae8a3'

module.exports = (sails) => {
  var server
  var advertiseIP
  var advertisePort

  return {
    advertiseIP: function () {
      return advertiseIP
    },

    advertisePort: function () {
      return advertisePort
    },

    configure: () => {
    },

    defaults: {
       __configKey__: {
          _hookTimeout: 30000
       }
    },

    initialize: (cb) => {
      sails.after('hook:devsync:loaded', () => {
        advertiseIP = process.env.DEVICE_ADVERTISE_IP
        if (advertiseIP === undefined) {
          advertiseIP = require('ip').address()
          var ifaces = require('os').networkInterfaces()
          Object.keys(ifaces).forEach(dev => {
            ifaces[dev].filter(details => {
              if (dev === LISTEN_INTERFACE && details.family === 'IPv4' && details.internal === false) {
                advertiseIP = details.address
              }
            })
          })
        }

        advertisePort = process.env.DEVICE_ADVERTISE
        if (advertisePort === undefined) {
          advertisePort = sails.config.port
        }

        var location = `http://${advertiseIP}:${advertisePort}/api/devices`

        console.log(`Starting SSDP server advertising for USN: ${USN}, UDN: ${UDN}, Location: ${location}...`)

        server = new SSDP(
          {
            location: location,
            udn: UDN,
            sourcePort: 1900
          }
        )

        server.addUSN(USN)

        server.on('advertise-alive', (headers) => {
          // Expire old devices from your cache.
          // Register advertising device somewhere (as designated in http headers heads)
          // console.log(`Advertise alive for USN: ${USN}, UDN: ${UDN}, Location: ${location}`)
        })

        server.on('advertise-bye', (headers) => {
          // Remove specified device from cache.
          // console.log(`Advertise bye for USN: ${USN}, UDN: ${UDN}, Location: ${location}`)
        })

        server.start()

        process.on('exit', () => {
          // Advertise shutting down and stop listening
          server.stop()
        })

        console.log(`Started SSDP server advertising for USN: ${USN}, UDN: ${UDN}, Location: ${location}`)

        return cb()
      })
    }
  }
}
