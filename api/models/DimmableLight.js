var Device = require('./Device')

module.exports =  _.merge(_.cloneDeep(Device), {
  attributes: {
    status: function () {
      return this.isyDevice().getCurrentLightState() ? 'on' : 'off'
    },

    level: function () {
      return Math.round(this.isyDevice().getCurrentLightDimState())
    },

    getStatus: function () {
      return { status: this.status(), level: this.level() }
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
    },

    setLevel: function (level) {
      if (level < 1) {
        level = 0
      }
      if (level > 100) {
        level = 100
      }
      if (level === 0) {
        this.isyDevice().sendLightCommand(false, success => {})
      } else {
        this.isyDevice().sendLightDimCommand(level, success => {})
      }
      return { command: 'set_level', level: level }
    },

    brighten: function () {
      var level = Math.min(this.level() + 5, 100)
      this.isyDevice().sendLightDimCommand(level, success => {})
      return { command: 'brighten' }
    },

    dim: function () {
      var level = Math.max(this.level() - 5, 1)
      this.isyDevice().sendLightDimCommand(level, success => {})
      return { command: 'dim' }
    }
  }
})
