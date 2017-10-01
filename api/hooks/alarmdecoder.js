const AlarmDecoder = require('node-alarmdecoder')

const ALARMDECODER_SETTINGS = require('js-yaml')
                     .safeLoad(require('fs')
                     .readFileSync(process.env.SETTINGS_FILE, 'utf8'))
                     .alarmdecoder || {}

module.exports = (sails) => {
  var alarmDecoder

  return {
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

        alarmDecoder = new AlarmDecoder(
          ALARMDECODER_SETTINGS.address,
          ALARMDECODER_SETTINGS.port,
          ALARMDECODER_SETTINGS.zones
        )

        alarmDecoder.events.on('connected', () => {
          console.log('Connected to Alarm Decoder')
          cb()
        })

        alarmDecoder.events.on('disconnected', () => {
          console.log('Disconnected from Alarm Decoder')
        })

        alarmDecoder.events.on('zoneChanged', (data) => {
          if (data.zone.type === 'motion') {
            console.log('AlarmDecoder Motion: ' + (data.state ? '' : ' ended') + ' at ' + data.zone.name)
          } else if (data.zone.type === 'fire') {
            console.log('AlarmDecoder FIRE: ' + (data.state ? 'ON' : 'OFF') + ' @ ' + data.zone.name)
          } else if (data.zone.type === 'contact') {
            console.log('AlarmDecoder Contact: ' + data.zone.name + (data.state ? ' opened' : ' closed'))
          }
        })

        let lastMsg = ''
        alarmDecoder.events.on('keypadMessage', (data) => {
          let str = JSON.stringify(data)
          if (lastMsg !== str) { // log only changes
            lastMsg = str
            console.log('AlarmDecoder Keypad: ' + data.message)
          }
        })
      })
    }
  }
}
