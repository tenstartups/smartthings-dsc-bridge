const PARTITION_SETTINGS = require('js-yaml')
                         .safeLoad(require('fs')
                         .readFileSync(process.env.SETTINGS_FILE, 'utf8'))
                         .partitions || {}
const ZONE_SETTINGS = require('js-yaml')
                    .safeLoad(require('fs')
                    .readFileSync(process.env.SETTINGS_FILE, 'utf8'))
                    .zones || {}

module.exports = (sails) => {
  function deviceList () {
    var partitions = PARTITION_SETTINGS.map(partitionAttrs => {
      return {
        uid: `partition_${partitionAttrs['number']}`,
        type: 'Partition',
        name: partitionAttrs['name']
      }
    })
    var zones = ZONE_SETTINGS.map(zoneAttrs => {
      var type
      if (zoneAttrs['type'] === 'contact') {
        type = 'ContactZone'
      } else if (zoneAttrs['type'] === 'motion') {
        type = 'MotionZone'
      } else if (zoneAttrs['type'] === 'fire') {
        type = 'FireZone'
      }
      return {
        uid: `zone_${zoneAttrs['number']}`,
        type: type,
        name: zoneAttrs['name']
      }
    })
    return [...partitions, ...zones]
  }

  function deleteObsolete () {
    return new Promise((resolve, reject) => {
      console.log('Deleting obsolete device records...')
      Device.destroy(
        { uid: { '!': deviceList().map(d => { return d.uid }) } }
      ).exec((err, records) => {
        if (err) {
          console.log('Error deleting obsolete device records')
          reject(err)
        }
        console.log(`Deleted ${records.length} obsolete device records`)
        resolve(records.length)
      })
    })
  }

  function createMissing () {
    return new Promise((resolve, reject) => {
      console.log('Creating missing device records...')
      Device.find().exec((err, devices) => {
        if (err) {
          console.log('Error loading existing device records')
          reject(err)
        }
        var missingDevices = deviceList().filter(dscDevice => {
          return !devices.find(record => {
            return record.uid === dscDevice.uid
          })
        })
        if (missingDevices.length === 0) {
          console.log('Created 0 missing device records')
          return resolve(0)
        }
        console.log(missingDevices.map(d => { return { uid: d.uid, type: d.type, name: d.name } }))
        Device.findOrCreate(
          missingDevices.map(d => { return { uid: d.uid } }),
          missingDevices.map(d => { return { uid: d.uid, type: d.type, name: d.name } })
        ).exec((err, records) => {
          if (err) {
            console.log('Error creating missing device records')
            reject(err)
          }
          console.log(`Created ${records.length} missing device records`)
          resolve(records.length)
        })
      })
    })
  }

  function updateExisting () {
    return new Promise((resolve, reject) => {
      console.log('Updating device names...')
      Device.find().exec((err, devices) => {
        if (err) {
          console.log('Error loading existing device records')
          reject(err)
        }
        var staleDevices = deviceList().filter(dscDevice => {
          var existingDevice = devices.find(record => {
            return record.uid === dscDevice.uid
          })
          return existingDevice.name !== dscDevice.name
        })
        var updatePromises = staleDevices.map(d => {
          return new Promise((resolve, reject) => {
            Device.update({ uid: d.uid }, { name: d.name }).exec((err, records) => {
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
          resolve(updated)
        }, reason => {
          reject(reason)
        })
      })
    })
  }

  function sendCurrentStatus () {
    return new Promise((resolve, reject) => {
      console.log('Sending current status of devices to SmartThings...')
      Device.find({
        isAdvertised: true,
        smartThingsToken: { '!': null },
        smartThingsAppCallbackURIs: { '!': null }
      }).exec((err, devices) => {
        if (err) {
          reject(err)
        }
        devices.forEach(device => {
          Device.findTyped({ id: device.id, type: device.type })
          .then(device => {
            device.sendSmartThingsUpdate()
          })
          .catch(err => {
            console.log('Error sending current status of devices to SmartThings')
            reject(err)
          })
        })
        console.log(`Sent current status of ${devices.length} devices to SmartThings`)
        resolve(devices.length)
      })
    })
  }

  async function synchronizeDevices () {
    await deleteObsolete()
    await createMissing()
    await updateExisting()
    await sendCurrentStatus()
  }

  return {
    configure: () => {
    },

    defaults: {
       __configKey__: {
          _hookTimeout: 60000
       }
    },

    initialize: (cb) => {
      sails.after('hook:alarmdecoder:loaded', async () => {
        await synchronizeDevices()
        return cb()
      })
    }
  }
}
