var camelCase = require('uppercamelcase')
const AlarmDecoder = require('node-alarmdecoder')
const QUEUE = require('queue')
const ALARMDECODER_SETTINGS = require('js-yaml')
                            .safeLoad(require('fs')
                            .readFileSync(process.env.SETTINGS_FILE, 'utf8'))
                            .alarmdecoder || {}
const ZONE_SETTINGS = require('js-yaml')
                    .safeLoad(require('fs')
                    .readFileSync(process.env.SETTINGS_FILE, 'utf8'))
                    .zones || {}

function getStatusFromKeypadMessage(data) {
  if (data.message === 'Exit Delay In Progress') {
    return 'in_exit_delay'
  } else if (data.message === 'Entry is Active Disarm System') {
    return 'in_entry_delay'
  } else if (data.bits['Ready']) {
    return 'disarmed'
  } else if (data.bits['Armed Home']) {
    return 'armed_stay'
  } else if (data.bits['Armed Away']) {
    return 'armed_away'
  } else {
    return null
  }
}

function processKeypadMessage (data) {
  console.log('[AlarmDecoder] Processing alarm event')
  console.log(data)
  var status = getStatusFromKeypadMessage(data)
  if (status == null) {
    console.log('[AlarmDecoder] Alarm status unknown')
    return
  }
  console.log(`[AlarmDecoder] Alarm status is ${status}`)
  Device.findTyped({ type: 'Partition', uid: 'partition_1' })
  .then(device => {
    device.updateState(status)
    device.sendSmartThingsUpdate()
  })
  .catch(err => {
    throw err
  })
}

function processZoneEvent (data) {
  console.log(`[AlarmDecoder] Processing zone event for ${data.zone.name}`)
  console.log(data)
  var type = `${camelCase(data.zone.type)}Zone`
  Device.findTyped({ type: type, uid: data.zone.name })
  .then(device => {
    if (data.zone.type === 'contact') {
      if (data.state === 0) {
        device.updateState('closed')
      } else if (data.state === 1) {
        device.updateState('open')
      }
    } else if (data.zone.type === 'motion') {
      if (data.state === 0) {
        device.updateState('inactive')
      } else if (data.state === 1) {
        device.updateState('active')
      }
    } else if (data.zone.type === 'fire') {
    }
    device.sendSmartThingsUpdate()
  })
  .catch(err => {
    throw err
  })
}

module.exports = (sails) => {
  var connection
  var lastKeypadMessage
  var eventQ

  return {
    sendKeys: (keys) => {
      connection.client.write(keys)
    },

    currentStatus: () => {
      var status = getStatusFromKeypadMessage(lastKeypadMessage)
      if (status == null) {
        return 'unknown'
      }
      return status
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
        console.log('Connecting to Alarm Decoder...')

        eventQ = QUEUE({ concurrency: 10 })

        IntervalTimerService.interval(() => {
          eventQ.start(err => {
            if (err) {
              throw err
            }
          })
        }, 100)

        var alarmDecoderZones = {}

        ZONE_SETTINGS.forEach(function (zoneAttrs) {
          var expander = String('00' + (Math.floor(zoneAttrs['number'] / 8))).slice(-2)
          var channel = String('00' + (zoneAttrs['number'] % 8)).slice(-2)
          alarmDecoderZones[`${expander}:${channel}`] = {
            type: zoneAttrs['type'],
            name: `zone_${zoneAttrs['number']}`
          }
        })

        connection = new AlarmDecoder(
          ALARMDECODER_SETTINGS.address,
          ALARMDECODER_SETTINGS.port,
          alarmDecoderZones
        )
        connection.events.on('connected', () => {
          console.log('Connected to Alarm Decoder')
          cb()
        })

        connection.events.on('disconnected', () => {
          console.log('Disconnected from Alarm Decoder')
        })

        connection.events.on('zoneChanged', (data) => {
          eventQ.push(() => {
            return new Promise((resolve, reject) => {
              processZoneEvent(data)
              resolve()
            })
          })
        })

        connection.events.on('keypadMessage', (data) => {
          if (JSON.stringify(lastKeypadMessage) !== JSON.stringify(data)) {
            lastKeypadMessage = data
            processKeypadMessage(data)
          }
        })
      })
    }
  }
}
