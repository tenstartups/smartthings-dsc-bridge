var Device = require('./Device')

module.exports =  _.merge(_.cloneDeep(Device), {
  attributes: {
    currentState: function () {
      switch (this.isyDevice().getCurrentFanState()) {
        case 'Off':
          return { status: 'off' }
        case 'Low':
          return { status: 'low' }
        case 'Medium':
          return { status: 'medium' }
        case 'High':
          return { status: 'high' }
      }
    },

    turnOff: function () {
      return this.sendCommand('off', 'Off')
    },

    setLow: function () {
      return this.sendCommand('low', 'Low')
    },

    setMedium: function () {
      return this.sendCommand('medium', 'Medium')
    },

    setHigh: function () {
      return this.sendCommand('high', 'High')
    },

    sendCommand: function (commandCode, fanCommand) {
      return new Promise((resolve, reject) => {
        this.isyDevice().sendFanCommand(fanCommand, success => {
          console.log(Object.assign({ command: commandCode, success: success }, this.currentState()))
          resolve(Object.assign({ command: commandCode, success: success }, this.currentState()))
        })
      })
    }
  }
})
