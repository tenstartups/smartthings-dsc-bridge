module.exports = (sails) => {
  return {
    configure: () => {
    },

    defaults: {
       __configKey__: {
          _hookTimeout: 30000
       }
    },

    initialize: (cb) => {
      sails.after('hook:device_update:loaded', () => {
        console.log('Forcing refresh of device states...')
        Device.find({ isAdvertised: true }).exec((err, devices) => {
          if (err) {
            throw err
          }
          devices.forEach(device => {
            Device.findTyped({ id: device.id, type: device.type })
            .then(device => {
              device.sendSmartThingsUpdate()
            })
            .catch(err => {
              throw err
            })
          })
          console.log('Forced a refresh of device states')
          return cb()
        })
      })
    }
  }
}
