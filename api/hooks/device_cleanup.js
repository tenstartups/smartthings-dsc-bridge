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
      sails.after('hook:isy:loaded', () => {
        console.log('Deleting obsolete device records...')
        var deviceList = sails.hooks.isy.connection().getDeviceList()
        Device.destroy(
          { address: { '!': deviceList.map(d => { return d.address }) } }
        ).exec((err, records) => {
          if (err) {
            console.log('Error deleting obsolete device records')
            throw err
          }
          console.log(`Deleted ${records.length} obsolete device records`)
          return cb()
        })
      })
    }
  }
}
