var Device = require('./Device')

module.exports =  _.merge(_.cloneDeep(Device), {
  attributes: {
    status: function () {
      return this.isyDevice().getCurrentLightState() ? 'on' : 'off'
    },

    getStatus: function () {
      return { status: this.status() }
    },

    refreshStatus: function () {
      this.sendSmartThingsUpdate()
      return { command: 'refresh_status' }
    },

    turnOn: function () {
      this.isyDevice().sendLightCommand(true, success => {})
      return { command: 'turn_on' }
    },

    turnOff: function () {
      this.isyDevice().sendLightCommand(false, success => {})
      return { command: 'turn_off' }
    }
  }
})
