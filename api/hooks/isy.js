var ISY = require('isy-js')
const ISY_SETTINGS = require('js-yaml')
                     .safeLoad(require('fs')
                     .readFileSync(process.env.SETTINGS_FILE, 'utf8'))
                     .isy || {}

module.exports = (sails) => {
  var connection

  return {
    connection: () => {
      return connection
    },

    configure: () => {
    },

    defaults: {
       __configKey__: {
          _hookTimeout: 30000
       }
    },

    initialize: (cb) => {
      sails.after('hook:orm:loaded', () => {
        console.log('Connecting to ISY994i home automation controller...')

        connection = new ISY.ISY(
          ISY_SETTINGS.address,
          ISY_SETTINGS.user,
          ISY_SETTINGS.password,
          false, // No support for ELK
          (isy, device) => {
            Device.findTyped({ type: device.deviceType, address: device.address })
            .then(device => {
              device.sendSmartThingsUpdate()
            })
            .catch(err => {
              throw err
            })
          },
          ISY_SETTINGS.useSSL,
          true, // Include scenes in the device list
          ISY_SETTINGS.debug,
          (isy, device) => {} // Variable changed callback
        )

        connection.initialize(() => {
          console.log('Connected to ISY994i home automation controller')
          return cb()
        })
      })
    }
  }
}
