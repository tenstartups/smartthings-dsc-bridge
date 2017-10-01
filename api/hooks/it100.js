var net = require('net')

// Define the message terminator
const msgTerminator = '\r\n'

const IT100_SETTINGS = require('js-yaml')
                       .safeLoad(require('fs')
                       .readFileSync(process.env.SETTINGS_FILE, 'utf8'))['it-100'] || {}

module.exports = (sails) => {
  var socket
  var buffer

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
            console.log('IT-100 Message: ' + msg)
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
