const net = require('net')
const QUEUE = require('queue')
const IT100_SETTINGS = require('js-yaml')
                       .safeLoad(require('fs')
                       .readFileSync(process.env.SETTINGS_FILE, 'utf8'))['it-100'] || {}
const ZONE_SETTINGS = require('js-yaml')
                    .safeLoad(require('fs')
                    .readFileSync(process.env.SETTINGS_FILE, 'utf8'))
                    .zones || {}

// Define the message terminator
const msgTerminator = '\r\n'

function processMessage (message) {
  console.log('Processing message ' + message)
  // Device.findTyped({ type: type, uid: uid })
  // .then(device => {
  //   device.sendSmartThingsUpdate()
  // })
  // .catch(err => {
  //   throw err
  // })
}

module.exports = (sails) => {
  var socket
  var buffer
  var eventQ

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
        console.log('Connecting to DSC IT-100 alarm panel module...')

        eventQ = QUEUE({ concurrency: 10 })

        IntervalTimerService.interval(() => {
          eventQ.start(err => {
            if (err) {
              throw err
            }
          })
        }, 100)

        socket = new net.Socket()

        socket.connect(IT100_SETTINGS.port, IT100_SETTINGS.address, () => {
          console.log('Connected to DSC IT-100 alarm panel module')
          return cb()
        })

        socket.on('connect', () => {
          buffer = Buffer.alloc(0)
        })

        socket.on('data', data => {
          buffer += data
          var terminatorIndex = buffer.indexOf(msgTerminator)
          while (terminatorIndex !== -1) {
            var msg = buffer.slice(0, terminatorIndex)
            eventQ.push(() => {
              return new Promise((resolve, reject) => {
                processMessage(msg)
                resolve()
              })
            })
            buffer = buffer.slice(terminatorIndex + msgTerminator.length)
            terminatorIndex = buffer.indexOf(msgTerminator)
          }
        })

        socket.on('close', () => {
          console.log('Disconnected from DSC IT-100 alarm panel module')
        })
      })
    }
  }
}
