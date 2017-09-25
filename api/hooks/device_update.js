var ISY = require('isy-js')

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
      sails.after('hook:device_init:loaded', () => {
        console.log('Updating device names...')
        var deviceList = sails.hooks.isy.connection().getDeviceList()
        var updatePromises = deviceList.map(d => {
          return new Promise((resolve, reject) => {
            Device.update({ address: d.address }, { name: d.name }).exec((err, records) => {
              if (err) {
                console.log(`Error updating device ${d.name}`)
                reject(err)
              }
              resolve(records.length)
            })
          })
        })
        Promise.all(updatePromises).then(results => {
          var updated = results.reduce(function (pv, cv) { return pv + cv }, 0)
          console.log(`Updated ${updated} device records`)
          return cb()
        }, reason => {
          throw reason
        })
      })
    }
  }
}
