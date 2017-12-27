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

function processZoneEvent (data) {
  console.log(`[AlarmDecoder] Processing zone event for ${data.zone.name}`)
  console.log(data)
  var type
  var state
  if (data.zone.type === 'contact') {
    type = 'ContactZone'
  } else if (data.zone.type === 'motion') {
    type = 'MotionZone'
  } else if (data.zone.type === 'fire') {
    type = 'FireZone'
    return
  } else {
    return
  }
  Device.findTyped({ type: type, uid: data.zone.name })
  .then(device => {
    if (data.state === 0) {
      device.setState('inactive')
    } else if (data.state === 1) {
      device.setState('active')
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

    status: () => {
      return {
        ready: lastKeypadMessage.bits['Ready'],
        armed_stay: lastKeypadMessage.bits['Armed Home'],
        armed_away: lastKeypadMessage.bits['Armed Away']
      }
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
          lastKeypadMessage = data
        })
      })
    }
  }
}
